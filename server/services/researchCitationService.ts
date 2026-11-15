import { ResearchPaper, CitationStyle, ResearchCitation } from '../models/researchGitHubTypes';
import { db } from '../db/database';
import { NotFoundError } from '../core/exceptions';

export class ResearchCitationService {
  /**
   * Format citation in APA, IEEE, MLA, or BibTeX.
   * Only saved metadata is used. A missing author, year or venue is left out (APA "n.d." for no year),
   * never filled with a placeholder name, the current year or a made-up venue.
   */
  public static formatCitation(paper: ResearchPaper, style: CitationStyle): string {
    const authors = (paper.authors || []).map((a) => String(a).trim()).filter(Boolean);
    const year = paper.publication_year ? String(paper.publication_year) : '';
    const title = (paper.title || '').trim() || '[Title missing]';
    const venue = (paper.venue || '').trim();
    const doiPart = paper.doi ? ` https://doi.org/${paper.doi}` : '';

    if (style === 'APA') {
      const authorAPA =
        authors.length === 0
          ? ''
          : authors.length === 1
          ? authors[0]
          : authors.length === 2
          ? `${authors[0]} & ${authors[1]}`
          : `${authors[0]}, et al.`;
      // APA puts the title first when there is no author.
      const head = authorAPA ? `${authorAPA} (${year || 'n.d.'}). ${title}.` : `${title}. (${year || 'n.d.'}).`;
      return `${head}${venue ? ` ${venue}.` : ''}${doiPart}`;
    }

    if (style === 'IEEE') {
      const authorIEEE = authors.length === 0 ? '' : authors.length <= 3 ? authors.join(', ') : `${authors[0]} et al.`;
      const more = Boolean(venue || year);
      return `${authorIEEE ? `${authorIEEE}, ` : ''}"${title}${more ? ',' : '.'}"${venue ? ` in ${venue}${year ? ',' : '.'}` : ''}${year ? ` ${year}.` : ''}${paper.doi ? ` doi: ${paper.doi}.` : ''}`;
    }

    if (style === 'MLA') {
      const authorMLA = authors.length === 0 ? '' : authors.length > 2 ? `${authors[0]}, et al.` : authors.join(', and ');
      const bits = [authorMLA ? `${authorMLA}.` : '', `"${title}."`, venue ? `${venue}${year ? ',' : '.'}` : '', year ? `${year}.` : ''].filter(Boolean);
      return `${bits.join(' ')}${doiPart}`;
    }

    // BIBTEX
    return this.toBibTeX(paper);
  }

  /**
   * Generate a BibTeX record. Fields that are not known are left out instead of filled with defaults.
   */
  public static toBibTeX(paper: ResearchPaper): string {
    const authors = (paper.authors || []).filter(Boolean);
    const firstAuthor = authors[0]?.split(' ').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'untitled';
    const titleWord = (paper.title || '').toLowerCase().split(/\s+/).find((w) => w.replace(/[^a-z]/g, '').length > 3)?.replace(/[^a-z]/g, '') || '';
    const cleanKey = `${firstAuthor}${paper.publication_year || ''}${titleWord}`;
    const fields: string[] = [`  title={${paper.title || ''}}`];
    if (authors.length) fields.push(`  author={${authors.join(' and ')}}`);
    if (paper.venue) fields.push(`  journal={${paper.venue}}`);
    if (paper.publication_year) fields.push(`  year={${paper.publication_year}}`);
    if (paper.doi) fields.push(`  doi={${paper.doi}}`);
    if (paper.url) fields.push(`  url={${paper.url}}`);
    return `@article{${cleanKey},\n${fields.join(',\n')}\n}`;
  }

  /**
   * Generate single citation for a paper
   */
  public static async generateCitation(
    paperId: string,
    studentId: string,
    style: CitationStyle = 'APA',
    projectId?: string
  ): Promise<ResearchCitation> {
    const paper = await db.getResearchPaperById(paperId, studentId);
    if (!paper) {
      throw new NotFoundError(`Research paper '${paperId}' not found`);
    }
    // The citation always goes into the paper's own project (the URL project id was not owner-checked).
    if (projectId && projectId !== paper.research_project_id) {
      throw new NotFoundError(`Research paper '${paperId}' is not in this project`);
    }

    const formatted = this.formatCitation(paper, style);
    const bibtex = this.toBibTeX(paper);

    const citation: ResearchCitation = {
      id: `cite_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      research_project_id: paper.research_project_id,
      paper_id: paper.id,
      source_type: 'PAPER',
      citation_style: style,
      formatted_citation: formatted,
      bibtex,
      metadata: {
        title: paper.title,
        authors: paper.authors,
        year: paper.publication_year,
        venue: paper.venue,
        doi: paper.doi,
        url: paper.url,
      },
      created_at: new Date().toISOString(),
    };

    if (projectId || paper.research_project_id) {
      await db.saveResearchCitation(citation);
    }

    return citation;
  }

  /**
   * Assemble full bibliography
   */
  public static async generateBibliography(
    projectIdOrCitations: string | ResearchCitation[],
    studentId?: string,
    style: CitationStyle = 'APA'
  ): Promise<string> {
    let citations: ResearchCitation[] = [];

    if (Array.isArray(projectIdOrCitations)) {
      citations = projectIdOrCitations;
    } else {
      if (!studentId) {
        citations = [];
      } else {
        citations = await db.getResearchCitations(projectIdOrCitations, studentId);
      }
    }

    if (citations.length === 0) return 'No citations in bibliography.';
    return citations.map((c, idx) => `[${idx + 1}] ${c.formatted_citation}`).join('\n\n');
  }

  /**
   * Export all citations as single BibTeX block
   */
  public static async generateBibTeX(
    projectIdOrCitations: string | ResearchCitation[],
    studentId?: string
  ): Promise<string> {
    let citations: ResearchCitation[] = [];

    if (Array.isArray(projectIdOrCitations)) {
      citations = projectIdOrCitations;
    } else {
      if (!studentId) {
        citations = [];
      } else {
        citations = await db.getResearchCitations(projectIdOrCitations, studentId);
      }
    }

    return citations.map((c) => c.bibtex).filter(Boolean).join('\n\n');
  }

  public static exportBibTeX(citations: ResearchCitation[]): string {
    return citations.map((c) => c.bibtex).filter(Boolean).join('\n\n');
  }
}

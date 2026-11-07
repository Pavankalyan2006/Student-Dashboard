import { ResearchPaper, CitationStyle, ResearchCitation } from '../models/researchGitHubTypes';
import { db } from '../db/database';
import { NotFoundError } from '../core/exceptions';

export class ResearchCitationService {
  /**
   * Format citation in APA, IEEE, MLA, or BibTeX
   */
  public static formatCitation(paper: ResearchPaper, style: CitationStyle): string {
    const authors = paper.authors || ['Academic Contributor'];
    const year = paper.publication_year || new Date().getFullYear();
    const title = paper.title || 'Untitled Research Paper';
    const venue = paper.venue || 'Academic Proceedings';
    const doiPart = paper.doi ? ` https://doi.org/${paper.doi}` : '';

    if (style === 'APA') {
      const authorAPA =
        authors.length === 1
          ? authors[0]
          : authors.length === 2
          ? `${authors[0]} & ${authors[1]}`
          : `${authors[0]}, et al.`;
      return `${authorAPA} (${year}). ${title}. ${venue}.${doiPart}`;
    }

    if (style === 'IEEE') {
      const authorIEEE =
        authors.length === 1
          ? authors[0]
          : authors.length <= 3
          ? authors.join(', ')
          : `${authors[0]} et al.`;
      return `${authorIEEE}, "${title}," in ${venue}, ${year}.${paper.doi ? ` doi: ${paper.doi}.` : ''}`;
    }

    if (style === 'MLA') {
      const authorMLA = authors.length > 2 ? `${authors[0]}, et al.` : authors.join(', and ');
      return `${authorMLA}. "${title}." ${venue}, ${year}.${doiPart}`;
    }

    // BIBTEX
    return this.toBibTeX(paper);
  }

  /**
   * Generate valid BibTeX record
   */
  public static toBibTeX(paper: ResearchPaper): string {
    const firstAuthor = paper.authors[0]?.split(' ').pop()?.toLowerCase() || 'paper';
    const cleanKey = `${firstAuthor}${paper.publication_year || 2024}`;
    const authorBib = (paper.authors || []).join(' and ');

    return `@article{${cleanKey},
  title={${paper.title}},
  author={${authorBib}},
  journal={${paper.venue}},
  year={${paper.publication_year || 2024}}${paper.doi ? `,\n  doi={${paper.doi}}` : ''}${paper.url ? `,\n  url={${paper.url}}` : ''}
}`;
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

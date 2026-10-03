import { ResearchService } from './researchService';
import { ResearchCitationService } from './researchCitationService';

export class ResearchExportService {
  /**
   * Export comprehensive academic research proposal in clean Markdown
   */
  public static async exportProposal(projectId: string, studentId: string): Promise<string> {
    const project = await ResearchService.getProject(projectId, studentId);
    const questions = await ResearchService.listQuestions(projectId, studentId);
    const gaps = await ResearchService.listGaps(projectId, studentId);
    const methodology = await ResearchService.getMethodology(projectId, studentId);
    const review = await ResearchService.getLiteratureReview(projectId, studentId);
    const citations = await ResearchService.listCitations(projectId, studentId);

    let md = `# Research Proposal: ${project.title}\n\n`;
    md += `**Topic:** ${project.topic}  \n`;
    md += `**Domain:** ${project.domain}  \n`;
    md += `**Branch:** ${project.branch}  \n`;
    md += `**Research Type:** ${project.research_type}  \n`;
    md += `**Date:** ${new Date().toLocaleDateString()}  \n\n`;

    md += `## 1. Research Objective & Problem Statement\n\n`;
    md += `${project.objective}\n\n`;

    if (questions.length > 0) {
      md += `## 2. Research Questions\n\n`;
      questions.forEach((q, i) => {
        md += `${i + 1}. **[${q.category}]** ${q.question} *(Status: ${q.status})*\n`;
      });
      md += `\n`;
    }

    if (gaps.length > 0) {
      md += `## 3. Identified Research Gaps\n\n`;
      gaps.forEach((g, i) => {
        md += `### Gap ${i + 1}: ${g.category}\n`;
        md += `${g.description}\n\n`;
        if (g.evidence.length > 0) {
          md += `*Supporting Evidence:*\n`;
          g.evidence.forEach((e) => (md += `- ${e}\n`));
          md += `\n`;
        }
      });
    }

    if (review && review.sections.length > 0) {
      md += `## 4. Literature Review Summary\n\n`;
      review.sections.forEach((sec) => {
        md += `### ${sec.title}\n\n${sec.content}\n\n`;
      });
    }

    if (methodology) {
      md += `## 5. Proposed Methodology & System Architecture\n\n`;
      md += `*Note: This represents the proposed engineering design prior to laboratory verification.*\n\n`;
      md += `**System Architecture:**\n${methodology.system_architecture}\n\n`;
      md += `**Experimental Design:**\n${methodology.experimental_design}\n\n`;
      md += `**Dataset & Preprocessing Plan:**\n${methodology.dataset_plan}\n\n`;
      if (methodology.evaluation_metrics.length > 0) {
        md += `**Target Evaluation Metrics:** ${methodology.evaluation_metrics.join(', ')}\n\n`;
      }
      if (methodology.reproducibility_checklist.length > 0) {
        md += `**Reproducibility Checklist:**\n`;
        methodology.reproducibility_checklist.forEach((item) => (md += `- [ ] ${item}\n`));
        md += `\n`;
      }
    }

    if (citations.length > 0) {
      md += `## 6. References & Bibliography\n\n`;
      md += ResearchCitationService.generateBibliography(citations, 'APA');
      md += `\n\n`;
      md += `### BibTeX Export\n\n\`\`\`bibtex\n${ResearchCitationService.exportBibTeX(citations)}\n\`\`\`\n`;
    }

    return md;
  }

  public static async exportResearchProposal(projectId: string, studentId: string): Promise<string> {
    return this.exportProposal(projectId, studentId);
  }

  /**
   * Export structured Evidence Matrix as Markdown Table
   */
  public static async exportEvidenceMatrix(projectId: string, studentId: string): Promise<string> {
    const matrix = await ResearchService.getEvidenceMatrix(projectId, studentId);
    let md = `| Paper | Year | Authors | Methodology | Dataset | Identified Gap |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    matrix.forEach((r) => {
      md += `| **${r.paper_title}** | ${r.year} | ${r.authors} | ${r.method} | ${r.dataset} | ${r.research_gap} |\n`;
    });
    return md;
  }
}

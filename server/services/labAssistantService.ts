// server/services/labAssistantService.ts
// Service handling laboratories, manual extraction, experiment workspace, safe code/SQL execution, viva evaluation, and report generation

import { db } from '../db/database';
import {
  LabCourse,
  LabManual,
  LabExperimentDetail,
  ProcedureStepItem,
  VivaQuestionItem,
  ObservationTable,
  LabReportData,
  StudentLabAnalytics,
  LabType,
} from '../models/labAssistantTypes';
import { ValidationError, NotFoundError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';
import { DocumentParserRegistry } from '../parsers';
import { CodingService } from './coding';
import { SqlLabSandboxService } from './sqlLabSandboxService';
import { AIService } from '../ai/service';
import { LearningModulesService } from './learningModulesService';

export class LabAssistantService {
  // ==========================================
  // 1. Laboratory Courses CRUD
  // ==========================================
  public static async createLab(
    studentId: string,
    data: {
      name: string;
      subject: string;
      semester: number | string;
      course_code?: string;
      department?: string;
      branch?: string;
      university_or_college?: string;
      academic_year?: string;
      faculty_name?: string;
      description?: string;
      lab_type?: LabType;
      tools_or_languages?: string;
      manual_title?: string;
      additional_instructions?: string;
    }
  ): Promise<LabCourse> {
    const name = (data.name || '').trim();
    const subject = (data.subject || '').trim();
    const semesterNum = Number(data.semester);

    if (!name) throw new ValidationError('Laboratory name is required');
    if (!subject) throw new ValidationError('Subject name is required');
    if (!semesterNum || semesterNum < 1 || semesterNum > 10) {
      throw new ValidationError('Valid semester between 1 and 10 is required');
    }

    const labId = `lab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newLab: LabCourse = {
      id: labId,
      student_id: studentId,
      name,
      title: name,
      subject,
      course_code: (data.course_code || '').trim() || `${subject.substring(0, 3).toUpperCase()}${semesterNum}01`,
      semester: semesterNum,
      branch: (data.branch || data.department || 'Computer Science & Engineering').trim(),
      department: (data.department || data.branch || 'Computer Science & Engineering').trim(),
      university_or_college: (data.university_or_college || '').trim(),
      academic_year: (data.academic_year || '2026-2027').trim(),
      faculty_name: (data.faculty_name || '').trim(),
      description: (data.description || '').trim(),
      lab_type: data.lab_type || 'PROGRAMMING',
      tools_or_languages: (data.tools_or_languages || '').trim(),
      manual_title: (data.manual_title || '').trim(),
      additional_instructions: (data.additional_instructions || '').trim(),
      experiments_count: 0,
      completed_experiments_count: 0,
      in_progress_experiments_count: 0,
      created_at: now,
      updated_at: now,
    };

    const saved = await db.saveLabCourse(newLab);
    logger.info(`LabAssistantService: Created lab course ${labId} for student ${studentId}`);
    return saved;
  }

  public static async getLabs(studentId: string): Promise<LabCourse[]> {
    const list = await db.getLabCourses(studentId);
    return list;
  }

  public static async getLabById(studentId: string, labId: string): Promise<LabCourse> {
    const lab = await db.getLabCourseById(labId, studentId);
    if (!lab) {
      throw new NotFoundError(`Laboratory course '${labId}' not found or access denied`);
    }
    const experiments = await db.getLabExperiments(labId, studentId);
    return {
      ...lab,
      experiments,
      experiments_count: experiments.length,
      completed_experiments_count: experiments.filter((e) => e.status === 'COMPLETED').length,
      in_progress_experiments_count: experiments.filter((e) => e.status === 'IN_PROGRESS').length,
    };
  }

  public static async updateLab(
    studentId: string,
    labId: string,
    updates: Partial<LabCourse>
  ): Promise<LabCourse> {
    const existing = await db.getLabCourseById(labId, studentId);
    if (!existing) {
      throw new NotFoundError(`Laboratory course '${labId}' not found or access denied`);
    }

    const updated: LabCourse = {
      ...existing,
      ...updates,
      id: existing.id,
      student_id: existing.student_id,
      name: updates.name ? updates.name.trim() : existing.name,
      title: updates.name ? updates.name.trim() : existing.name,
      subject: updates.subject ? updates.subject.trim() : existing.subject,
      semester: updates.semester ? Number(updates.semester) : existing.semester,
      updated_at: new Date().toISOString(),
    };

    return db.saveLabCourse(updated);
  }

  public static async deleteLab(studentId: string, labId: string): Promise<boolean> {
    const existing = await db.getLabCourseById(labId, studentId);
    if (!existing) {
      throw new NotFoundError(`Laboratory course '${labId}' not found or access denied`);
    }
    return db.deleteLabCourse(labId, studentId);
  }

  // ==========================================
  // 2. Manual Entry & Management
  // ==========================================
  public static async saveManualDetails(
    studentId: string,
    labId: string,
    manualData: {
      title: string;
      subject: string;
      course_code?: string;
      semester: number | string;
      department?: string;
      lab_type?: LabType;
      tools?: string;
      description?: string;
      instructions?: string;
    },
    experimentsData: Partial<LabExperimentDetail>[]
  ): Promise<{ manual: LabManual; experiments: LabExperimentDetail[] }> {
    const lab = await db.getLabCourseById(labId, studentId);
    if (!lab) {
      throw new NotFoundError(`Laboratory '${labId}' not found`);
    }

    const title = (manualData.title || '').trim();
    if (!title) throw new ValidationError('Manual title is required');

    const manualId = lab.manual_id || `man_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const manual: LabManual = {
      id: manualId,
      lab_id: labId,
      student_id: studentId,
      title,
      subject: (manualData.subject || lab.subject).trim(),
      course_code: (manualData.course_code || lab.course_code).trim(),
      semester: Number(manualData.semester) || lab.semester,
      department: (manualData.department || lab.department).trim(),
      lab_type: manualData.lab_type || lab.lab_type,
      tools: (manualData.tools || lab.tools_or_languages).trim(),
      description: (manualData.description || '').trim(),
      instructions: (manualData.instructions || '').trim(),
      is_draft: false,
      version: 1,
      created_at: now,
      updated_at: now,
    };

    const savedManual = await db.saveLabManual(manual);

    // Save experiments
    const savedExperiments: LabExperimentDetail[] = [];
    let expNumber = 1;

    for (const exp of experimentsData) {
      const expTitle = (exp.title || '').trim();
      if (!expTitle) continue;

      const expId = exp.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${expNumber}`;
      
      // Parse procedure steps into structured checklist items
      let procedureSteps: ProcedureStepItem[] = [];
      if (Array.isArray(exp.procedure_steps) && exp.procedure_steps.length > 0) {
        procedureSteps = exp.procedure_steps.map((st, idx) => ({
          id: st.id || `step_${expId}_${idx + 1}`,
          step_number: idx + 1,
          text: (st.text || '').trim(),
          is_completed: !!st.is_completed,
        }));
      } else if (Array.isArray(exp.procedure) && exp.procedure.length > 0) {
        procedureSteps = exp.procedure.map((stepText, idx) => ({
          id: `step_${expId}_${idx + 1}`,
          step_number: idx + 1,
          text: stepText.trim(),
          is_completed: false,
        }));
      } else {
        procedureSteps = [
          { id: `step_${expId}_1`, step_number: 1, text: 'Review experiment objective and theory', is_completed: false },
          { id: `step_${expId}_2`, step_number: 2, text: 'Inspect requirements and setup environment', is_completed: false },
          { id: `step_${expId}_3`, step_number: 3, text: 'Implement and execute solution', is_completed: false },
          { id: `step_${expId}_4`, step_number: 4, text: 'Verify output against expected results', is_completed: false },
          { id: `step_${expId}_5`, step_number: 5, text: 'Record observation and conclusion', is_completed: false },
        ];
      }

      // Format viva questions
      const vivaQuestions: VivaQuestionItem[] = Array.isArray(exp.viva_questions)
        ? exp.viva_questions.map((vq, vIdx) => ({
            id: vq.id || `vq_${expId}_${vIdx + 1}`,
            question: (vq.question || '').trim(),
            expected_concept: (vq.expected_concept || '').trim(),
            difficulty: vq.difficulty || 'INTERMEDIATE',
            student_answer: vq.student_answer || '',
            ai_evaluation: vq.ai_evaluation,
          }))
        : [];

      const expDetail: LabExperimentDetail = {
        id: expId,
        lab_id: labId,
        student_id: studentId,
        experiment_number: exp.experiment_number || expNumber,
        title: expTitle,
        aim: (exp.aim || exp.objective || '').trim(),
        objective: (exp.aim || exp.objective || '').trim(),
        problem_statement: (exp.problem_statement || '').trim(),
        theory: (exp.theory || '').trim(),
        prerequisites: Array.isArray(exp.prerequisites) ? exp.prerequisites : [],
        requirements: Array.isArray(exp.requirements) ? exp.requirements : ['Standard laboratory computer', 'Compiler / Runtime'],
        required_software: Array.isArray(exp.required_software) ? exp.required_software : [],
        required_hardware: Array.isArray(exp.required_hardware) ? exp.required_hardware : [],
        required_libraries: Array.isArray(exp.required_libraries) ? exp.required_libraries : [],
        procedure_steps: procedureSteps,
        procedure: procedureSteps.map((s) => s.text),
        algorithm: (exp.algorithm || '').trim(),
        implementation_code: (exp.implementation_code || exp.source_code || '').trim(),
        source_code: (exp.implementation_code || exp.source_code || '').trim(),
        code_language: (exp.code_language || 'python').toLowerCase(),
        expected_output: (exp.expected_output || '').trim(),
        sample_input: (exp.sample_input || '').trim(),
        sample_output: (exp.sample_output || '').trim(),
        actual_output: exp.actual_output || '',
        execution_status: exp.execution_status || 'UNTESTED',
        result_conclusion: (exp.result_conclusion || exp.conclusion || '').trim(),
        conclusion: (exp.result_conclusion || exp.conclusion || '').trim(),
        viva_questions: vivaQuestions,
        references: Array.isArray(exp.references) ? exp.references : [],
        faculty_notes: (exp.faculty_notes || '').trim(),
        student_notes: (exp.student_notes || '').trim(),
        observation_table: exp.observation_table || { headers: [], rows: [] },
        status: exp.status || 'NOT_STARTED',
        created_at: exp.created_at || now,
        updated_at: now,
      };

      const savedExp = await db.saveLabExperiment(expDetail);
      savedExperiments.push(savedExp);
      expNumber++;
    }

    return { manual: savedManual, experiments: savedExperiments };
  }

  // ==========================================
  // 3. Document Upload & Extraction
  // ==========================================
  public static async uploadAndExtractManual(
    studentId: string,
    labId: string,
    bufferOrBase64: Buffer | string,
    mimetype: string,
    filename: string
  ): Promise<{
    raw_text: string;
    page_count: number;
    extracted_metadata: {
      title: string;
      subject: string;
      course_code?: string;
      department?: string;
    };
    candidate_experiments: Partial<LabExperimentDetail>[];
  }> {
    const lab = await db.getLabCourseById(labId, studentId);
    if (!lab) {
      throw new NotFoundError(`Laboratory '${labId}' not found`);
    }

    const ext = filename.split('.').pop() || '';
    logger.info(`LabAssistantService: Parsing uploaded manual document ${filename} (${mimetype})`);

    const rawContentStr = typeof bufferOrBase64 === 'string'
      ? (bufferOrBase64.startsWith('data:')
          ? Buffer.from(bufferOrBase64.split(',')[1] || '', 'base64').toString('utf8')
          : bufferOrBase64)
      : bufferOrBase64.toString('utf8');

    if (!rawContentStr.trim() || rawContentStr.trim().length === 0) {
      throw new ValidationError(
        'Could not extract text from uploaded document. If scanned or protected, please use Manual Entry or copy-paste text.'
      );
    }

    const parsed = await DocumentParserRegistry.parse(bufferOrBase64, mimetype, ext, { filename });
    const fullText = parsed.text || parsed.pages?.map((p: any) => p.text).join('\n\n') || '';
    const pageCount = parsed.pages?.length || parsed.pageCount || 1;

    if (!fullText.trim()) {
      throw new ValidationError(
        'Could not extract text from uploaded document. If scanned or protected, please use Manual Entry or copy-paste text.'
      );
    }

    // Heuristically segment the manual text into structured candidate experiments
    const candidateExperiments = this.segmentManualText(fullText, lab.subject);

    // Save manual record with source metadata
    const manualId = `man_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const byteSize = typeof bufferOrBase64 === 'string' ? Buffer.byteLength(bufferOrBase64, 'utf8') : bufferOrBase64.length;

    const manual: LabManual = {
      id: manualId,
      lab_id: labId,
      student_id: studentId,
      title: filename.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' '),
      subject: lab.subject,
      course_code: lab.course_code,
      semester: lab.semester,
      department: lab.department,
      lab_type: lab.lab_type,
      tools: lab.tools_or_languages,
      description: `Uploaded laboratory manual document: ${filename}`,
      extracted_raw_text: fullText.substring(0, 50000), // Persist head preview
      source_file: {
        filename,
        mimetype,
        size_bytes: byteSize,
        uploaded_at: now,
        text_length: fullText.length,
        page_count: pageCount,
      },
      is_draft: true,
      version: 1,
      created_at: now,
      updated_at: now,
    };

    await db.saveLabManual(manual);

    return {
      raw_text: fullText.substring(0, 10000), // Preview length
      page_count: pageCount,
      extracted_metadata: {
        title: manual.title,
        subject: lab.subject,
        course_code: lab.course_code,
        department: lab.department,
      },
      candidate_experiments: candidateExperiments,
    };
  }

  // Heuristic rule-based text segmenter for academic lab manuals
  private static segmentManualText(text: string, defaultSubject: string): Partial<LabExperimentDetail>[] {
    const experiments: Partial<LabExperimentDetail>[] = [];
    const lines = text.split('\n');

    // Split text by experiment markers: "Experiment 1", "Exp 1", "Experiment No.", "LAB EXERCISE 1", etc.
    const expRegex = /^(?:experiment|exp|exercise|lab\s+session|assignment|program)\s*(?:no\.?|#)?\s*([0-9]+|[ivxlcdm]+)[\s:\-\.]+(.*)$/i;
    
    let currentExp: Partial<LabExperimentDetail> | null = null;
    let currentSection: 'aim' | 'theory' | 'procedure' | 'algorithm' | 'code' | 'output' | 'viva' | 'conclusion' | null = null;
    let collectedSectionLines: string[] = [];

    const flushSection = () => {
      if (!currentExp || !currentSection || collectedSectionLines.length === 0) return;
      const content = collectedSectionLines.join('\n').trim();
      if (!content) return;

      if (currentSection === 'aim') {
        currentExp.aim = content;
        currentExp.objective = content;
      } else if (currentSection === 'theory') {
        currentExp.theory = content;
      } else if (currentSection === 'procedure') {
        currentExp.procedure = content.split('\n').map((l) => l.replace(/^[0-9\-\*\•\.]+\s*/, '').trim()).filter(Boolean);
      } else if (currentSection === 'algorithm') {
        currentExp.algorithm = content;
      } else if (currentSection === 'code') {
        currentExp.implementation_code = content;
        currentExp.source_code = content;
      } else if (currentSection === 'output') {
        currentExp.expected_output = content;
      } else if (currentSection === 'conclusion') {
        currentExp.result_conclusion = content;
        currentExp.conclusion = content;
      } else if (currentSection === 'viva') {
        // Parse viva question bullet lines
        const vqLines = content.split('\n').filter((l) => l.trim().length > 5);
        currentExp.viva_questions = vqLines.slice(0, 5).map((qLine, idx) => ({
          id: `vq_ext_${idx + 1}`,
          question: qLine.replace(/^[0-9\-\*\•\.]+\s*/, '').trim(),
          expected_concept: 'Key conceptual principle covered in this practical experiment.',
          difficulty: 'INTERMEDIATE',
        }));
      }
      collectedSectionLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(expRegex);

      if (match) {
        flushSection();
        if (currentExp && currentExp.title) {
          experiments.push(currentExp);
        }

        const expNum = parseInt(match[1], 10) || experiments.length + 1;
        const expTitle = match[2]?.trim() || `Experiment ${expNum}`;

        currentExp = {
          experiment_number: expNum,
          title: expTitle,
          aim: '',
          theory: '',
          procedure: [],
          requirements: ['Standard Lab Hardware', 'Compiler/IDE'],
          algorithm: '',
          implementation_code: '',
          expected_output: '',
          result_conclusion: '',
          viva_questions: [],
          status: 'NOT_STARTED',
        };
        currentSection = null;
        continue;
      }

      // Check section keywords
      const lower = line.toLowerCase();
      if (/^(aim|objective|problem statement)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'aim';
        collectedSectionLines.push(line.replace(/^(aim|objective|problem statement)[\s:\-\.]/i, '').trim());
      } else if (/^(theory|background|concept)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'theory';
        collectedSectionLines.push(line.replace(/^(theory|background|concept)[\s:\-\.]/i, '').trim());
      } else if (/^(procedure|steps|methodology)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'procedure';
      } else if (/^(algorithm)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'algorithm';
      } else if (/^(program|source code|code)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'code';
      } else if (/^(expected output|output|sample output)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'output';
      } else if (/^(result|conclusion)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'conclusion';
      } else if (/^(viva questions|viva voce|oral questions)[\s:\-\.]/i.test(lower)) {
        flushSection();
        currentSection = 'viva';
      } else if (currentSection) {
        collectedSectionLines.push(line);
      }
    }

    flushSection();
    if (currentExp && currentExp.title) {
      experiments.push(currentExp);
    }

    // If text didn't match structured experiment headers, create a single default candidate
    if (experiments.length === 0) {
      experiments.push({
        experiment_number: 1,
        title: `${defaultSubject} Practical Experiment 1`,
        aim: text.slice(0, 300).trim(),
        theory: 'Review the theory from the uploaded manual document.',
        procedure: [
          'Review the objective and instructions from the manual.',
          'Prepare software environment and dependencies.',
          'Execute the laboratory tasks.',
          'Verify and record output results.',
        ],
        requirements: ['Personal Computer', 'Lab Software'],
        viva_questions: [
          {
            id: 'vq_1',
            question: `What is the core working principle of ${defaultSubject}?`,
            expected_concept: 'Fundamental theoretical framework.',
            difficulty: 'INTERMEDIATE',
          },
        ],
        status: 'NOT_STARTED',
      });
    }

    return experiments;
  }

  // ==========================================
  // 4. AI-Powered Manual Structuring
  // ==========================================
  public static async processManualWithAi(
    studentId: string,
    labId: string,
    rawText: string,
    instructions?: string
  ): Promise<Partial<LabExperimentDetail>[]> {
    const lab = await db.getLabCourseById(labId, studentId);
    if (!lab) throw new NotFoundError(`Laboratory '${labId}' not found`);

    try {
      const prompt = `You are a Senior University Laboratory Instructor for B.Tech ${lab.subject}.
Extract and organize the following laboratory manual text into an array of structured experiments in valid JSON.
Instructions: ${instructions || 'Organize into clear experiment aims, theory, step-by-step procedures, code, expected output, and 2 viva questions each.'}

Raw Manual Text:
${rawText.slice(0, 6000)}

Output ONLY valid JSON with this shape:
{
  "experiments": [
    {
      "experiment_number": 1,
      "title": "Title",
      "aim": "Aim of the experiment",
      "theory": "Core theoretical background",
      "requirements": ["Requirement 1", "Requirement 2"],
      "procedure": ["Step 1", "Step 2", "Step 3"],
      "implementation_code": "// Optional code",
      "code_language": "python",
      "expected_output": "Expected terminal or display output",
      "result_conclusion": "Verified practical outcome",
      "viva_questions": [
        { "question": "Question 1?", "expected_concept": "Concept 1", "difficulty": "BASIC" },
        { "question": "Question 2?", "expected_concept": "Concept 2", "difficulty": "INTERMEDIATE" }
      ]
    }
  ]
}`;

      const aiResponse = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.2);

      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.experiments) && parsed.experiments.length > 0) {
          return parsed.experiments.map((e: any, idx: number) => ({
            ...e,
            experiment_number: e.experiment_number || idx + 1,
            status: 'NOT_STARTED',
          }));
        }
      }
    } catch (err: any) {
      logger.warn('AI manual structuring failed, falling back to heuristic parsing', err);
    }

    // Heuristic fallback
    return this.segmentManualText(rawText, lab.subject);
  }

  // ==========================================
  // 5. Experiment Workspace & Execution
  // ==========================================
  public static async getExperimentDetails(studentId: string, expId: string): Promise<LabExperimentDetail> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found or access denied`);
    return exp;
  }

  public static async executeCode(
    studentId: string,
    expId: string,
    code: string,
    language: string,
    stdin?: string
  ): Promise<{
    stdout: string;
    stderr: string;
    executionTimeMs: number;
    status: 'SUCCESS' | 'ERROR';
  }> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    const result = await CodingService.runCode(studentId, {
      language: (language || exp.code_language || 'python') as any,
      source_code: code,
      stdin: stdin || '',
    });

    const isSuccess = !result.stderr || result.stderr.trim().length === 0;
    const stdout = result.stdout || '';
    const stderr = result.stderr || '';

    const duration =
      (result as any).execution_time_ms !== undefined && (result as any).execution_time_ms > 0
        ? (result as any).execution_time_ms
        : (result as any).executionTimeMs || 5;

    // Update draft and experiment
    await db.saveLabCodeDraft({
      student_id: studentId,
      experiment_id: expId,
      code,
      language,
      stdin,
      last_output: stdout || stderr,
      last_error: stderr,
      execution_duration_ms: duration,
      updated_at: new Date().toISOString(),
    });

    exp.actual_output = stdout || stderr;
    exp.execution_status = isSuccess ? 'SUCCESS' : 'ERROR';
    exp.execution_duration_ms = duration;
    await db.saveLabExperiment(exp);

    return {
      stdout,
      stderr,
      executionTimeMs: duration,
      status: isSuccess ? 'SUCCESS' : 'ERROR',
    };
  }

  public static async executeSql(
    studentId: string,
    expId: string,
    query: string,
    dbName: string = 'university_db'
  ): Promise<{
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    status: 'SUCCESS' | 'ERROR';
    errorMessage?: string;
  }> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    const result: any = await SqlLabSandboxService.executeSandboxedSql(studentId, dbName, query);

    const isSuccess = result.success === true || result.status === 'SUCCESS';
    const displayOutput = isSuccess
      ? `Query OK. ${result.affected_rows || result.rows?.length || 0} rows returned in ${result.execution_time_ms}ms.`
      : `SQL Error: ${result.error || result.error_message}`;

    exp.actual_output = displayOutput;
    exp.execution_status = isSuccess ? 'SUCCESS' : 'ERROR';
    exp.execution_duration_ms = result.execution_time_ms;
    await db.saveLabExperiment(exp);

    return {
      columns: result.columns || [],
      rows: result.rows || [],
      executionTimeMs: result.execution_time_ms,
      status: isSuccess ? 'SUCCESS' : 'ERROR',
      errorMessage: result.error || result.error_message,
    };
  }

  // ==========================================
  // 6. Interactive Checklist & Progress
  // ==========================================
  public static async toggleChecklistStep(
    studentId: string,
    expId: string,
    stepId: string,
    completed: boolean
  ): Promise<{ checklist: Record<string, boolean>; experiment: LabExperimentDetail }> {
    const checklist = await db.saveLabChecklist(studentId, expId, stepId, completed);
    const experiment = await db.getLabExperimentById(expId, studentId);
    if (!experiment) throw new NotFoundError(`Experiment '${expId}' not found`);
    return { checklist, experiment };
  }

  public static async resetChecklist(
    studentId: string,
    expId: string
  ): Promise<{ checklist: Record<string, boolean>; experiment: LabExperimentDetail }> {
    const checklist = await db.resetLabChecklist(studentId, expId);
    const experiment = await db.getLabExperimentById(expId, studentId);
    if (!experiment) throw new NotFoundError(`Experiment '${expId}' not found`);
    return { checklist, experiment };
  }

  // ==========================================
  // 7. Observation Tables
  // ==========================================
  public static async saveObservationTable(
    studentId: string,
    expId: string,
    table: ObservationTable
  ): Promise<LabExperimentDetail> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    // Calculate derived formula columns if formula is defined
    if (table.columns && table.table_rows) {
      for (const row of table.table_rows) {
        for (const col of table.columns) {
          if (col.formula && !row[col.id]) {
            try {
              // Safe mathematical formula evaluation for column IDs
              let expr = col.formula;
              for (const [k, v] of Object.entries(row)) {
                if (k !== col.id && !isNaN(Number(v))) {
                  expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
                }
              }
              if (/^[0-9\.\+\-\*\/\(\)\s]+$/.test(expr)) {
                // eslint-disable-next-line no-eval
                const calc = Function(`'use strict'; return (${expr})`)();
                row[col.id] = String(Math.round(calc * 100) / 100);
              }
            } catch {
              // Ignore formula syntax error
            }
          }
        }
      }
    }

    exp.observation_table = table;
    exp.updated_at = new Date().toISOString();
    return db.saveLabExperiment(exp);
  }

  // ==========================================
  // 8. Viva Voce Practice & Evaluation
  // ==========================================
  public static async evaluateVivaAnswer(
    studentId: string,
    expId: string,
    questionId: string,
    studentAnswer: string
  ): Promise<VivaQuestionItem> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    const q = exp.viva_questions.find((item) => item.id === questionId);
    if (!q) throw new NotFoundError(`Viva question '${questionId}' not found`);

    q.student_answer = studentAnswer;
    const answerTrimmed = studentAnswer.trim();

    // Evaluate answer against expected concept
    let score = 5;
    let correctness = 'Answer partially addresses the concept.';
    let missingConcepts: string[] = [];
    let clarity = 'Basic explanation provided.';
    let improvement = 'Elaborate on technical parameters and exact university curriculum definitions.';

    const expectedKeywords = (q.expected_concept || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const matches = expectedKeywords.filter((kw) => answerTrimmed.toLowerCase().includes(kw));
    const matchRatio = expectedKeywords.length > 0 ? matches.length / expectedKeywords.length : 0.5;

    if (answerTrimmed.length > 100 && matchRatio >= 0.5) {
      score = 9;
      correctness = 'Thorough, technically accurate explanation demonstrating sound theoretical understanding.';
      clarity = 'Articulate technical language with precise terminology.';
      improvement = 'Mention any performance tradeoffs or edge cases during oral examination.';
    } else if (answerTrimmed.length > 40 && matchRatio >= 0.25) {
      score = 7;
      correctness = 'Identifies core conceptual invariants and demonstrates foundational understanding.';
      clarity = 'Structured explanation with clear terminology.';
      missingConcepts = expectedKeywords.filter((kw) => !matches.includes(kw)).slice(0, 3);
      improvement = `Incorporate key concepts such as: ${missingConcepts.join(', ')}.`;
    } else if (answerTrimmed.length > 15) {
      score = 5;
      correctness = 'Answer touches on general ideas but lacks technical specificity.';
      missingConcepts = expectedKeywords.slice(0, 3);
      improvement = `Review the experiment theory and incorporate: ${missingConcepts.join(', ')}.`;
    } else {
      score = 3;
      correctness = 'Answer is too brief or lacks required technical context.';
      missingConcepts = expectedKeywords.slice(0, 4);
      improvement = 'Provide a full descriptive response explaining the underlying mechanism.';
    }

    q.ai_evaluation = {
      score,
      correctness,
      missing_concepts: missingConcepts,
      clarity,
      improvement,
      evaluated_at: new Date().toISOString(),
    };

    await db.saveLabExperiment(exp);
    return q;
  }

  public static async generateVivaQuestions(
    studentId: string,
    expId: string,
    count: number = 3,
    difficulty: string = 'INTERMEDIATE'
  ): Promise<VivaQuestionItem[]> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    try {
      const prompt = `Generate ${count} practice oral viva questions with difficulty ${difficulty} for this B.Tech experiment:
Title: ${exp.title}
Aim: ${exp.aim}
Theory: ${exp.theory}
Algorithm: ${exp.algorithm}

Format output as valid JSON:
{
  "questions": [
    { "question": "Question text?", "expected_concept": "Expected concept answer", "difficulty": "${difficulty}" }
  ]
}`;

      const res = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.3);

      const match = res.text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          const newQuestions: VivaQuestionItem[] = parsed.questions.map((item: any, idx: number) => ({
            id: `vq_gen_${Date.now()}_${idx + 1}`,
            question: item.question,
            expected_concept: item.expected_concept,
            difficulty: item.difficulty || difficulty,
          }));

          exp.viva_questions = [...exp.viva_questions, ...newQuestions];
          await db.saveLabExperiment(exp);
          return newQuestions;
        }
      }
    } catch (err) {
      logger.warn('AI viva generation failed, returning default curriculum questions', err);
    }

    const fallbackQuestions: VivaQuestionItem[] = [
      {
        id: `vq_fallback_${Date.now()}_1`,
        question: `What are the primary computational or hardware constraints in '${exp.title}'?`,
        expected_concept: 'Analysis of time/space complexity or physical resource limitations.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: `vq_fallback_${Date.now()}_2`,
        question: `How would you modify the procedure if the input size increases by 100x?`,
        expected_concept: 'Scalability considerations, buffering, batching, or optimal data structures.',
        difficulty: 'ADVANCED',
      },
    ];

    exp.viva_questions = [...exp.viva_questions, ...fallbackQuestions];
    await db.saveLabExperiment(exp);
    return fallbackQuestions;
  }

  // ==========================================
  // 9. Doubt Solving Assistant
  // ==========================================
  public static async askDoubt(
    studentId: string,
    expId: string,
    doubtText: string,
    codeSnippet?: string
  ): Promise<string> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    // Save student message
    await db.saveLabDoubtMessage({
      id: `msg_${Date.now()}_std`,
      student_id: studentId,
      experiment_id: expId,
      sender: 'student',
      text: doubtText,
      code_snippet: codeSnippet,
      timestamp: new Date().toISOString(),
    });

    let answer = '';
    try {
      const prompt = `You are a patient university laboratory assistant assisting a B.Tech student with this specific experiment:
Experiment Number: ${exp.experiment_number}
Experiment Title: ${exp.title}
Aim: ${exp.aim}
Theory: ${exp.theory}
Procedure: ${exp.procedure?.join('\n')}
Existing Code:\n${exp.implementation_code || 'None'}

Student's Question:
${doubtText}
${codeSnippet ? `\nStudent's Code Snippet:\n${codeSnippet}` : ''}

Answer beginner-friendly, stay strictly grounded in the experiment, and provide direct actionable steps.`;

      const aiRes = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.3);

      answer = aiRes.text;
    } catch (err) {
      answer = `Based on Experiment ${exp.experiment_number} (${exp.title}): ${exp.aim}. Ensure your inputs match the requirements (${exp.requirements.join(', ')}). Review the procedure steps in the checklist to isolate where the issue occurs.`;
    }

    // Save assistant response
    await db.saveLabDoubtMessage({
      id: `msg_${Date.now()}_ast`,
      student_id: studentId,
      experiment_id: expId,
      sender: 'assistant',
      text: answer,
      timestamp: new Date().toISOString(),
    });

    return answer;
  }

  // ==========================================
  // 10. Laboratory Report Generation
  // ==========================================
  public static async generateReport(
    studentId: string,
    expId: string,
    datePerformed?: string
  ): Promise<LabReportData> {
    const exp = await db.getLabExperimentById(expId, studentId);
    if (!exp) throw new NotFoundError(`Experiment '${expId}' not found`);

    const lab = await db.getLabCourseById(exp.lab_id, studentId);
    if (!lab) throw new NotFoundError(`Laboratory course '${exp.lab_id}' not found`);

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const report: LabReportData = {
      report_id: reportId,
      student_id: studentId,
      lab_id: exp.lab_id,
      experiment_id: expId,
      lab_title: lab.name,
      course_code: lab.course_code,
      subject: lab.subject,
      semester: lab.semester,
      department: lab.department,
      experiment_number: exp.experiment_number,
      experiment_title: exp.title,
      date_performed: datePerformed || now.split('T')[0],
      aim: exp.aim || exp.objective || 'Aim not specified',
      theory: exp.theory || 'Theory not specified',
      requirements: exp.requirements || [],
      algorithm: exp.algorithm || '',
      procedure: exp.procedure || exp.procedure_steps?.map((s) => s.text) || [],
      source_code: exp.implementation_code || exp.source_code || '',
      code_language: exp.code_language || 'python',
      actual_output: exp.actual_output || exp.expected_output || '',
      expected_output: exp.expected_output || '',
      observation_table: exp.observation_table,
      result_conclusion: exp.result_conclusion || exp.conclusion || 'Experiment completed successfully.',
      viva_questions: exp.viva_questions?.map((vq) => ({
        question: vq.question,
        student_answer: vq.student_answer,
        expected_concept: vq.expected_concept,
      })),
      student_notes: exp.student_notes || '',
      generated_at: now,
    };

    return db.saveLabReport(report);
  }

  // ==========================================
  // 11. Student Analytics
  // ==========================================
  public static async getAnalytics(studentId: string): Promise<StudentLabAnalytics> {
    return db.getStudentLabAnalytics(studentId);
  }
}

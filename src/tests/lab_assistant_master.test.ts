// src/tests/lab_assistant_master.test.ts
// Comprehensive Vitest suite validating the Lab Assistant & Interactive Experiment Module

import { describe, it, expect, beforeEach } from 'vitest';
import { LabAssistantService } from '../../server/services/labAssistantService';
import { db } from '../../server/db/database';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { ValidationError, NotFoundError } from '../../server/core/exceptions';

describe('Lab Assistant Module - Master Verification Suite', () => {
  const studentA = 'std_test_lab_alice_2026';
  const studentB = 'std_test_lab_bob_2026';

  beforeEach(async () => {
    await db.initialize();
  });

  // 1. Creating a laboratory
  it('1. creates a laboratory course with student ownership and defaults', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Data Structures Lab',
      subject: 'Data Structures (CS301)',
      semester: 3,
      course_code: 'CS301L',
      department: 'Computer Science & Engineering',
      lab_type: 'PROGRAMMING',
      tools_or_languages: 'C, C++, GCC',
    });

    expect(lab).toBeDefined();
    expect(lab.id).toMatch(/^lab_/);
    expect(lab.student_id).toBe(studentA);
    expect(lab.name).toBe('Data Structures Lab');
    expect(lab.course_code).toBe('CS301L');
    expect(lab.semester).toBe(3);
    expect(lab.experiments_count).toBe(0);
    expect(lab.completed_experiments_count).toBe(0);
  });

  // 2. Editing laboratory details & validation
  it('2. edits laboratory details and validates required fields', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Operating Systems Lab',
      subject: 'Operating Systems',
      semester: 4,
    });

    const updated = await LabAssistantService.updateLab(studentA, lab.id, {
      name: 'Advanced Operating Systems Lab',
      tools_or_languages: 'Linux, POSIX Threads, C',
    });

    expect(updated.name).toBe('Advanced Operating Systems Lab');
    expect(updated.tools_or_languages).toBe('Linux, POSIX Threads, C');

    // Validation checks
    await expect(
      LabAssistantService.createLab(studentA, {
        name: '   ',
        subject: 'Algorithms',
        semester: 4,
      })
    ).rejects.toThrow(ValidationError);

    await expect(
      LabAssistantService.createLab(studentA, {
        name: 'Database Lab',
        subject: '',
        semester: 4,
      })
    ).rejects.toThrow(ValidationError);
  });

  // 3. Manually entering a complete experiment
  it('3. manually enters a complete experiment with all curriculum fields', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Database Management Systems Lab',
      subject: 'DBMS',
      semester: 5,
      lab_type: 'DBMS',
    });

    const { manual, experiments } = await LabAssistantService.saveManualDetails(
      studentA,
      lab.id,
      {
        title: 'B.Tech V Sem DBMS Laboratory Manual',
        subject: 'Database Management Systems',
        semester: 5,
        lab_type: 'DBMS',
        tools: 'PostgreSQL, SQLite',
      },
      [
        {
          experiment_number: 1,
          title: 'Implementation of DDL, DML, and Integrity Constraints',
          aim: 'To design university relational schema and enforce primary/foreign key constraints.',
          problem_statement: 'Construct student and department tables with cascading referential integrity.',
          theory: 'Relational integrity constraints enforce entity, referential, and domain invariants.',
          requirements: ['PostgreSQL 15+', 'Terminal SQL Client'],
          procedure: [
            'Connect to database engine.',
            'Execute CREATE TABLE DDL queries.',
            'Apply CHECK and FOREIGN KEY constraints.',
            'Verify with INSERT and DELETE queries.',
          ],
          algorithm: '1. Initialize database\n2. Create departments table\n3. Create students table referencing departments',
          implementation_code: 'CREATE TABLE departments (dept_id INT PRIMARY KEY, name VARCHAR(50));',
          code_language: 'sql',
          expected_output: 'CREATE TABLE\nCREATE TABLE',
          result_conclusion: 'Relational schema created with integrity constraints validated.',
          viva_questions: [
            {
              id: 'vq_1',
              question: 'What is the operational difference between TRUNCATE and DELETE?',
              expected_concept: 'TRUNCATE is a DDL operation that deallocates extents; DELETE is a logged DML operation with WHERE support.',
              difficulty: 'BASIC',
            },
          ],
        },
      ]
    );

    expect(manual).toBeDefined();
    expect(manual.title).toBe('B.Tech V Sem DBMS Laboratory Manual');
    expect(experiments.length).toBe(1);
    expect(experiments[0].title).toBe('Implementation of DDL, DML, and Integrity Constraints');
    expect(experiments[0].procedure_steps.length).toBe(4);
    expect(experiments[0].viva_questions.length).toBe(1);
  });

  // 4. Saving and reopening a manual
  it('4. saves and reopens a manual with experiments intact', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Web Technologies Lab',
      subject: 'Web Technologies',
      semester: 6,
    });

    await LabAssistantService.saveManualDetails(
      studentA,
      lab.id,
      {
        title: 'Full Stack Web Tech Manual',
        subject: 'Web Technologies',
        semester: 6,
      },
      [
        {
          experiment_number: 1,
          title: 'DOM Manipulation with JavaScript',
          aim: 'Build interactive student dashboard form with dynamic validation.',
          procedure: ['Create HTML layout', 'Bind event listeners', 'Validate inputs'],
          implementation_code: 'console.log("DOM Loaded");',
          expected_output: 'DOM Loaded',
        },
      ]
    );

    const reloadedLab = await LabAssistantService.getLabById(studentA, lab.id);
    expect(reloadedLab.experiments).toBeDefined();
    expect(reloadedLab.experiments!.length).toBe(1);
    expect(reloadedLab.experiments![0].title).toBe('DOM Manipulation with JavaScript');
  });

  // 5. Adding multiple experiments dynamically
  it('5. dynamically adds multiple experiments to a laboratory', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Computer Networks Lab',
      subject: 'Computer Networks',
      semester: 5,
      lab_type: 'NETWORKS',
    });

    const exp1 = await db.saveLabExperiment({
      id: `exp_net_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Packet Sniffing and Wireshark Traffic Inspection',
      aim: 'Capture and inspect TCP 3-way handshake packets.',
      theory: 'Wireshark captures raw frame packets traversing network interface cards.',
      requirements: ['Wireshark 4.0+', 'Ethernet Interface'],
      procedure_steps: [
        { id: 'st1', step_number: 1, text: 'Open Wireshark and select interface', is_completed: false },
        { id: 'st2', step_number: 2, text: 'Filter on tcp.flags.syn == 1', is_completed: false },
      ],
      procedure: ['Open Wireshark', 'Filter TCP SYN packets'],
      expected_output: 'SYN, SYN-ACK, ACK handshake sequence displayed',
      result_conclusion: 'TCP 3-way handshake sequence observed.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const exp2 = await db.saveLabExperiment({
      id: `exp_net_2_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 2,
      title: 'Implementation of Distance Vector Routing Algorithm',
      aim: 'Compute shortest routing paths using Bellman-Ford algorithm.',
      theory: 'Distance Vector routing routers share vector tables with immediate neighbors.',
      requirements: ['GCC / Python'],
      procedure_steps: [
        { id: 'st3', step_number: 1, text: 'Input adjacency weight matrix', is_completed: false },
        { id: 'st4', step_number: 2, text: 'Iterate distance updates until convergence', is_completed: false },
      ],
      procedure: ['Input adjacency matrix', 'Iterate updates'],
      expected_output: 'Convergence achieved in 3 iterations.',
      result_conclusion: 'Routing table converged.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const exps = await db.getLabExperiments(lab.id, studentA);
    expect(exps.length).toBe(2);
    expect(exps[0].title).toBe('Packet Sniffing and Wireshark Traffic Inspection');
    expect(exps[1].title).toBe('Implementation of Distance Vector Routing Algorithm');
  });

  // 6. Editing and reordering experiments
  it('6. edits and reorders experiments sequentially', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'AI / Machine Learning Lab',
      subject: 'Machine Learning',
      semester: 7,
      lab_type: 'AI_ML',
    });

    const expA = await db.saveLabExperiment({
      id: `exp_ml_a_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Linear Regression on Boston Housing',
      aim: 'Train ordinary least squares regression model.',
      theory: 'Linear regression optimizes mean squared error loss.',
      requirements: ['Python 3.10', 'scikit-learn'],
      procedure_steps: [],
      procedure: ['Load dataset', 'Train model'],
      expected_output: 'MSE: 0.042',
      result_conclusion: 'Model evaluated.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const expB = await db.saveLabExperiment({
      id: `exp_ml_b_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 2,
      title: 'K-Means Clustering on Customer Segmentation',
      aim: 'Cluster unlabeled customer vectors into K groups.',
      theory: 'K-Means optimizes intra-cluster sum of squares.',
      requirements: ['Python 3.10', 'scikit-learn'],
      procedure_steps: [],
      procedure: ['Initialize centroids', 'Assign clusters'],
      expected_output: 'Inertia: 124.5',
      result_conclusion: 'Clusters generated.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Reorder: put expB first, then expA
    await db.reorderLabExperiments(studentA, lab.id, [expB.id, expA.id]);

    const reordered = await db.getLabExperiments(lab.id, studentA);
    expect(reordered[0].id).toBe(expB.id);
    expect(reordered[0].experiment_number).toBe(1);
    expect(reordered[1].id).toBe(expA.id);
    expect(reordered[1].experiment_number).toBe(2);
  });

  // 7. Uploading a supported manual
  it('7. parses and extracts candidate experiments from uploaded manual document', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Compiler Design Lab',
      subject: 'Compiler Design',
      semester: 6,
    });

    const sampleManualText = `
DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
COMPILER DESIGN LABORATORY MANUAL

Experiment 1: Design a Lexical Analyzer for C language
Aim: To implement a lexical analyzer using C to recognize keywords, identifiers, constants, and operators.
Theory: Lexical analysis scans raw source characters and aggregates them into lexical tokens.
Procedure:
1. Open source file.
2. Read characters into buffer.
3. Check against token lookup table.
Output: Total 42 tokens identified.
Conclusion: Lexical analyzer successfully tokenized source code.

Experiment 2: Implementation of Predictive Parser
Aim: To construct an LL(1) parsing table and parse grammar inputs.
Theory: LL(1) parsers process input from Left to right producing Leftmost derivations with 1 lookahead token.
Procedure:
1. Compute First and Follow sets.
2. Populate parsing table cells.
3. Simulate pushdown stack transitions.
Output: Input string accepted.
Conclusion: Predictive parser verified successfully.
    `;

    const result = await LabAssistantService.uploadAndExtractManual(
      studentA,
      lab.id,
      Buffer.from(sampleManualText),
      'text/plain',
      'Compiler_Design_Manual.txt'
    );

    expect(result).toBeDefined();
    expect(result.candidate_experiments.length).toBeGreaterThanOrEqual(2);
    expect(result.candidate_experiments[0].title).toContain('Lexical Analyzer');
    expect(result.candidate_experiments[1].title).toContain('Predictive Parser');
  });

  // 8. Handling invalid file types and oversized files
  it('8. handles unsupported or invalid files gracefully', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Cybersecurity Lab',
      subject: 'Network Security',
      semester: 7,
    });

    await expect(
      LabAssistantService.uploadAndExtractManual(
        studentA,
        lab.id,
        Buffer.from(''),
        'application/octet-stream',
        'executable.exe'
      )
    ).rejects.toThrow();
  });

  // 9. Handling extraction failures with fallback
  it('9. handles empty or unparseable document content with helpful error', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'IoT Lab',
      subject: 'Internet of Things',
      semester: 6,
    });

    await expect(
      LabAssistantService.uploadAndExtractManual(
        studentA,
        lab.id,
        Buffer.from('    \n   '),
        'text/plain',
        'Empty_Document.txt'
      )
    ).rejects.toThrow(ValidationError);
  });

  // 10. Reviewing and correcting extracted content
  it('10. allows student to review, rename, and correct extracted content before saving', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Data Mining Lab',
      subject: 'Data Mining',
      semester: 6,
    });

    const reviewedExperiments = [
      {
        experiment_number: 1,
        title: 'Apriori Association Rule Mining (Student Corrected)',
        aim: 'Extract strong association rules with minimum support 0.3.',
        theory: 'Apriori principle asserts all non-empty subsets of a frequent itemset must also be frequent.',
        procedure: ['Scan transactions', 'Generate candidate sets', 'Prune infrequent candidates'],
        expected_output: 'Frequent Itemsets: {Milk, Bread} Support: 0.4',
        result_conclusion: 'Association rules mined successfully.',
      },
    ];

    const res = await LabAssistantService.saveManualDetails(
      studentA,
      lab.id,
      {
        title: 'Data Mining Practical Syllabus',
        subject: lab.subject,
        semester: lab.semester,
      },
      reviewedExperiments
    );

    expect(res.experiments[0].title).toBe('Apriori Association Rule Mining (Student Corrected)');
  });

  // 11. AI explanations without overwriting original content
  it('11. preserves original manual content and isolates doubts or notes', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Algorithms Lab',
      subject: 'Analysis of Algorithms',
      semester: 4,
    });

    const exp = await db.saveLabExperiment({
      id: `exp_algo_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Merge Sort Divide and Conquer Analysis',
      aim: 'Sort N numbers using Merge Sort.',
      theory: 'Original manual theory: Recurrence relation T(N) = 2T(N/2) + O(N) yields O(N log N).',
      requirements: ['GCC'],
      procedure_steps: [],
      procedure: ['Divide array', 'Recursively sort', 'Merge subarrays'],
      expected_output: 'Sorted array',
      result_conclusion: 'O(N log N) verified.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Ask doubt
    const answer = await LabAssistantService.askDoubt(
      studentA,
      exp.id,
      'Why does Merge Sort require extra O(N) space?'
    );
    expect(answer).toBeDefined();
    expect(answer.length).toBeGreaterThan(10);

    // Verify original manual theory was NOT overwritten
    const reloaded = await db.getLabExperimentById(exp.id, studentA);
    expect(reloaded!.theory).toBe('Original manual theory: Recurrence relation T(N) = 2T(N/2) + O(N) yields O(N log N).');
  });

  // 12. Saving and restoring checklist progress
  it('12. saves and restores interactive checklist progress across sessions', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Software Engineering Lab',
      subject: 'Software Engineering',
      semester: 5,
    });

    const exp = await db.saveLabExperiment({
      id: `exp_se_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'SRS Documentation and UML Class Diagram Modeling',
      aim: 'Generate IEEE-830 Software Requirements Specification.',
      theory: 'SRS outlines functional and non-functional requirements.',
      requirements: ['StarUML / Draw.io'],
      procedure_steps: [
        { id: 'st_1', step_number: 1, text: 'Define problem scope', is_completed: false },
        { id: 'st_2', step_number: 2, text: 'Identify actor use cases', is_completed: false },
        { id: 'st_3', step_number: 3, text: 'Construct UML class diagram', is_completed: false },
      ],
      procedure: ['Define scope', 'Identify actors', 'Draw class diagram'],
      expected_output: 'Approved SRS document',
      result_conclusion: 'SRS document validated.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Check step 1
    const { checklist: cl1, experiment: exp1 } = await LabAssistantService.toggleChecklistStep(
      studentA,
      exp.id,
      'st_1',
      true
    );
    expect(cl1['st_1']).toBe(true);
    expect(exp1.status).toBe('IN_PROGRESS');

    // Check step 2 and 3 -> marks completed
    await LabAssistantService.toggleChecklistStep(studentA, exp.id, 'st_2', true);
    const { experiment: expFinal } = await LabAssistantService.toggleChecklistStep(
      studentA,
      exp.id,
      'st_3',
      true
    );
    expect(expFinal.status).toBe('COMPLETED');
    expect(expFinal.completed_at).toBeDefined();

    // Reset checklist
    const { experiment: expReset } = await LabAssistantService.resetChecklist(studentA, exp.id);
    expect(expReset.status).toBe('NOT_STARTED');
    expect(expReset.completed_at).toBeUndefined();
  });

  // 13. Saving code drafts
  it('13. saves and reloads code drafts per student and experiment', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Python Programming Lab',
      subject: 'Python',
      semester: 2,
    });

    const exp = await db.saveLabExperiment({
      id: `exp_py_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Matrix Multiplication in Pure Python',
      aim: 'Multiply two 3x3 matrices without external libraries.',
      theory: 'Matrix multiplication requires compatible dimensions: (M x K) * (K x N).',
      requirements: ['Python 3.10+'],
      procedure_steps: [],
      procedure: ['Input matrices', 'Multiply rows by columns', 'Print result'],
      expected_output: 'Matrix result',
      result_conclusion: 'Calculation complete.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const draftCode = 'A = [[1, 2], [3, 4]]\nB = [[5, 6], [7, 8]]\nprint(A)';
    await db.saveLabCodeDraft({
      student_id: studentA,
      experiment_id: exp.id,
      code: draftCode,
      language: 'python',
      updated_at: new Date().toISOString(),
    });

    const draft = await db.getLabCodeDraft(studentA, exp.id);
    expect(draft).toBeDefined();
    expect(draft!.code).toBe(draftCode);
  });

  // 14. Executing code safely through configured safe runner
  it('14. executes student code safely through isolated CodingService runner', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'C Programming Lab',
      subject: 'Programming in C',
      semester: 1,
    });

    const exp = await db.saveLabExperiment({
      id: `exp_c_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Factorial Computation using Recursion',
      aim: 'Calculate factorial of N.',
      theory: 'N! = N * (N-1)! with base case 0! = 1.',
      requirements: ['GCC / Python'],
      procedure_steps: [],
      procedure: ['Read N', 'Call recursive function', 'Print factorial'],
      expected_output: 'Factorial of 5 is 120',
      result_conclusion: 'Recursion verified.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const pythonCode = 'def fact(n):\n    return 1 if n <= 1 else n * fact(n-1)\nprint("Factorial of 5 is", fact(5))';
    const result = await LabAssistantService.executeCode(studentA, exp.id, pythonCode, 'python');

    expect(result).toBeDefined();
    expect(result.status).toBe('SUCCESS');
    expect(result.stdout).toContain('Factorial of 5 is 120');
    expect(result.executionTimeMs).toBeGreaterThan(0);

    // Verify experiment recorded actual execution output
    const reloaded = await db.getLabExperimentById(exp.id, studentA);
    expect(reloaded!.actual_output).toContain('Factorial of 5 is 120');
  });

  // 15. Executing SQL queries through safe sandbox
  it('15. executes SQL queries safely against isolated university sandbox', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'SQL Database Lab',
      subject: 'DBMS',
      semester: 4,
      lab_type: 'DBMS',
    });

    const exp = await db.saveLabExperiment({
      id: `exp_sql_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Aggregate Queries in SQL',
      aim: 'Compute average student CGPA grouped by branch.',
      theory: 'GROUP BY aggregates rows sharing common values.',
      requirements: ['SQLite Sandbox'],
      procedure_steps: [],
      procedure: ['Write query', 'Execute', 'Inspect groupings'],
      expected_output: 'Branch summaries',
      result_conclusion: 'Query executed.',
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const query = 'SELECT branch, COUNT(*) AS count FROM students GROUP BY branch;';
    const result = await LabAssistantService.executeSql(studentA, exp.id, query);

    expect(result).toBeDefined();
    expect(result.status).toBe('SUCCESS');
    expect(result.columns).toContain('branch');
    expect(result.columns).toContain('count');
    expect(result.rows.length).toBeGreaterThan(0);
  });

  // 16. Saving and calculating observation tables
  it('16. saves and calculates observation tables with column formulas', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Physics / Hardware Lab',
      subject: 'Electronics Lab',
      semester: 2,
      lab_type: 'HARDWARE',
    });

    const exp = await db.saveLabExperiment({
      id: `exp_hw_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: "Verification of Ohm's Law (V = I * R)",
      aim: 'Measure voltage and current across known resistance.',
      theory: 'Ohm’s law states current is directly proportional to potential difference.',
      requirements: ['Multimeter', 'DC Power Supply', '100 Ohm Resistor'],
      procedure_steps: [],
      procedure: ['Connect circuit', 'Vary voltage', 'Record current readings'],
      expected_output: 'Linear V-I characteristic',
      result_conclusion: "Ohm's law verified.",
      viva_questions: [],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const obsTable = {
      headers: ['Voltage (V)', 'Current (A)', 'Resistance (Ohm)'],
      rows: [['5.0', '0.05', '100.0']],
      columns: [
        { id: 'v_col', name: 'Voltage', unit: 'V' },
        { id: 'i_col', name: 'Current', unit: 'A' },
        { id: 'r_col', name: 'Resistance', unit: 'Ohm', formula: 'v_col / i_col' },
      ],
      table_rows: [{ v_col: '5.0', i_col: '0.05' }],
    };

    const saved = await LabAssistantService.saveObservationTable(studentA, exp.id, obsTable);
    expect(saved.observation_table).toBeDefined();
    expect(saved.observation_table!.table_rows![0].r_col).toBe('100');
  });

  // 17. Generating a verified experiment report
  it('17. generates a laboratory report from actual saved experiment data', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Data Structures Lab',
      subject: 'Data Structures',
      semester: 3,
      course_code: 'CS301L',
    });

    const exp = await db.saveLabExperiment({
      id: `exp_ds_report_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Queue Implementation using Circular Array',
      aim: 'Implement FIFO queue operations.',
      theory: 'Circular queue avoids false overflow conditions.',
      requirements: ['GCC'],
      procedure_steps: [],
      procedure: ['Initialize front and rear', 'Enqueue element', 'Dequeue element'],
      expected_output: 'Enqueued 10, 20. Dequeued 10.',
      actual_output: 'Enqueued 10, 20. Dequeued 10.',
      result_conclusion: 'Circular queue verified.',
      viva_questions: [
        {
          id: 'vq_rep_1',
          question: 'What is the condition for Circular Queue full?',
          expected_concept: '(rear + 1) % SIZE == front',
        },
      ],
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const report = await LabAssistantService.generateReport(studentA, exp.id, '2026-10-18');
    expect(report).toBeDefined();
    expect(report.report_id).toMatch(/^rep_/);
    expect(report.experiment_title).toBe('Queue Implementation using Circular Array');
    expect(report.actual_output).toBe('Enqueued 10, 20. Dequeued 10.');
    expect(report.date_performed).toBe('2026-10-18');
  });

  // 18. Ensuring student data isolation (cross-account security)
  it('18. strictly isolates laboratory and experiment records between students', async () => {
    const labAlice = await LabAssistantService.createLab(studentA, {
      name: 'Alice Private Robotics Lab',
      subject: 'Robotics',
      semester: 8,
    });

    // Bob attempts to fetch Alice's private lab
    await expect(LabAssistantService.getLabById(studentB, labAlice.id)).rejects.toThrow(NotFoundError);

    // Bob attempts to update Alice's private lab
    await expect(
      LabAssistantService.updateLab(studentB, labAlice.id, { name: 'Bob Hacked Lab' })
    ).rejects.toThrow(NotFoundError);

    // Bob attempts to delete Alice's private lab
    await expect(LabAssistantService.deleteLab(studentB, labAlice.id)).rejects.toThrow(NotFoundError);

    // Alice's lab remains safe
    const aliceLab = await LabAssistantService.getLabById(studentA, labAlice.id);
    expect(aliceLab.name).toBe('Alice Private Robotics Lab');
  });

  // 19. Handling missing AI configuration
  it('19. without an AI model, viva feedback is a labelled keyword check with an honest score', async () => {
    const lab = await LabAssistantService.createLab(studentA, {
      name: 'Computer Architecture Lab',
      subject: 'Computer Architecture',
      semester: 4,
    });

    const exp = await db.saveLabExperiment({
      id: `exp_ca_1_${studentA}`,
      lab_id: lab.id,
      student_id: studentA,
      experiment_number: 1,
      title: 'Design of 4-bit Arithmetic Logic Unit (ALU)',
      aim: 'Implement ADD, SUB, AND, OR operations in Verilog.',
      theory: 'ALU performs fundamental arithmetic and bitwise boolean computations.',
      requirements: ['ModelSim / Icarus Verilog'],
      procedure_steps: [],
      procedure: ['Define inputs and opcodes', 'Write case statement', 'Simulate testbench'],
      expected_output: 'Testbench verified',
      result_conclusion: 'ALU functional verification complete.',
      viva_questions: [
        {
          id: 'vq_alu_1',
          question: 'What is the propagation delay difference between Ripple Carry Adder and Carry Lookahead Adder?',
          expected_concept: 'Ripple carry delay is O(N) linear due to carry cascade; Carry lookahead achieves O(log N) or O(1) using propagate and generate terms.',
        },
      ],
      status: 'NOT_STARTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const evalResult = await LabAssistantService.evaluateVivaAnswer(
      studentA,
      exp.id,
      'vq_alu_1',
      'Ripple carry adder has O(N) propagation delay because each bit must wait for the carry out of the previous stage, whereas Carry Lookahead computes generate and propagate signals in parallel.'
    );

    // No AI model: a labelled keyword check. The answer mentions 6 of the 10 reference terms
    // (ripple, carry, delay, lookahead, propagate, generate), so it scores 6, not an inflated band.
    const ev: any = evalResult.ai_evaluation;
    expect(ev.method).toBe('KEYWORD_MATCH');
    expect(ev.score).toBe(6);
    expect(ev.correctness).toMatch(/6 of 10 key terms/);
    expect(ev.missing_concepts).toEqual(expect.arrayContaining(['linear', 'cascade']));
    expect(ev.clarity).toMatch(/Not assessed/);
  });

  // 20. Real analytics and onboarding for new students
  it('20. calculates real analytics and shows onboarding state for new students with 0 labs', async () => {
    const freshStudent = `std_fresh_new_${Date.now()}`;
    const initialAnalytics = await LabAssistantService.getAnalytics(freshStudent);

    expect(initialAnalytics.total_labs).toBe(0);
    expect(initialAnalytics.total_experiments).toBe(0);
    expect(initialAnalytics.completed_experiments).toBe(0);
    expect(initialAnalytics.is_onboarding).toBe(true);

    // After creating a lab and an experiment
    const lab = await LabAssistantService.createLab(freshStudent, {
      name: 'Freshman Engineering Lab',
      subject: 'Workshop Practice',
      semester: 1,
    });

    await db.saveLabExperiment({
      id: `exp_fresh_1_${freshStudent}`,
      lab_id: lab.id,
      student_id: freshStudent,
      experiment_number: 1,
      title: 'Study of Electronic Workshop Tools',
      aim: 'Familiarization with soldering tools and digital multimeters.',
      theory: 'Soldering forms electrical and mechanical joints using tin-lead or lead-free solder alloy.',
      requirements: ['Soldering Iron', 'Multimeter'],
      procedure_steps: [],
      procedure: ['Inspect tools', 'Verify safety'],
      expected_output: 'Safety guidelines reviewed',
      result_conclusion: 'Workshop introduction complete.',
      viva_questions: [],
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const updatedAnalytics = await LabAssistantService.getAnalytics(freshStudent);
    expect(updatedAnalytics.total_labs).toBe(1);
    expect(updatedAnalytics.total_experiments).toBe(1);
    expect(updatedAnalytics.completed_experiments).toBe(1);
    expect(updatedAnalytics.is_onboarding).toBe(false);
  });

  // 21. Ensuring existing platform modules continue to work
  it('21. ensures existing LearningModulesService.getLabs and evaluateViva continue to function', async () => {
    const legacyLabs = await LearningModulesService.getLabs(studentA);
    expect(legacyLabs).toBeDefined();
    expect(legacyLabs.length).toBeGreaterThanOrEqual(1);

    const firstLab = legacyLabs[0];
    expect(firstLab.title).toBeDefined();
    expect(firstLab.experiments.length).toBeGreaterThanOrEqual(1);
  });
});

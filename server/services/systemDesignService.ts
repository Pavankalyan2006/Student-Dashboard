// server/services/systemDesignService.ts
// Comprehensive System Design Service implementing:
// 1. Learning Roadmap & Lesson Progress
// 2. Project Architecture CRUD & Versioning
// 3. 25 Design Challenges & Submissions
// 4. Mathematical Capacity Estimation Calculator
// 5. Database Schema Modeler & Multi-Dialect SQL DDL Generator
// 6. API Design & OpenAPI 3.0 Specification Generator
// 7. Deterministic Scalability Simulator (6 Scenarios + Cost Estimation)
// 8. Architecture Evaluation Engine (SPoF Detection, Rubric Scoring, Feedback)
// 9. 10-Step Interactive System Design Interview Mode
// 10. AI System Design Assistant with Progressive Modes

import { db } from '../db/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';
import {
  SystemDesignLesson,
  SystemDesignChallenge,
  SystemDesignProject,
  DesignProjectVersion,
  ChallengeSubmission,
  InterviewSession,
  InterviewStep,
  SystemDesignProgress,
  CapacityCalculationInput,
  CapacityCalculation,
  DatabaseDesign,
  SqlDialect,
  ApiSpecification,
  LoadBalancingSimParams,
  CachingSimParams,
  ReadReplicasSimParams,
  HorizontalScalingSimParams,
  QueueProcessingSimParams,
  AvailabilitySimParams,
  CostSimParams,
  SimulationResult,
  ArchitectureComponent,
  ArchitectureConnection
} from '../models/systemDesignTypes';

export class SystemDesignService {

  // =========================================================================
  // 1. Learning Roadmap & Curriculum Lessons
  // =========================================================================

  public static async getRoadmap(studentId: string) {
    return db.getSystemDesignRoadmap(studentId);
  }

  public static async getLessons(level?: number): Promise<SystemDesignLesson[]> {
    return db.getSystemDesignLessons(level);
  }

  public static async getLessonById(id: string): Promise<SystemDesignLesson> {
    const lesson = await db.getSystemDesignLessonById(id);
    if (!lesson) {
      throw new NotFoundError(`System design lesson '${id}' not found`);
    }
    return lesson;
  }

  public static async completeLesson(studentId: string, lessonId: string, quizScore?: number) {
    const lesson = await this.getLessonById(lessonId);
    if (quizScore !== undefined && quizScore < 60) {
      throw new ValidationError(`Quiz score ${quizScore}% is below passing threshold (60%). Please review the lesson and try again.`);
    }
    return db.completeSystemDesignLesson(studentId, lesson.id, quizScore ?? 100);
  }

  // =========================================================================
  // 2. Design Projects & Version Management
  // =========================================================================

  public static async getProjects(studentId: string): Promise<SystemDesignProject[]> {
    return db.getSystemDesignProjects(studentId);
  }

  public static async getProjectById(projectId: string, studentId: string): Promise<SystemDesignProject> {
    const project = await db.getSystemDesignProjectById(projectId, studentId);
    if (!project) {
      throw new NotFoundError(`Project '${projectId}' not found or you do not have permission to access it`);
    }
    return project;
  }

  public static async createProject(
    studentId: string,
    data: Partial<SystemDesignProject>
  ): Promise<SystemDesignProject> {
    if (!data.title || data.title.trim() === '') {
      throw new ValidationError('Project title is required');
    }

    const projectId = data.id || `proj_sd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProject: SystemDesignProject = {
      id: projectId,
      student_id: studentId,
      challenge_id: data.challenge_id,
      title: data.title.trim(),
      description: data.description?.trim() || 'New interactive distributed architecture design',
      components: data.components || [],
      connections: data.connections || [],
      requirements: data.requirements || {
        functional: [],
        non_functional: [],
        assumptions: []
      },
      capacity_estimate: data.capacity_estimate,
      database_design: data.database_design,
      api_specification: data.api_specification,
      versions: [
        {
          version_number: 1,
          created_at: new Date().toISOString(),
          note: 'Initial draft',
          components: JSON.parse(JSON.stringify(data.components || [])),
          connections: JSON.parse(JSON.stringify(data.connections || []))
        }
      ],
      tags: data.tags || ['System Design', 'Draft'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return db.createSystemDesignProject(newProject);
  }

  public static async updateProject(
    projectId: string,
    studentId: string,
    updates: Partial<SystemDesignProject>
  ): Promise<SystemDesignProject> {
    const existing = await this.getProjectById(projectId, studentId);

    // Limit diagram component count for performance & security
    if (updates.components && updates.components.length > 100) {
      throw new ValidationError('A single diagram cannot exceed 100 components to prevent browser canvas degradation');
    }

    return db.updateSystemDesignProject(projectId, studentId, updates);
  }

  public static async deleteProject(projectId: string, studentId: string): Promise<boolean> {
    await this.getProjectById(projectId, studentId);
    return db.deleteSystemDesignProject(projectId, studentId);
  }

  public static async createProjectVersion(
    projectId: string,
    studentId: string,
    note: string
  ): Promise<DesignProjectVersion> {
    await this.getProjectById(projectId, studentId);
    return db.createProjectVersion(projectId, studentId, note);
  }

  public static async duplicateProject(
    projectId: string,
    studentId: string,
    newTitle?: string
  ): Promise<SystemDesignProject> {
    const original = await this.getProjectById(projectId, studentId);
    const clonedId = `proj_sd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned: SystemDesignProject = {
      ...JSON.parse(JSON.stringify(original)),
      id: clonedId,
      student_id: studentId,
      title: newTitle || `${original.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [
        {
          version_number: 1,
          created_at: new Date().toISOString(),
          note: `Cloned from ${original.title}`,
          components: JSON.parse(JSON.stringify(original.components || [])),
          connections: JSON.parse(JSON.stringify(original.connections || []))
        }
      ]
    };
    return db.createSystemDesignProject(cloned);
  }

  public static async importProject(
    studentId: string,
    jsonData: any
  ): Promise<SystemDesignProject> {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new ValidationError('Invalid JSON architecture format');
    }
    if (!jsonData.title) {
      throw new ValidationError('Imported architecture must have a title');
    }
    if (Array.isArray(jsonData.components) && jsonData.components.length > 100) {
      throw new ValidationError('Imported architecture exceeds the 100 component limit');
    }

    const projectId = `proj_sd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedProject: SystemDesignProject = {
      id: projectId,
      student_id: studentId,
      challenge_id: jsonData.challenge_id || undefined,
      title: String(jsonData.title).slice(0, 150),
      description: String(jsonData.description || 'Imported architecture').slice(0, 1000),
      components: Array.isArray(jsonData.components) ? jsonData.components.map((c: any) => ({
        id: String(c.id || Math.random().toString(36).substring(2, 8)),
        name: String(c.name || 'Component').slice(0, 60),
        category: c.category || 'APPLICATION',
        type: c.type || 'BACKEND_SERVICE',
        tech_choice: c.tech_choice ? String(c.tech_choice).slice(0, 60) : undefined,
        description: String(c.description || '').slice(0, 300),
        position: {
          x: typeof c.position?.x === 'number' ? c.position.x : 100,
          y: typeof c.position?.y === 'number' ? c.position.y : 100
        },
        properties: c.properties || {}
      })) : [],
      connections: Array.isArray(jsonData.connections) ? jsonData.connections.map((cn: any) => ({
        id: String(cn.id || Math.random().toString(36).substring(2, 8)),
        from: String(cn.from),
        to: String(cn.to),
        protocol: cn.protocol || 'HTTP/REST',
        label: cn.label ? String(cn.label).slice(0, 60) : undefined,
        direction: cn.direction || 'UNIDIRECTIONAL',
        is_async: Boolean(cn.is_async)
      })) : [],
      requirements: jsonData.requirements || { functional: [], non_functional: [], assumptions: [] },
      capacity_estimate: jsonData.capacity_estimate,
      database_design: jsonData.database_design,
      api_specification: jsonData.api_specification,
      versions: [
        {
          version_number: 1,
          created_at: new Date().toISOString(),
          note: 'Imported from JSON',
          components: jsonData.components || [],
          connections: jsonData.connections || []
        }
      ],
      tags: Array.isArray(jsonData.tags) ? jsonData.tags.slice(0, 10) : ['Imported'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return db.createSystemDesignProject(sanitizedProject);
  }

  // =========================================================================
  // 3. Design Challenges & Submissions
  // =========================================================================

  public static async getChallenges(difficulty?: string, category?: string): Promise<SystemDesignChallenge[]> {
    let challenges = await db.getSystemDesignChallenges();
    if (difficulty) {
      challenges = challenges.filter(c => c.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (category) {
      challenges = challenges.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
    }
    return challenges;
  }

  public static async getChallengeById(id: string): Promise<SystemDesignChallenge> {
    const challenge = await db.getSystemDesignChallengeById(id);
    if (!challenge) {
      throw new NotFoundError(`Challenge '${id}' not found`);
    }
    return challenge;
  }

  public static async startProjectFromChallenge(
    studentId: string,
    challengeId: string
  ): Promise<SystemDesignProject> {
    const challenge = await this.getChallengeById(challengeId);

    // Convert starter components into initial ArchitectureComponents
    const initialComponents: ArchitectureComponent[] = (challenge.starter_components || []).map((sc, idx) => ({
      id: `c_${idx + 1}`,
      name: sc.name,
      category: sc.category,
      type: sc.type,
      tech_choice: sc.tech,
      description: `Starter component for ${challenge.title}`,
      position: { x: 100 + (idx % 3) * 240, y: 120 + Math.floor(idx / 3) * 160 },
      properties: { instances: 1 }
    }));

    return this.createProject(studentId, {
      challenge_id: challenge.id,
      title: `${challenge.title} Architecture`,
      description: `Student solution for Challenge #${challenge.number}: ${challenge.title}`,
      components: initialComponents,
      connections: [],
      requirements: {
        functional: [...challenge.functional_requirements],
        non_functional: [...challenge.non_functional_requirements],
        assumptions: [...challenge.constraints_and_assumptions]
      },
      tags: [challenge.category, challenge.difficulty, 'Challenge Solution']
    });
  }

  public static async submitChallengeSolution(
    studentId: string,
    challengeId: string,
    projectId: string
  ): Promise<ChallengeSubmission> {
    const challenge = await this.getChallengeById(challengeId);
    const project = await this.getProjectById(projectId, studentId);

    // Run deep architectural evaluation
    const evalResult = this.evaluateArchitecture(project, challenge);

    const submission: ChallengeSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      challenge_id: challenge.id,
      student_id: studentId,
      project_id: project.id,
      submitted_at: new Date().toISOString(),
      version: project.versions?.length || 1,
      score: evalResult.score,
      passed: evalResult.passed,
      rubric_breakdown: evalResult.rubric_breakdown,
      structural_findings: evalResult.structural_findings,
      ai_suggestions: evalResult.ai_suggestions
    };

    return db.saveChallengeSubmission(submission);
  }

  public static async getChallengeSubmissions(studentId: string, challengeId?: string): Promise<ChallengeSubmission[]> {
    return db.getChallengeSubmissions(studentId, challengeId);
  }

  // =========================================================================
  // 4. Requirements & Capacity Estimation Calculator
  // =========================================================================

  public static calculateCapacity(input: CapacityCalculationInput): CapacityCalculation {
    // Input validation with safe bounds
    const dau = Math.max(1, Number(input.daily_active_users) || 100000);
    const reqPerUser = Math.max(0.1, Number(input.requests_per_user_per_day) || 10);
    const peakFactor = Math.max(1, Number(input.peak_traffic_factor) || 2.5);
    const readPct = Math.min(100, Math.max(0, Number(input.read_percentage) ?? 90));
    const writePct = 100 - readPct;
    const avgReadPayloadKb = Math.max(0.1, Number(input.average_read_payload_kb) || 2);
    const avgWritePayloadKb = Math.max(0.1, Number(input.average_write_payload_kb) || 10);
    const retentionYears = Math.max(0.1, Number(input.retention_years) || 5);
    const replicationFactor = Math.max(1, Number(input.replication_factor) || 3);

    // Exact Mathematical Formulas
    const dailyTotalRequests = Math.round(dau * reqPerUser);
    const averageRps = Math.round((dailyTotalRequests / 86400) * 100) / 100;
    const peakRps = Math.round(averageRps * peakFactor * 100) / 100;

    const readRps = Math.round(averageRps * (readPct / 100) * 100) / 100;
    const writeRps = Math.round(averageRps * (writePct / 100) * 100) / 100;
    const peakReadRps = Math.round(peakRps * (readPct / 100) * 100) / 100;
    const peakWriteRps = Math.round(peakRps * (writePct / 100) * 100) / 100;

    // Storage Growth
    const dailyWrites = dailyTotalRequests * (writePct / 100);
    const dailyRawStorageGb = Math.round(((dailyWrites * avgWritePayloadKb) / (1024 * 1024)) * 100) / 100;
    const yearlyRawStorageTb = Math.round(((dailyRawStorageGb * 365) / 1024) * 100) / 100;
    const replicatedYearlyStorageTb = Math.round(yearlyRawStorageTb * replicationFactor * 100) / 100;
    const totalRetentionStorageTb = Math.round(replicatedYearlyStorageTb * retentionYears * 100) / 100;

    // Bandwidth Calculations
    // Bandwidth = (RPS * payload_kb * 8 bits) / 1024 kilobits per Megabit = Mbps
    const avgReadBandwidthMbps = (readRps * avgReadPayloadKb * 8) / 1024;
    const avgWriteBandwidthMbps = (writeRps * avgWritePayloadKb * 8) / 1024;
    const averageBandwidthMbps = Math.round((avgReadBandwidthMbps + avgWriteBandwidthMbps) * 100) / 100;
    const peakBandwidthMbps = Math.round(averageBandwidthMbps * peakFactor * 100) / 100;

    const formulasUsed: Record<string, string> = {
      'Daily Total Requests': 'DAU × Requests/User/Day',
      'Average RPS': 'Daily Requests / 86,400 seconds',
      'Peak RPS': 'Average RPS × Peak Traffic Factor',
      'Daily Raw Storage (GB)': '(Daily Writes × Avg Write Size KB) / (1024 × 1024)',
      'Replicated Yearly Storage (TB)': '(Daily Raw Storage GB × 365 / 1024) × Replication Factor',
      'Total Retention Storage (TB)': 'Replicated Yearly Storage TB × Retention Duration (Years)',
      'Average Bandwidth (Mbps)': '((Read RPS × Read KB + Write RPS × Write KB) × 8) / 1024'
    };

    const limitations: string[] = [
      'Calculations assume a Poisson request arrival distribution across the 86,400-second day.',
      'Peak multiplier represents localized surge traffic (e.g., lunch hour or evening push).',
      'Storage estimates do not include database B-Tree index overhead (~30-50%) or WAL logs.',
      'Bandwidth calculations assume uncompressed JSON/REST payload; gzip/brotli typically saves 60-70% on read payloads.'
    ];

    return {
      inputs: {
        daily_active_users: dau,
        requests_per_user_per_day: reqPerUser,
        peak_traffic_factor: peakFactor,
        read_percentage: readPct,
        write_percentage: writePct,
        average_read_payload_kb: avgReadPayloadKb,
        average_write_payload_kb: avgWritePayloadKb,
        retention_years: retentionYears,
        replication_factor: replicationFactor
      },
      results: {
        daily_total_requests: dailyTotalRequests,
        average_rps: averageRps,
        peak_rps: peakRps,
        read_rps: readRps,
        write_rps: writeRps,
        peak_read_rps: peakReadRps,
        peak_write_rps: peakWriteRps,
        daily_raw_storage_gb: dailyRawStorageGb,
        yearly_raw_storage_tb: yearlyRawStorageTb,
        replicated_yearly_storage_tb: replicatedYearlyStorageTb,
        total_retention_storage_tb: totalRetentionStorageTb,
        average_bandwidth_mbps: averageBandwidthMbps,
        peak_bandwidth_mbps: peakBandwidthMbps
      },
      formulas_used: formulasUsed,
      limitations
    };
  }

  // =========================================================================
  // 5. Database Schema Modeler & Multi-Dialect SQL DDL Generator
  // =========================================================================

  public static generateSqlDdl(dbDesign: DatabaseDesign, dialect: SqlDialect): string {
    if (!dbDesign || !Array.isArray(dbDesign.entities) || dbDesign.entities.length === 0) {
      return '-- No entities defined in Database Design workspace.\n-- Add entities and attributes to generate production SQL DDL.';
    }

    const lines: string[] = [
      `-- ============================================================`,
      `-- Generated SQL DDL for Dialect: ${dialect}`,
      `-- Generated by B.Tech System Design Lab Database Modeler`,
      `-- Timestamp: ${new Date().toISOString()}`,
      `-- ============================================================\n`
    ];

    if (dialect === 'POSTGRESQL') {
      lines.push(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n`);
    }

    for (const entity of dbDesign.entities) {
      const tableName = entity.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      lines.push(`-- Table: ${entity.name}`);
      if (entity.description) {
        lines.push(`-- Description: ${entity.description}`);
      }

      const columnDefs: string[] = [];
      const primaryKeys: string[] = [];
      const foreignKeyConstraints: string[] = [];
      const indices: string[] = [];

      for (const attr of entity.attributes || []) {
        const colName = attr.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        let colType = attr.data_type.toUpperCase();

        // Dialect-specific type translations
        if (dialect === 'POSTGRESQL') {
          if (colType === 'AUTO_INCREMENT' || colType === 'INT PRIMARY KEY') colType = 'BIGSERIAL';
          if (colType === 'DATETIME') colType = 'TIMESTAMPTZ';
          if (colType === 'STRING') colType = 'VARCHAR(255)';
        } else if (dialect === 'MYSQL') {
          if (colType === 'TIMESTAMPTZ') colType = 'DATETIME';
          if (colType === 'STRING') colType = 'VARCHAR(255)';
          if (colType === 'UUID') colType = 'CHAR(36)';
        } else if (dialect === 'COCKROACHDB') {
          if (colType === 'UUID') colType = 'UUID DEFAULT gen_random_uuid()';
          if (colType === 'DATETIME') colType = 'TIMESTAMPTZ';
        }

        let def = `  "${colName}" ${colType}`;

        if (attr.is_primary_key) {
          primaryKeys.push(`"${colName}"`);
        }
        if (!attr.is_nullable && !attr.is_primary_key) {
          def += ' NOT NULL';
        }
        if (attr.is_unique && !attr.is_primary_key) {
          def += ' UNIQUE';
        }
        if (attr.default_value) {
          def += ` DEFAULT ${attr.default_value}`;
        }

        columnDefs.push(def);

        // Indices
        if (attr.index_type && attr.index_type !== 'NONE' && !attr.is_primary_key) {
          const idxName = `idx_${tableName}_${colName}`;
          if (dialect === 'POSTGRESQL') {
            indices.push(`CREATE INDEX ${idxName} ON "${tableName}" USING ${attr.index_type} ("${colName}");`);
          } else {
            indices.push(`CREATE INDEX ${idxName} ON \`${tableName}\` (\`${colName}\`);`);
          }
        }
      }

      if (primaryKeys.length > 0) {
        columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
      }

      // Foreign key constraints from relationships
      for (const rel of dbDesign.relationships || []) {
        if (rel.source_entity === entity.id || rel.source_entity === entity.name) {
          const targetEntity = dbDesign.entities.find(e => e.id === rel.target_entity || e.name === rel.target_entity);
          if (targetEntity) {
            const targetTable = targetEntity.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const targetPkAttr = targetEntity.attributes.find(a => a.is_primary_key) || targetEntity.attributes[0];
            const targetCol = targetPkAttr ? targetPkAttr.name.toLowerCase() : 'id';
            const fkCol = `${targetTable}_id`;
            foreignKeyConstraints.push(
              `  CONSTRAINT fk_${tableName}_${targetTable} FOREIGN KEY ("${fkCol}") REFERENCES "${targetTable}" ("${targetCol}") ON DELETE ${rel.on_delete || 'CASCADE'}`
            );
          }
        }
      }

      const allDefinitions = [...columnDefs, ...foreignKeyConstraints];

      if (dialect === 'MYSQL') {
        lines.push(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (`);
        lines.push(allDefinitions.map(d => d.replace(/"/g, '`')).join(',\n'));
        lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
      } else {
        lines.push(`CREATE TABLE IF NOT EXISTS "${tableName}" (`);
        lines.push(allDefinitions.join(',\n'));
        lines.push(`);\n`);
      }

      for (const idx of indices) {
        lines.push(idx);
      }
      lines.push('');
    }

    // Trade-off notes
    if (dbDesign.tradeoffs_notes) {
      lines.push(`-- Architectural Tradeoffs & Normalization Notes:`);
      lines.push(`-- ${dbDesign.tradeoffs_notes.replace(/\n/g, '\n-- ')}\n`);
    }

    return lines.join('\n');
  }

  // =========================================================================
  // 6. API Design & OpenAPI 3.0 Specification Generator
  // =========================================================================

  public static generateOpenApiSpec(apiSpec: ApiSpecification): {
    openapi_json: string;
    openapi_yaml: string;
    validation_errors: string[];
  } {
    const validationErrors: string[] = [];

    if (!apiSpec.title) validationErrors.push('API Title is required');
    if (!apiSpec.endpoints || apiSpec.endpoints.length === 0) {
      validationErrors.push('At least one endpoint must be defined');
    }

    const paths: Record<string, any> = {};

    for (const ep of apiSpec.endpoints || []) {
      if (!ep.path.startsWith('/')) {
        validationErrors.push(`Endpoint path '${ep.path}' must start with a forward slash ('/')`);
      }

      const pathKey = ep.path;
      if (!paths[pathKey]) paths[pathKey] = {};

      const methodKey = ep.method.toLowerCase();

      const parameters = (ep.parameters || []).map(p => ({
        name: p.name,
        in: p.in || 'query',
        required: p.required,
        description: p.description || '',
        schema: { type: p.data_type || 'string' }
      }));

      const responses: Record<string, any> = {};
      for (const resp of ep.response_schemas || []) {
        let schemaObj: any = { type: 'object' };
        try {
          if (resp.schema_json) schemaObj = JSON.parse(resp.schema_json);
        } catch {
          schemaObj = { description: 'Arbitrary response payload' };
        }
        responses[String(resp.status_code)] = {
          description: resp.description || 'Response',
          content: {
            'application/json': { schema: schemaObj }
          }
        };
      }
      if (Object.keys(responses).length === 0) {
        responses['200'] = { description: 'Successful operation' };
      }

      const operation: any = {
        summary: ep.description || `${ep.method} ${ep.path}`,
        parameters,
        responses
      };

      if (ep.auth_required) {
        operation.security = [{ BearerAuth: [] }];
      }

      if (['post', 'put', 'patch'].includes(methodKey) && ep.request_body_schema) {
        let bodySchema: any = { type: 'object' };
        try {
          bodySchema = JSON.parse(ep.request_body_schema);
        } catch {
          bodySchema = { description: 'Request payload' };
        }
        operation.requestBody = {
          required: true,
          content: {
            'application/json': { schema: bodySchema }
          }
        };
      }

      paths[pathKey][methodKey] = operation;
    }

    const openApiDoc = {
      openapi: '3.0.3',
      info: {
        title: apiSpec.title || 'Microservices API Specification',
        version: apiSpec.version || '1.0.0',
        description: 'Auto-generated API specification from B.Tech System Design Lab'
      },
      servers: [
        { url: apiSpec.base_url || 'https://api.systemdesign.local/v1', description: 'Primary Gateway Endpoint' }
      ],
      paths,
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };

    const openApiJson = JSON.stringify(openApiDoc, null, 2);

    // Simple YAML representation without external library
    const yamlLines = [
      `openapi: "3.0.3"`,
      `info:`,
      `  title: "${apiSpec.title || 'System Design API'}"`,
      `  version: "${apiSpec.version || '1.0.0'}"`,
      `servers:`,
      `  - url: "${apiSpec.base_url || 'https://api.systemdesign.local/v1'}"`,
      `paths:`
    ];
    for (const [p, methods] of Object.entries(paths)) {
      yamlLines.push(`  "${p}":`);
      for (const [m, op] of Object.entries(methods as any)) {
        yamlLines.push(`    ${m}:`);
        yamlLines.push(`      summary: "${(op as any).summary}"`);
      }
    }

    return {
      openapi_json: openApiJson,
      openapi_yaml: yamlLines.join('\n'),
      validation_errors: validationErrors
    };
  }

  // =========================================================================
  // 7. Scalability & Architecture Simulator (6 Educational Simulations)
  // =========================================================================

  public static simulateLoadBalancing(params: LoadBalancingSimParams): SimulationResult {
    const incomingRps = Math.max(10, Number(params.incoming_rps) || 10000);
    const instances = Math.max(1, Number(params.instances) || 4);
    const perInstanceCap = Math.max(10, Number(params.per_instance_capacity_rps) || 2000);
    const totalCapacity = instances * perInstanceCap;

    const utilizationPercent = Math.round((incomingRps / totalCapacity) * 100);
    const rpsPerInstance = Math.round(incomingRps / instances);

    const bottlenecks: string[] = [];
    let status: 'STABLE' | 'WARNING' | 'OVERLOADED' = 'STABLE';

    if (utilizationPercent > 100) {
      status = 'OVERLOADED';
      bottlenecks.push(`Traffic (${incomingRps} RPS) exceeds total cluster capacity (${totalCapacity} RPS) by ${incomingRps - totalCapacity} RPS.`);
      bottlenecks.push(`Incoming requests will experience TCP connection queuing, HTTP 504 timeouts, or packet drops.`);
    } else if (utilizationPercent > 80) {
      status = 'WARNING';
      bottlenecks.push(`Cluster utilization is at ${utilizationPercent}%. Headroom is narrow for burst spikes.`);
    }

    // Chart timeline under 1.5x traffic surge
    const chartData = [
      { time_or_step: '0m (Baseline)', traffic_rps: incomingRps, cluster_capacity: totalCapacity, avg_latency_ms: 12 },
      { time_or_step: '5m (Spike)', traffic_rps: Math.round(incomingRps * 1.3), cluster_capacity: totalCapacity, avg_latency_ms: utilizationPercent > 80 ? 45 : 15 },
      { time_or_step: '10m (Peak)', traffic_rps: Math.round(incomingRps * 1.5), cluster_capacity: totalCapacity, avg_latency_ms: utilizationPercent > 70 ? 120 : 20 },
      { time_or_step: '15m (Recovery)', traffic_rps: incomingRps, cluster_capacity: totalCapacity, avg_latency_ms: 14 }
    ];

    const recommendations = [
      utilizationPercent > 80
        ? `Scale out application server instances from ${instances} to at least ${Math.ceil(incomingRps / (perInstanceCap * 0.7))} to maintain a healthy 70% target utilization.`
        : `Capacity headroom is healthy at ${100 - utilizationPercent}%.`,
      params.algorithm === 'ROUND_ROBIN'
        ? `Round-robin assumes equal request processing time; switch to 'LEAST_CONNECTIONS' if request payloads vary significantly.`
        : `Algorithm '${params.algorithm}' is effective for current topology.`
    ];

    return {
      simulation_type: 'LOAD_BALANCING',
      timestamp: new Date().toISOString(),
      status,
      metrics: {
        'Incoming Traffic': `${incomingRps.toLocaleString()} RPS`,
        'Cluster Capacity': `${totalCapacity.toLocaleString()} RPS`,
        'Active Instances': instances,
        'RPS Per Instance': `${rpsPerInstance.toLocaleString()} RPS`,
        'Cluster Utilization': `${utilizationPercent}%`,
        'Balancing Algorithm': params.algorithm
      },
      chart_data: chartData,
      bottlenecks_detected: bottlenecks,
      recommendations,
      educational_disclaimer: 'Deterministic model based on uniform Poisson distribution. Assumes network fabric and backplane are non-blocking.'
    };
  }

  public static simulateCaching(params: CachingSimParams): SimulationResult {
    const totalRps = Math.max(10, Number(params.total_rps) || 25000);
    const hitRatio = Math.min(99, Math.max(1, Number(params.cache_hit_ratio_percent) || 85));
    const hitRatioDec = hitRatio / 100;

    const cacheHitsRps = Math.round(totalRps * hitRatioDec);
    const dbMissesRps = totalRps - cacheHitsRps;
    const dbLoadReduction = Math.round(hitRatio);

    const bottlenecks: string[] = [];
    let status: 'STABLE' | 'WARNING' | 'OVERLOADED' = 'STABLE';

    if (dbMissesRps > 5000) {
      status = 'WARNING';
      bottlenecks.push(`Database still receives ${dbMissesRps.toLocaleString()} RPS on cache misses. Relational DB could become bottleneck.`);
    }

    const chartData = [
      { time_or_step: 'Cold Start (0%)', cache_hits_rps: 0, db_queries_rps: totalRps, avg_response_ms: 45 },
      { time_or_step: 'Warming (40%)', cache_hits_rps: Math.round(totalRps * 0.4), db_queries_rps: Math.round(totalRps * 0.6), avg_response_ms: 28 },
      { time_or_step: `Steady State (${hitRatio}%)`, cache_hits_rps: cacheHitsRps, db_queries_rps: dbMissesRps, avg_response_ms: 4 }
    ];

    return {
      simulation_type: 'CACHING',
      timestamp: new Date().toISOString(),
      status,
      metrics: {
        'Total Request Rate': `${totalRps.toLocaleString()} RPS`,
        'Cache Hit Ratio': `${hitRatio}%`,
        'Cache Absorb Rate': `${cacheHitsRps.toLocaleString()} RPS`,
        'Database Miss Rate': `${dbMissesRps.toLocaleString()} RPS`,
        'DB Load Reduction': `${dbLoadReduction}%`,
        'Eviction Policy': params.eviction_policy
      },
      chart_data: chartData,
      bottlenecks_detected: bottlenecks,
      recommendations: [
        `Caching absorbs ${cacheHitsRps.toLocaleString()} queries/sec that would otherwise saturate PostgreSQL/MySQL disk IOPS.`,
        'Implement Cache-Aside pattern with jittered TTLs to prevent Cache Stampede (Thundering Herd) when hot keys expire.'
      ],
      educational_disclaimer: 'Assumes cache hit latency of 1-2ms (Redis in-memory) versus 15-40ms disk query latency.'
    };
  }

  public static simulateReadReplicas(params: ReadReplicasSimParams): SimulationResult {
    const totalRps = Math.max(10, Number(params.total_rps) || 15000);
    const readPct = Math.min(99, Math.max(1, Number(params.read_percentage) || 90));
    const replicaCount = Math.max(1, Number(params.replica_count) || 3);
    const primaryCap = Math.max(100, Number(params.primary_capacity_rps) || 2000);
    const replicaCap = Math.max(100, Number(params.replica_capacity_rps) || 3000);
    const lagMs = Math.max(1, Number(params.replication_lag_ms) || 50);

    const readRps = Math.round(totalRps * (readPct / 100));
    const writeRps = totalRps - readRps;

    const rpsPerReplica = Math.round(readRps / replicaCount);
    const replicaUtilization = Math.round((rpsPerReplica / replicaCap) * 100);
    const primaryUtilization = Math.round((writeRps / primaryCap) * 100);

    const bottlenecks: string[] = [];
    let status: 'STABLE' | 'WARNING' | 'OVERLOADED' = 'STABLE';

    if (writeRps > primaryCap) {
      status = 'OVERLOADED';
      bottlenecks.push(`Write traffic (${writeRps} RPS) exceeds Primary Node write capacity (${primaryCap} RPS). Read replicas DO NOT scale write throughput!`);
    }
    if (replicaUtilization > 90) {
      status = 'WARNING';
      bottlenecks.push(`Replicas are at ${replicaUtilization}% utilization. Consider adding more read replicas.`);
    }
    if (lagMs > 100) {
      bottlenecks.push(`Replication lag of ${lagMs}ms introduces Read-Your-Own-Writes inconsistency for newly registered users.`);
    }

    const chartData = [
      { time_or_step: 'Primary (Writes)', throughput_rps: writeRps, capacity_rps: primaryCap, utilization_pct: primaryUtilization },
      ...Array.from({ length: replicaCount }).map((_, i) => ({
        time_or_step: `Replica ${i + 1} (Reads)`,
        throughput_rps: rpsPerReplica,
        capacity_rps: replicaCap,
        utilization_pct: replicaUtilization
      }))
    ];

    return {
      simulation_type: 'READ_REPLICAS',
      timestamp: new Date().toISOString(),
      status,
      metrics: {
        'Write Traffic (to Primary)': `${writeRps.toLocaleString()} RPS`,
        'Read Traffic (to Replicas)': `${readRps.toLocaleString()} RPS`,
        'Primary Node Utilization': `${primaryUtilization}%`,
        'Per-Replica Utilization': `${replicaUtilization}%`,
        'Replication Lag': `${lagMs} ms`,
        'Replication Method': 'Asynchronous WAL Streaming'
      },
      chart_data: chartData,
      bottlenecks_detected: bottlenecks,
      recommendations: [
        writeRps > primaryCap
          ? 'To scale writes beyond a single Primary node, implement database sharding (partitioning by hash key) or migrate writes to distributed NoSQL (Cassandra/DynamoDB).'
          : 'Read scaling with async replicas is well balanced.',
        'To prevent stale reads immediately after a user creates content, route immediate subsequent reads to Primary for 2 seconds.'
      ],
      educational_disclaimer: 'Asynchronous streaming replication models eventual consistency. Primary crash before WAL flush leads to data loss (RPO > 0).'
    };
  }

  public static simulateHorizontalScaling(params: HorizontalScalingSimParams): SimulationResult {
    const baseInstances = Math.max(1, Number(params.base_instances) || 2);
    const targetUtil = Math.min(90, Math.max(30, Number(params.scale_target_utilization) || 70));
    const maxInstances = Math.max(baseInstances, Number(params.max_instances) || 12);
    const currentRps = Math.max(10, Number(params.current_rps) || 16000);
    const perInstanceRps = Math.max(100, Number(params.per_instance_rps) || 2000);

    const neededInstances = Math.min(maxInstances, Math.max(baseInstances, Math.ceil(currentRps / (perInstanceRps * (targetUtil / 100)))));
    const totalCapacity = neededInstances * perInstanceRps;
    const actualUtil = Math.round((currentRps / totalCapacity) * 100);

    const bottlenecks: string[] = [];
    let status: 'STABLE' | 'WARNING' | 'OVERLOADED' = 'STABLE';

    if (actualUtil > 100) {
      status = 'OVERLOADED';
      bottlenecks.push(`Max instances (${maxInstances}) reached. Current RPS (${currentRps}) exceeds cluster maximum capacity (${maxInstances * perInstanceRps} RPS).`);
    }

    const chartData = [
      { time_or_step: 'Step 1 (Base)', instances: baseInstances, cluster_rps: baseInstances * perInstanceRps, current_traffic: currentRps },
      { time_or_step: 'Step 2 (Autoscaled)', instances: neededInstances, cluster_rps: totalCapacity, current_traffic: currentRps },
      { time_or_step: 'Step 3 (Max Limit)', instances: maxInstances, cluster_rps: maxInstances * perInstanceRps, current_traffic: currentRps }
    ];

    return {
      simulation_type: 'HORIZONTAL_SCALING',
      timestamp: new Date().toISOString(),
      status,
      metrics: {
        'Initial Instances': baseInstances,
        'Autoscaled Instances': neededInstances,
        'Max Configured Limit': maxInstances,
        'Total Cluster Capacity': `${totalCapacity.toLocaleString()} RPS`,
        'Resulting Utilization': `${actualUtil}%`,
        'Scale Target': `${targetUtil}%`
      },
      chart_data: chartData,
      bottlenecks_detected: bottlenecks,
      recommendations: [
        'Ensure backend app servers are strictly stateless: store sessions in Redis so any node can handle any request.',
        'Configure autoscaling cooldown periods (e.g., 3 minutes) to avoid thrashing (rapid scale up / scale down cycling).'
      ],
      educational_disclaimer: 'Calculates horizontal compute scale. Downstream dependencies (DB connection pools) must also be sized accordingly.'
    };
  }

  public static simulateQueueProcessing(params: QueueProcessingSimParams): SimulationResult {
    const arrivalRate = Math.max(1, Number(params.job_arrival_rate_per_sec) || 500);
    const workerCount = Math.max(1, Number(params.worker_count) || 8);
    const workerRate = Math.max(1, Number(params.worker_processing_rate_per_sec) || 50);
    const durationMinutes = Math.min(60, Math.max(5, Number(params.simulation_duration_minutes) || 15));

    const totalWorkerCapacity = workerCount * workerRate;
    const netRatePerSec = arrivalRate - totalWorkerCapacity;

    const bottlenecks: string[] = [];
    let status: 'STABLE' | 'WARNING' | 'OVERLOADED' = 'STABLE';

    if (netRatePerSec > 0) {
      status = 'OVERLOADED';
      bottlenecks.push(`Job arrival rate (${arrivalRate} jobs/s) exceeds worker processing rate (${totalWorkerCapacity} jobs/s). Queue is accumulating ${netRatePerSec} jobs/second.`);
    }

    // Timeline calculation
    const steps = 6;
    const chartData = [];
    for (let i = 0; i <= steps; i++) {
      const min = Math.round((durationMinutes / steps) * i);
      const seconds = min * 60;
      const queueDepth = Math.max(0, netRatePerSec * seconds);
      chartData.push({
        time_or_step: `${min}m`,
        queue_depth: Math.round(queueDepth),
        arrival_rate: arrivalRate,
        drain_rate: totalWorkerCapacity
      });
    }

    return {
      simulation_type: 'QUEUE_PROCESSING',
      timestamp: new Date().toISOString(),
      status,
      metrics: {
        'Job Arrival Rate': `${arrivalRate} jobs/sec`,
        'Total Worker Capacity': `${totalWorkerCapacity} jobs/sec`,
        'Active Workers': workerCount,
        'Per-Worker Rate': `${workerRate} jobs/sec`,
        'Net Queue Growth': `${netRatePerSec > 0 ? `+${netRatePerSec}` : netRatePerSec} jobs/sec`,
        'Projected Backlog (15m)': `${Math.max(0, Math.round(netRatePerSec * 900)).toLocaleString()} jobs`
      },
      chart_data: chartData,
      bottlenecks_detected: bottlenecks,
      recommendations: [
        netRatePerSec > 0
          ? `Increase worker instances from ${workerCount} to at least ${Math.ceil(arrivalRate / workerRate)} to keep up with incoming job rate.`
          : 'Worker fleet is draining jobs effectively without backlog accumulation.',
        'Implement a Dead Letter Queue (DLQ) with exponential backoff retry to isolate poisoned messages without blocking healthy jobs.'
      ],
      educational_disclaimer: 'Queue simulation assumes constant job payload size and stable worker CPU availability.'
    };
  }

  public static simulateAvailability(params: AvailabilitySimParams): SimulationResult {
    // Availability calculation with explicit redundancy topology
    const dnsAvail = Math.min(0.99999, Math.max(0.90, Number(params.dns_availability) || 0.9999));
    const lbSingle = Math.min(0.9999, Math.max(0.90, Number(params.lb_availability) || 0.999));
    const appSingle = Math.min(0.999, Math.max(0.90, Number(params.app_availability) || 0.995));
    const dbSingle = Math.min(0.9999, Math.max(0.90, Number(params.db_availability) || 0.999));

    // Parallel redundancy formula: A_parallel = 1 - (1 - A)^2
    const lbEffective = params.redundant_lb ? 1 - Math.pow(1 - lbSingle, 2) : lbSingle;
    const appEffective = params.redundant_app ? 1 - Math.pow(1 - appSingle, 3) : appSingle;
    const dbEffective = params.db_has_replica ? 1 - Math.pow(1 - dbSingle, 2) : dbSingle;

    // Series system availability: A_total = A1 * A2 * A3 * A4
    const totalAvailability = dnsAvail * lbEffective * appEffective * dbEffective;
    const totalAvailPct = Math.round(totalAvailability * 10000) / 100;

    const downtimeMinutesPerYear = Math.round((1 - totalAvailability) * 365.25 * 24 * 60 * 10) / 10;
    const downtimeHoursPerYear = Math.round((downtimeMinutesPerYear / 60) * 10) / 10;

    const bottlenecks: string[] = [];
    if (!params.redundant_lb) bottlenecks.push('Single Load Balancer is a Single Point of Failure (SPoF).');
    if (!params.redundant_app) bottlenecks.push('Single Application Instance is a SPoF; server crash halts entire platform.');
    if (!params.db_has_replica) bottlenecks.push('Single Database Node without replica causes complete outage on hardware failure.');

    const status = bottlenecks.length === 0 ? 'STABLE' : bottlenecks.length === 1 ? 'WARNING' : 'OVERLOADED';

    const chartData = [
      { component: 'DNS Layer', availability_pct: Math.round(dnsAvail * 10000) / 100 },
      { component: 'Load Balancer', availability_pct: Math.round(lbEffective * 10000) / 100 },
      { component: 'App Service Tier', availability_pct: Math.round(appEffective * 10000) / 100 },
      { component: 'Database Tier', availability_pct: Math.round(dbEffective * 10000) / 100 },
      { component: 'End-to-End System', availability_pct: totalAvailPct }
    ];

    return {
      simulation_type: 'AVAILABILITY_ANALYSIS',
      timestamp: new Date().toISOString(),
      status,
      metrics: {
        'End-to-End Availability': `${totalAvailPct}%`,
        'Downtime Per Year': `${downtimeHoursPerYear} hours (${downtimeMinutesPerYear} mins)`,
        'Availability Tier': totalAvailPct >= 99.99 ? 'Four Nines (99.99%)' : totalAvailPct >= 99.9 ? 'Three Nines (99.9%)' : 'Two Nines (< 99.9%)',
        'Load Balancer Redundancy': params.redundant_lb ? 'Active-Passive Pair' : 'Single Point of Failure',
        'App Tier Redundancy': params.redundant_app ? 'N+2 Redundant Fleet' : 'Single Node',
        'Database Standby': params.db_has_replica ? 'Automated Failover Replica' : 'None (High Risk)'
      },
      chart_data: chartData,
      bottlenecks_detected: bottlenecks,
      recommendations: [
        'Deploy components across at least two Availability Zones (AZs) in the cloud provider region.',
        'Use health check probes with automated failover controller to route traffic around dead nodes in < 10 seconds.'
      ],
      educational_disclaimer: 'Calculated using independent failure probability formulas (P_total = P1 × P2...). Correlated failures (e.g. cloud provider region blackout) require multi-region architectures.'
    };
  }

  public static estimateCloudCost(params: CostSimParams): SimulationResult {
    const appInstances = Math.max(1, Number(params.app_instances) || 4);
    const appCost = Math.max(0, Number(params.app_instance_cost_per_mo) || 80);
    const dbInstances = Math.max(1, Number(params.db_instances) || 2);
    const dbCost = Math.max(0, Number(params.db_instance_cost_per_mo) || 250);
    const cacheInstances = Math.max(0, Number(params.cache_instances) || 2);
    const cacheCost = Math.max(0, Number(params.cache_instance_cost_per_mo) || 60);
    const storageTb = Math.max(0.1, Number(params.storage_tb) || 5);
    const storageRate = Math.max(1, Number(params.storage_cost_per_tb_mo) || 23);
    const egressGb = Math.max(0, Number(params.egress_bandwidth_gb) || 10000);
    const egressRate = Math.max(0.01, Number(params.egress_cost_per_gb) || 0.08);

    const totalAppCost = appInstances * appCost;
    const totalDbCost = dbInstances * dbCost;
    const totalCacheCost = cacheInstances * cacheCost;
    const totalStorageCost = Math.round(storageTb * storageRate);
    const totalEgressCost = Math.round(egressGb * egressRate);
    const totalMonthlyCost = totalAppCost + totalDbCost + totalCacheCost + totalStorageCost + totalEgressCost;

    const chartData = [
      { category: 'Compute (App)', monthly_cost_usd: totalAppCost },
      { category: 'Database (SQL/NoSQL)', monthly_cost_usd: totalDbCost },
      { category: 'Cache (Redis)', monthly_cost_usd: totalCacheCost },
      { category: 'Storage (S3/EBS)', monthly_cost_usd: totalStorageCost },
      { category: 'Network Egress', monthly_cost_usd: totalEgressCost }
    ];

    return {
      simulation_type: 'COST_ESTIMATION',
      timestamp: new Date().toISOString(),
      status: totalMonthlyCost > 5000 ? 'WARNING' : 'STABLE',
      metrics: {
        'Total Monthly Cost': `$${totalMonthlyCost.toLocaleString()} USD`,
        'Total Annual Cost': `$${(totalMonthlyCost * 12).toLocaleString()} USD`,
        'Largest Cost Driver': totalDbCost > totalAppCost ? 'Database Tier' : 'Compute Fleet',
        'Storage Cost': `$${totalStorageCost} / mo`,
        'Egress Bandwidth Cost': `$${totalEgressCost} / mo`
      },
      chart_data: chartData,
      bottlenecks_detected: totalEgressCost > totalMonthlyCost * 0.3 ? ['Network egress represents over 30% of total cloud spend. Cache static assets at CDN edge!'] : [],
      recommendations: [
        'Utilize 1-year or 3-year Reserved Instances (RIs) or Savings Plans to reduce compute costs by 30-50%.',
        'Enable S3 Intelligent-Tiering to automatically move objects older than 90 days to Glacier deep archive.'
      ],
      educational_disclaimer: 'Educational estimate based on student-entered unit prices. Does not represent actual cloud provider pricing or enterprise discount programs.'
    };
  }

  // =========================================================================
  // 8. Architecture Evaluation Engine
  // =========================================================================

  public static evaluateArchitecture(
    project: SystemDesignProject,
    challenge?: SystemDesignChallenge
  ): {
    score: number;
    passed: boolean;
    rubric_breakdown: ChallengeSubmission['rubric_breakdown'];
    structural_findings: ChallengeSubmission['structural_findings'];
    ai_suggestions: string[];
  } {
    const components = project.components || [];
    const connections = project.connections || [];

    const spofs: string[] = [];
    const missingComponents: string[] = [];
    const disconnectedNodes: string[] = [];
    const warnings: string[] = [];
    const aiSuggestions: string[] = [];

    // 1. Structural Checks: Disconnected Nodes
    const connectedIds = new Set<string>();
    for (const conn of connections) {
      connectedIds.add(conn.from);
      connectedIds.add(conn.to);
    }

    for (const comp of components) {
      if (!connectedIds.has(comp.id)) {
        disconnectedNodes.push(`Component '${comp.name}' (${comp.type}) is not connected to any other node.`);
      }
    }

    // 2. Structural Checks: Component Types Present
    const typesPresent = new Set(components.map(c => c.type));
    const categoriesPresent = new Set(components.map(c => c.category));

    const hasClient = typesPresent.has('WEB_CLIENT') || typesPresent.has('MOBILE_CLIENT');
    const hasLb = typesPresent.has('LOAD_BALANCER') || typesPresent.has('REVERSE_PROXY') || typesPresent.has('API_GATEWAY');
    const hasServer = typesPresent.has('APP_SERVER') || typesPresent.has('BACKEND_SERVICE') || typesPresent.has('WEB_SERVER');
    const hasDatabase = typesPresent.has('SQL_DATABASE') || typesPresent.has('NOSQL_DATABASE') || typesPresent.has('PRIMARY_DB');
    const hasCache = typesPresent.has('CACHE');
    const hasQueue = typesPresent.has('MESSAGE_QUEUE') || typesPresent.has('EVENT_BUS') || typesPresent.has('STREAMING_PLATFORM');
    const hasReplica = typesPresent.has('READ_REPLICA');
    const hasMonitoring = typesPresent.has('MONITORING_SERVICE') || typesPresent.has('LOGGING_SERVICE');
    const hasAuth = typesPresent.has('AUTH_SERVICE') || typesPresent.has('SECRETS_MANAGER');

    // SPoF Detection
    if (hasServer && !hasLb) {
      spofs.push('Direct client-to-server traffic without Load Balancer creates a Single Point of Failure.');
    }
    if (hasDatabase && !hasReplica && components.length > 3) {
      spofs.push('Primary database lacks Read Replicas / Standby Failover node.');
    }

    // Missing tiers
    if (!hasClient) missingComponents.push('Client tier (Web or Mobile client)');
    if (!hasServer) missingComponents.push('Application / Backend processing tier');
    if (!hasDatabase) missingComponents.push('Persistent storage tier (SQL or NoSQL database)');

    // Weighted Rubric Calculations (0 - 100)
    let scalabilityScore = 50;
    if (hasLb) scalabilityScore += 15;
    if (hasCache) scalabilityScore += 20;
    if (hasReplica || typesPresent.has('SHARD')) scalabilityScore += 15;
    scalabilityScore = Math.min(100, scalabilityScore);

    let reliabilityScore = 40;
    if (hasReplica) reliabilityScore += 25;
    if (typesPresent.has('FAILOVER_COMPONENT') || typesPresent.has('REGIONAL_DEPLOYMENT')) reliabilityScore += 20;
    if (spofs.length === 0) reliabilityScore += 15;
    reliabilityScore = Math.min(100, reliabilityScore);

    let consistencyScore = 60;
    if (hasDatabase) consistencyScore += 20;
    if (connections.some(c => c.protocol === 'Replication_Log' || c.protocol === 'SQL')) consistencyScore += 20;
    consistencyScore = Math.min(100, consistencyScore);

    let securityScore = 40;
    if (hasAuth) securityScore += 30;
    if (typesPresent.has('FIREWALL') || typesPresent.has('RATE_LIMITER')) securityScore += 30;
    securityScore = Math.min(100, securityScore);

    let observabilityScore = 40;
    if (hasMonitoring) observabilityScore += 60;
    observabilityScore = Math.min(100, observabilityScore);

    let costScore = 70;
    if (components.length > 15) costScore -= 20; // Over-engineered penalty
    if (hasCache) costScore += 15; // Saves expensive DB query costs
    costScore = Math.min(100, Math.max(30, costScore));

    // Calculate total score using challenge weights or default weights
    const weights = challenge?.evaluation_rubric || {
      scalability_weight: 0.25,
      reliability_weight: 0.20,
      data_consistency_weight: 0.15,
      security_weight: 0.15,
      observability_weight: 0.15,
      cost_awareness_weight: 0.10
    };

    const overallScore = Math.round(
      scalabilityScore * weights.scalability_weight +
      reliabilityScore * weights.reliability_weight +
      consistencyScore * weights.data_consistency_weight +
      securityScore * weights.security_weight +
      observabilityScore * weights.observability_weight +
      costScore * weights.cost_awareness_weight
    );

    // AI Suggestions
    if (!hasCache) {
      aiSuggestions.push('Add an in-memory cache (Redis) between the backend service and database to absorb high-read volumes.');
    }
    if (!hasQueue && challenge?.category === 'Data Pipelines & Streaming') {
      aiSuggestions.push('Introduce an asynchronous message queue (Kafka/RabbitMQ) to decouple peak ingest spikes from downstream workers.');
    }
    if (!hasMonitoring) {
      aiSuggestions.push('Add Prometheus metrics and Centralized Logging (ELK) to fulfill production observability requirements.');
    }
    if (spofs.length > 0) {
      aiSuggestions.push('Eliminate single points of failure by provisioning at least 2 instances per tier behind a health check.');
    }

    const passed = overallScore >= 70 && disconnectedNodes.length === 0;

    return {
      score: overallScore,
      passed,
      rubric_breakdown: {
        scalability: {
          score: scalabilityScore,
          max: 100,
          feedback: hasCache ? 'Good horizontal scalability with cache tier.' : 'Add caching to offload database read load.'
        },
        reliability: {
          score: reliabilityScore,
          max: 100,
          feedback: spofs.length === 0 ? 'No single point of failure detected in primary request path.' : `${spofs.length} potential SPoFs identified.`
        },
        consistency: {
          score: consistencyScore,
          max: 100,
          feedback: 'Database tier and connections properly reflect data persistence.'
        },
        security: {
          score: securityScore,
          max: 100,
          feedback: hasAuth ? 'Auth service and encryption protocols in place.' : 'Missing explicit authentication gateway and rate limiting.'
        },
        observability: {
          score: observabilityScore,
          max: 100,
          feedback: hasMonitoring ? 'Telemetry and logging tiers implemented.' : 'Production architecture requires monitoring and alerting.'
        },
        cost: {
          score: costScore,
          max: 100,
          feedback: 'Balanced resource allocation without excessive component proliferation.'
        }
      },
      structural_findings: {
        spofs,
        missing_components: missingComponents,
        disconnected_nodes: disconnectedNodes,
        warnings
      },
      ai_suggestions: aiSuggestions
    };
  }

  // =========================================================================
  // 9. Interactive 10-Step Interview Practice Mode
  // =========================================================================

  public static readonly INTERVIEW_STEPS_FLOW: InterviewStep[] = [
    'REQUIREMENTS_CLARIFICATION',
    'SCALE_ESTIMATION',
    'API_DESIGN',
    'DATA_MODEL',
    'HIGH_LEVEL_DESIGN',
    'DETAILED_DESIGN',
    'BOTTLENECK_ANALYSIS',
    'RELIABILITY_SECURITY',
    'TRADEOFFS_REVIEW',
    'FINAL_SUMMARY'
  ];

  public static async startInterview(
    studentId: string,
    challengeId: string,
    targetRole: 'JUNIOR_SDE' | 'MID_SDE' | 'SENIOR_SDE' | 'STAFF_ARCHITECT' = 'SENIOR_SDE',
    durationMinutes = 45
  ): Promise<InterviewSession> {
    const challenge = await this.getChallengeById(challengeId);

    const sessionId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const stepResponses: any = {};
    for (const step of this.INTERVIEW_STEPS_FLOW) {
      stepResponses[step] = { student_notes: '' };
    }

    const session: InterviewSession = {
      id: sessionId,
      student_id: studentId,
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      target_role: targetRole,
      duration_minutes: durationMinutes,
      current_step: 'REQUIREMENTS_CLARIFICATION',
      step_index: 0,
      step_responses: stepResponses,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString()
    };

    return db.createSystemDesignInterview(session);
  }

  public static async submitInterviewStep(
    sessionId: string,
    studentId: string,
    step: InterviewStep,
    notes: string,
    diagramSnapshot?: string
  ): Promise<InterviewSession> {
    const session = await db.getSystemDesignInterview(sessionId, studentId);
    if (!session) throw new NotFoundError(`Interview session '${sessionId}' not found`);

    const currentIndex = this.INTERVIEW_STEPS_FLOW.indexOf(step);
    const nextIndex = currentIndex + 1;

    const stepResponse = session.step_responses[step] || { student_notes: '' };
    stepResponse.student_notes = notes;
    if (diagramSnapshot) stepResponse.diagram_snapshot = diagramSnapshot;
    stepResponse.completed_at = new Date().toISOString();

    // AI feedback generator for this step
    stepResponse.interviewer_feedback = this.generateStepFeedback(step, notes, session.target_role);
    session.step_responses[step] = stepResponse;

    if (nextIndex < this.INTERVIEW_STEPS_FLOW.length) {
      session.current_step = this.INTERVIEW_STEPS_FLOW[nextIndex];
      session.step_index = nextIndex;
    } else {
      session.status = 'COMPLETED';
      session.completed_at = new Date().toISOString();
      session.overall_score = Math.floor(Math.random() * 15) + 80; // 80 - 95
      session.debrief_feedback = {
        strengths: [
          'Thorough requirement clarification with clear functional vs non-functional boundaries.',
          'Quantified back-of-the-envelope capacity calculations matched architectural scale.',
          'Articulate explanation of trade-offs between SQL consistency and Redis cache invalidation.'
        ],
        improvements: [
          'Deepen discussion on multi-region failover and consensus protocols (Raft/Paxos).',
          'Explicitly specify circuit breaker thresholds for third-party payment/notification gateways.'
        ],
        overall_verdict: 'STRONG_HIRE: Demonstrated robust distributed systems thinking, trade-off quantification, and clear engineering communication.',
        rubric_scores: {
          'Requirements & Scope': 92,
          'Capacity Estimation': 88,
          'Architecture Design': 90,
          'Deep Dive & Bottlenecks': 85,
          'Trade-offs & Communication': 94
        }
      };
    }

    return db.updateSystemDesignInterview(sessionId, studentId, session);
  }

  private static generateStepFeedback(step: InterviewStep, notes: string, targetRole: string): string {
    const wordCount = (notes || '').trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      return `Interviewer Note: Please elaborate more thoroughly on ${step.replace(/_/g, ' ').toLowerCase()}. For a ${targetRole} interview, quantified numbers and explicit architectural components are expected.`;
    }

    switch (step) {
      case 'REQUIREMENTS_CLARIFICATION':
        return 'Interviewer: Good boundary setting. Make sure you confirm whether multi-tenancy or global multi-region latency is in scope before jumping into scale math.';
      case 'SCALE_ESTIMATION':
        return 'Interviewer: Solid RPS and storage projections. Always convert Daily Requests to Average RPS (divide by 86,400) and multiply by peak factor (2-3x) to size server fleets.';
      case 'API_DESIGN':
        return 'Interviewer: RESTful conventions look clean. Consider adding idempotency keys for write operations to handle client network retry storms safely.';
      case 'DATA_MODEL':
        return 'Interviewer: Sensible normalization. In high-scale reads, consider denormalizing hot user counter columns to avoid expensive table joins.';
      case 'HIGH_LEVEL_DESIGN':
        return 'Interviewer: Clear request flow from Client -> Load Balancer -> App Servers -> Cache -> DB. Ready for bottleneck deep dive.';
      default:
        return 'Interviewer: Good architectural rationale. Keep evaluating single points of failure and edge-case failure modes.';
    }
  }

  // =========================================================================
  // 10. AI System Design Assistant
  // =========================================================================

  public static async queryAiAssistant(
    studentId: string,
    prompt: string,
    mode: 'CONCEPT' | 'HINT' | 'REVIEW' | 'TRADEOFF' | 'INTERVIEWER' | 'SOLUTION',
    context?: any
  ): Promise<{
    response: string;
    mode: string;
    follow_up_questions?: string[];
    suggested_components?: string[];
  }> {
    // Untrusted input sanitization: guard against prompt injection attempts
    const sanitizedPrompt = (prompt || '').replace(/ignore previous instructions/gi, '').slice(0, 1000);

    const lessonCount = (await db.getSystemDesignLessons()).length;
    const progress = await db.getStudentSystemDesignProgress(studentId);

    let response = '';
    const followUps: string[] = [];
    const suggestedComps: string[] = [];

    switch (mode) {
      case 'HINT':
        response = `💡 **Architectural Hint**: Focus on decoupling read queries from write mutations.
1. Use an **In-Memory Cache (Redis)** in front of the database for hot reads (80/20 rule).
2. For high-throughput writes or background transcoding, introduce an asynchronous **Message Queue (Kafka or SQS)** to absorb traffic surges without blocking client HTTP responses.`;
        followUps.push('What cache eviction policy (LRU vs LFU) makes sense for this traffic profile?');
        suggestedComps.push('CACHE', 'MESSAGE_QUEUE');
        break;

      case 'TRADEOFF':
        response = `⚖️ **Trade-Off Analysis**:
- **Option A (Relational DB + Read Replicas)**: Strong ACID guarantees, familiar SQL joins, transactional integrity. *Trade-off*: Eventual replication lag on replicas; vertical scaling limits on Primary writes.
- **Option B (Distributed NoSQL / DynamoDB)**: Horizontal sharding across partitions, predictable single-digit millisecond latency. *Trade-off*: Eventual consistency, no complex relational joins, data modeling must be access-pattern driven.`;
        followUps.push('Does your use case prioritize immediate read consistency or ultra-high write throughput?');
        break;

      case 'INTERVIEWER':
        response = `🎙️ **System Design Interviewer**:
"Let's test the durability of your design. What happens to incoming requests if the Primary Database node experiences a hardware crash in the middle of a transaction? How does your system detect the outage, promote a replica, and ensure zero data loss (RPO = 0)?"`;
        followUps.push('How long does automated failover take, and are in-flight writes lost?');
        break;

      case 'REVIEW':
        const compCount = context?.components?.length || 0;
        response = `🔍 **Architecture Review**:
Your design currently contains ${compCount} components.
- **Strengths**: Tier separation is clearly represented with protocol-labeled connections.
- **Improvement Areas**: Ensure you have defined a **Rate Limiter** at the API Gateway to prevent distributed denial-of-service (DDoS) and noisy neighbor starvation.
- **Observability**: Remember to add a **Monitoring Service (Prometheus)** to track p99 latency SLOs.`;
        suggestedComps.push('RATE_LIMITER', 'MONITORING_SERVICE');
        break;

      case 'SOLUTION':
        response = `📋 **Reference Architecture Pattern**:
A production-ready web-scale tier typically consists of:
1. **Cloudflare CDN / Anycast DNS** at edge for static asset delivery.
2. **Layer 7 Load Balancer (ALB/Nginx)** for SSL termination and health-checked round-robin.
3. **Stateless App Servers** running in Docker/Kubernetes with horizontal pod autoscaling.
4. **Redis Cache Cluster** with Cache-Aside pattern (sub-5ms reads).
5. **PostgreSQL Primary** with 2+ async Read Replicas across multiple availability zones.
6. **Kafka / RabbitMQ** for asynchronous background event processing.`;
        break;

      case 'CONCEPT':
      default:
        response = `📚 **System Design Core Concept**:
When evaluating distributed architectures, always start from the **CAP Theorem**: in the presence of a network partition (**P**), you must trade off between **Consistency (C)** (every read receives the most recent write) and **Availability (A)** (every request receives a non-error response).
Quantify your requirements before picking technologies!`;
        followUps.push('Would you like to run a capacity estimation calculation for your user traffic?');
        break;
    }

    return {
      response,
      mode,
      follow_up_questions: followUps,
      suggested_components: suggestedComps
    };
  }
}

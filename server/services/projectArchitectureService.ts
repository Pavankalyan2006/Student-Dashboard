import { db } from '../db/database';
import {
  ProjectArchitecture,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureNodeType,
} from '../models/projectTypes';
import { ProjectService } from './projectService';

export class ProjectArchitectureService {
  /**
   * Get project architecture with nodes and edges
   */
  public static async getArchitecture(
    projectId: string,
    studentId: string
  ): Promise<ProjectArchitecture> {
    await ProjectService.getProject(projectId, studentId);
    let arch = await db.getProjectArchitecture(projectId);

    if (!arch) {
      // Auto-initialize standard default architecture for new projects
      arch = await this.initializeDefaultArchitecture(projectId);
    }

    return arch;
  }

  /**
   * Save or update project architecture with strict graph validation
   */
  public static async saveArchitecture(
    projectId: string,
    studentId: string,
    data: {
      architecture_type?: string;
      description?: string;
      data_flow?: string;
      nodes: ArchitectureNode[];
      edges: ArchitectureEdge[];
    }
  ): Promise<ProjectArchitecture> {
    await ProjectService.getProject(projectId, studentId);

    // Validate graph integrity
    const nodeIds = new Set(data.nodes.map((n) => n.id));
    for (const edge of data.edges) {
      if (!nodeIds.has(edge.source_node)) {
        throw new Error(
          `Invalid architecture edge: Source node '${edge.source_node}' does not exist in graph.`
        );
      }
      if (!nodeIds.has(edge.target_node)) {
        throw new Error(
          `Invalid architecture edge: Target node '${edge.target_node}' does not exist in graph.`
        );
      }
    }

    const now = new Date().toISOString();
    const existing = await db.getProjectArchitecture(projectId);

    const architecture: ProjectArchitecture = {
      id: existing?.id || `arch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      architecture_type: data.architecture_type || existing?.architecture_type || 'Layered Architecture',
      description: data.description || existing?.description || 'System architecture overview.',
      data_flow: data.data_flow || existing?.data_flow || '',
      nodes: data.nodes,
      edges: data.edges,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    await db.saveProjectArchitecture(architecture);
    await ProjectService.logActivity(
      projectId,
      studentId,
      'ARCHITECTURE_UPDATED',
      `Updated system architecture with ${data.nodes.length} nodes and ${data.edges.length} edges.`
    );

    return architecture;
  }

  /**
   * Add a single node to the architecture graph
   */
  public static async addNode(
    projectId: string,
    studentId: string,
    node: Omit<ArchitectureNode, 'id' | 'project_id'>
  ): Promise<ArchitectureNode> {
    const arch = await this.getArchitecture(projectId, studentId);
    const newNode: ArchitectureNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      project_id: projectId,
    };

    const updatedNodes = [...arch.nodes, newNode];
    await this.saveArchitecture(projectId, studentId, {
      nodes: updatedNodes,
      edges: arch.edges,
      architecture_type: arch.architecture_type,
      description: arch.description,
      data_flow: arch.data_flow,
    });

    return newNode;
  }

  /**
   * Remove a node and any connected edges
   */
  public static async removeNode(
    projectId: string,
    studentId: string,
    nodeId: string
  ): Promise<boolean> {
    const arch = await this.getArchitecture(projectId, studentId);
    const filteredNodes = arch.nodes.filter((n) => n.id !== nodeId);
    const filteredEdges = arch.edges.filter((e) => e.source_node !== nodeId && e.target_node !== nodeId);

    await this.saveArchitecture(projectId, studentId, {
      nodes: filteredNodes,
      edges: filteredEdges,
      architecture_type: arch.architecture_type,
      description: arch.description,
      data_flow: arch.data_flow,
    });

    return true;
  }

  /**
   * Add an edge connecting two nodes
   */
  public static async addEdge(
    projectId: string,
    studentId: string,
    edge: Omit<ArchitectureEdge, 'id' | 'project_id'>
  ): Promise<ArchitectureEdge> {
    const arch = await this.getArchitecture(projectId, studentId);
    const newEdge: ArchitectureEdge = {
      ...edge,
      id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      project_id: projectId,
    };

    const updatedEdges = [...arch.edges, newEdge];
    await this.saveArchitecture(projectId, studentId, {
      nodes: arch.nodes,
      edges: updatedEdges,
      architecture_type: arch.architecture_type,
      description: arch.description,
      data_flow: arch.data_flow,
    });

    return newEdge;
  }

  /**
   * Auto-initialize clean default architecture scaffold
   */
  public static async initializeDefaultArchitecture(projectId: string): Promise<ProjectArchitecture> {
    const defaultNodes: ArchitectureNode[] = [
      {
        id: `node_user_${projectId}`,
        project_id: projectId,
        name: 'Client / User',
        type: 'USER',
        description: 'End users interacting via browser or mobile application',
        position: { x: 80, y: 150 },
      },
      {
        id: `node_front_${projectId}`,
        project_id: projectId,
        name: 'Frontend Client',
        type: 'FRONTEND',
        description: 'React SPA web application with responsive UI',
        position: { x: 280, y: 150 },
      },
      {
        id: `node_back_${projectId}`,
        project_id: projectId,
        name: 'Backend API Service',
        type: 'BACKEND',
        description: 'Core application server exposing authenticated REST endpoints',
        position: { x: 480, y: 150 },
      },
      {
        id: `node_db_${projectId}`,
        project_id: projectId,
        name: 'Database Layer',
        type: 'DATABASE',
        description: 'Primary relational / persistent document store',
        position: { x: 680, y: 150 },
      },
    ];

    const defaultEdges: ArchitectureEdge[] = [
      {
        id: `edge_1_${projectId}`,
        project_id: projectId,
        source_node: `node_user_${projectId}`,
        target_node: `node_front_${projectId}`,
        label: 'HTTP(S) User Interface',
      },
      {
        id: `edge_2_${projectId}`,
        project_id: projectId,
        source_node: `node_front_${projectId}`,
        target_node: `node_back_${projectId}`,
        label: 'REST API / JSON payload',
      },
      {
        id: `edge_3_${projectId}`,
        project_id: projectId,
        source_node: `node_back_${projectId}`,
        target_node: `node_db_${projectId}`,
        label: 'Query / Connection Pool',
      },
    ];

    const now = new Date().toISOString();
    const arch: ProjectArchitecture = {
      id: `arch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      architecture_type: 'Three-Tier Architecture',
      description: 'Standard 3-tier client-server architecture with decoupled database layer.',
      data_flow: 'User -> Web Client -> API Server -> Database',
      nodes: defaultNodes,
      edges: defaultEdges,
      created_at: now,
      updated_at: now,
    };

    await db.saveProjectArchitecture(arch);
    return arch;
  }
}

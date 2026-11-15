// Architecture Studio (extends the System Design Lab): AI drafts that the student edits.
//  - proposeArchitecture: from a plain-language description, components and connections for the existing
//    Architecture Designer canvas, with the reasoning, trade-offs, bottlenecks and scaling notes.
//  - proposeDiagram: a class, sequence, flowchart or ER diagram in the Studio's text language.
// Every draft is checked before it is returned (known component types and protocols, connections between real
// components, diagrams that parse). Nothing is saved until the student applies and saves it.
import { AppError, ValidationError } from '../core/exceptions';
import { AIService } from '../ai/service';
import { parseModelJson } from '../ai/modelOutput';
import { AgentActivityService } from './agentActivityService';
import { DIAGRAM_KINDS, DIAGRAM_LIMITS, DIAGRAM_TEMPLATES, layoutGraph, renderDiagram, type DiagramKind } from './diagramDsl';
import type { ArchitectureComponent, ArchitectureConnection, ComponentCategory, ComponentType, ConnectionProtocol } from '../models/systemDesignTypes';

export const CATEGORY_OF: Record<ComponentType, ComponentCategory> = {
  WEB_CLIENT: 'APPLICATION', MOBILE_CLIENT: 'APPLICATION', WEB_SERVER: 'APPLICATION', APP_SERVER: 'APPLICATION', BACKEND_SERVICE: 'APPLICATION',
  API_GATEWAY: 'APPLICATION', REVERSE_PROXY: 'APPLICATION', LOAD_BALANCER: 'APPLICATION', AUTH_SERVICE: 'APPLICATION',
  SQL_DATABASE: 'STORAGE', NOSQL_DATABASE: 'STORAGE', CACHE: 'STORAGE', OBJECT_STORAGE: 'STORAGE', SEARCH_INDEX: 'STORAGE', DATA_WAREHOUSE: 'STORAGE', VECTOR_DATABASE: 'STORAGE',
  MESSAGE_QUEUE: 'COMMUNICATION', EVENT_BUS: 'COMMUNICATION', STREAMING_PLATFORM: 'COMMUNICATION', WEBSOCKET_SERVICE: 'COMMUNICATION', NOTIFICATION_SERVICE: 'COMMUNICATION', BACKGROUND_WORKER: 'COMMUNICATION',
  CDN: 'INFRASTRUCTURE', DNS: 'INFRASTRUCTURE', CONTAINER: 'INFRASTRUCTURE', CONTAINER_ORCHESTRATION: 'INFRASTRUCTURE', MONITORING_SERVICE: 'INFRASTRUCTURE', LOGGING_SERVICE: 'INFRASTRUCTURE',
  SECRETS_MANAGER: 'INFRASTRUCTURE', FIREWALL: 'INFRASTRUCTURE', RATE_LIMITER: 'INFRASTRUCTURE',
  PRIMARY_DB: 'DISTRIBUTED', READ_REPLICA: 'DISTRIBUTED', SHARD: 'DISTRIBUTED', LEADER: 'DISTRIBUTED', FOLLOWER: 'DISTRIBUTED', REGIONAL_DEPLOYMENT: 'DISTRIBUTED', FAILOVER_COMPONENT: 'DISTRIBUTED', EXTERNAL_API: 'DISTRIBUTED',
};
export const PROTOCOLS: ConnectionProtocol[] = ['HTTP/REST', 'HTTPS', 'gRPC', 'WebSocket', 'TCP', 'UDP', 'Kafka', 'AMQP', 'SQL', 'Redis/RESP', 'GraphQL', 'Replication_Log', 'Event'];
const MAX_COMPONENTS = 30;

const s = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const list = (v: unknown, n = 8) => (Array.isArray(v) ? v.map((x) => s(x, 300)).filter(Boolean).slice(0, n) : []);

function checkDescription(text: unknown): string {
  const d = s(text, 3000);
  if (d.length < 20) throw new ValidationError('Describe the application in a sentence or two (at least 20 characters).');
  return d;
}
function checkAgent(studentId: string) {
  if (AgentActivityService.prefs(studentId).disabled.includes('coding'))
    throw new AppError('The Coding agent is switched off in the AI Agent Control Center, so AI drafts are off. You can still design by hand.', 409, 'AGENT_DISABLED');
}

/** Validates an AI architecture draft into canvas components and connections. Exported for tests. */
export function sanitiseArchitecture(raw: any): { components: ArchitectureComponent[]; connections: ArchitectureConnection[]; dropped: number } {
  const components: ArchitectureComponent[] = [];
  const idByName = new Map<string, string>();
  let dropped = 0;
  for (const c of (Array.isArray(raw?.components) ? raw.components : []).slice(0, MAX_COMPONENTS * 2)) {
    const name = s(c?.name, 60);
    const type = String(c?.type || '').toUpperCase() as ComponentType;
    if (!name || !CATEGORY_OF[type] || idByName.has(name.toLowerCase()) || components.length >= MAX_COMPONENTS) {
      dropped++;
      continue;
    }
    const id = `ai_${components.length + 1}`;
    idByName.set(name.toLowerCase(), id);
    components.push({ id, name, type, category: CATEGORY_OF[type], tech_choice: s(c?.tech_choice, 60) || undefined, description: s(c?.description, 300), position: { x: 0, y: 0 } });
  }
  const connections: ArchitectureConnection[] = [];
  const seen = new Set<string>();
  for (const k of (Array.isArray(raw?.connections) ? raw.connections : []).slice(0, 120)) {
    const from = idByName.get(s(k?.from, 60).toLowerCase());
    const to = idByName.get(s(k?.to, 60).toLowerCase());
    if (!from || !to || from === to || seen.has(`${from}>${to}`)) {
      dropped++;
      continue;
    }
    seen.add(`${from}>${to}`);
    const protocol = PROTOCOLS.find((p) => p.toLowerCase() === String(k?.protocol || '').toLowerCase()) || 'HTTPS';
    connections.push({ id: `ai_c${connections.length + 1}`, from, to, protocol, label: s(k?.label, 60) || undefined, is_async: !!k?.is_async, direction: 'UNIDIRECTIONAL' });
  }
  const pos = layoutGraph(components.map((c) => ({ id: c.id, w: 170, h: 70 })), connections);
  for (const c of components) c.position = pos.get(c.id) || { x: 0, y: 0 };
  return { components, connections, dropped };
}

export class ArchitectureStudioService {
  static async proposeArchitecture(studentId: string, body: any) {
    const description = checkDescription(body?.description);
    checkAgent(studentId);
    const prompt = `A student wants an initial software architecture for this application:
"""${description}"""

Propose a sensible first design for a student project, not an enterprise system. Use only these component types:
${Object.keys(CATEGORY_OF).join(', ')}
and only these protocols: ${PROTOCOLS.join(', ')}.

Reply with JSON only:
{
  "components": [ { "name": "unique short name", "type": "ONE_OF_THE_TYPES", "tech_choice": "e.g. PostgreSQL", "description": "its job in one sentence" } ],
  "connections": [ { "from": "component name", "to": "component name", "protocol": "ONE_OF_THE_PROTOCOLS", "label": "what flows", "is_async": false } ],
  "rationale": "why this shape, in 3 to 5 sentences",
  "tradeoffs": ["choice made and what it costs"],
  "bottlenecks": ["where it will hurt first under load, and why"],
  "scaling": ["the next change to make when traffic grows"],
  "assumptions": ["anything you assumed about users, data or traffic"]
}
At most ${MAX_COMPONENTS} components. Do not invent traffic numbers; state assumptions instead.`;
    const result = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.3);
    const out = parseModelJson<any>(result, 'Architecture proposal');
    const { components, connections, dropped } = sanitiseArchitecture(out);
    if (components.length < 2) throw new AppError('The AI draft had no usable components, so nothing is shown. Try describing the application in more detail.', 502, 'AI_BAD_OUTPUT');
    return {
      components,
      connections,
      dropped,
      rationale: s(out?.rationale, 1500),
      tradeoffs: list(out?.tradeoffs),
      bottlenecks: list(out?.bottlenecks),
      scaling: list(out?.scaling),
      assumptions: list(out?.assumptions),
      note: 'This is an AI draft to start from. Check each choice against your own requirements before you use it.',
    };
  }

  static async proposeDiagram(studentId: string, body: any) {
    const kind = String(body?.kind || '') as DiagramKind;
    if (!DIAGRAM_KINDS.includes(kind)) throw new ValidationError('Pick a diagram type: class, sequence, flowchart or er.');
    const description = checkDescription(body?.description);
    checkAgent(studentId);
    const prompt = `Write a ${kind === 'er' ? 'entity relationship' : kind} diagram for this, in the exact text language shown by the example.
Description: """${description}"""

Example of the language (follow its syntax exactly; nothing else is understood):
${DIAGRAM_TEMPLATES[kind]}

Reply with JSON only: { "source": "the diagram text, lines separated by \\n", "explanation": "two or three sentences on the main design decisions" }`;
    const result = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.2);
    const out = parseModelJson<any>(result, 'Diagram draft');
    const source = s(out?.source, DIAGRAM_LIMITS.maxSource);
    const rendered = renderDiagram(kind, source);
    if (!rendered.nodes) throw new AppError('The AI draft could not be drawn, so nothing is shown. Try again or start from the template.', 502, 'AI_BAD_OUTPUT');
    return { kind, source, explanation: s(out?.explanation, 800), errors: rendered.errors };
  }
}

export function validateDiagrams(raw: unknown) {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) throw new ValidationError('diagrams must be a list.');
  if (raw.length > DIAGRAM_LIMITS.maxDiagrams) throw new ValidationError(`A design can hold up to ${DIAGRAM_LIMITS.maxDiagrams} diagrams.`);
  return raw.map((d: any, i: number) => {
    const kind = String(d?.kind) as DiagramKind;
    if (!DIAGRAM_KINDS.includes(kind)) throw new ValidationError(`Diagram ${i + 1} has an unknown type.`);
    const source = String(d?.source ?? '');
    if (source.length > DIAGRAM_LIMITS.maxSource) throw new ValidationError(`Diagram ${i + 1} is longer than ${DIAGRAM_LIMITS.maxSource.toLocaleString('en-US')} characters.`);
    return {
      id: s(d?.id, 40) || `dg${Date.now().toString(36)}${i}`,
      kind,
      title: s(d?.title, 120) || `${kind} diagram`,
      source,
      updated_at: s(d?.updated_at, 40) || new Date().toISOString(),
    };
  });
}

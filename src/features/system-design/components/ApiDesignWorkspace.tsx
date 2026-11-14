// src/features/system-design/components/ApiDesignWorkspace.tsx
// Structured REST API Modeler with Live OpenAPI 3.0 Generation

import * as React from 'react';
import {
  Code,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import { ApiSpecification, ApiEndpoint, HttpMethod } from '../types/systemDesign';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

interface ApiDesignWorkspaceProps {
  apiSpecification?: ApiSpecification;
  onChangeApiSpecification: (spec: ApiSpecification) => void;
  readOnly?: boolean;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function ApiDesignWorkspace({
  apiSpecification,
  onChangeApiSpecification,
  readOnly = false
}: ApiDesignWorkspaceProps) {
  const [selectedEndpointId, setSelectedEndpointId] = React.useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = React.useState<'json' | 'yaml'>('json');
  const [openApiOutput, setOpenApiOutput] = React.useState<{ openapi_json: string; openapi_yaml: string }>({
    openapi_json: '{}',
    openapi_yaml: ''
  });
  const [copied, setCopied] = React.useState(false);

  // Initialize with starter endpoints
  const currentSpec: ApiSpecification = React.useMemo(() => {
    if (apiSpecification && apiSpecification.endpoints && apiSpecification.endpoints.length > 0) {
      return apiSpecification;
    }
    return {
      title: 'Distributed System REST API',
      version: '1.0.0',
      base_url: 'https://api.systemdesign.local/v1',
      endpoints: [
        {
          id: 'ep_1',
          method: 'POST',
          path: '/urls',
          description: 'Shorten a new long URL into a unique Base62 key',
          auth_required: false,
          rate_limit: '100 req/min',
          idempotent: true,
          parameters: [],
          request_body_schema: JSON.stringify({ long_url: 'https://example.com/very/long/path', custom_alias: 'my-link' }, null, 2),
          response_schemas: [
            {
              status_code: 201,
              description: 'Created short URL mapping',
              schema_json: JSON.stringify({ short_key: 'x7K9p2', short_url: 'https://sho.rt/x7K9p2', expires_at: '2028-01-01T00:00:00Z' }, null, 2)
            },
            {
              status_code: 409,
              description: 'Custom alias already in use',
              schema_json: JSON.stringify({ error: 'Alias already exists' }, null, 2)
            }
          ]
        },
        {
          id: 'ep_2',
          method: 'GET',
          path: '/urls/{short_key}',
          description: 'Resolve short URL and redirect to original destination',
          auth_required: false,
          rate_limit: '1000 req/min',
          parameters: [
            { name: 'short_key', in: 'path', required: true, data_type: 'string', description: '7-character Base62 key' }
          ],
          response_schemas: [
            {
              status_code: 301,
              description: 'Permanent redirect to target long URL',
              schema_json: JSON.stringify({ destination: 'https://example.com/very/long/path' }, null, 2)
            },
            {
              status_code: 404,
              description: 'Short key not found or expired',
              schema_json: JSON.stringify({ error: 'Not found' }, null, 2)
            }
          ]
        }
      ]
    };
  }, [apiSpecification]);

  // Sync selection
  React.useEffect(() => {
    if (!selectedEndpointId && currentSpec.endpoints.length > 0) {
      setSelectedEndpointId(currentSpec.endpoints[0].id);
    }
  }, [selectedEndpointId, currentSpec]);

  // Generate OpenAPI
  React.useEffect(() => {
    const fetchOpenApi = async () => {
      try {
        const res = await systemDesignApi.generateOpenApi(currentSpec);
        setOpenApiOutput({
          openapi_json: res.openapi_json,
          openapi_yaml: res.openapi_yaml
        });
      } catch (err: any) {
        setOpenApiOutput({
          openapi_json: `// Error: ${err.message}`,
          openapi_yaml: `# Error: ${err.message}`
        });
      }
    };
    fetchOpenApi();
  }, [currentSpec]);

  // Add Endpoint
  const handleAddEndpoint = () => {
    if (readOnly) return;
    const newId = `ep_${Date.now()}`;
    const newEp: ApiEndpoint = {
      id: newId,
      method: 'GET',
      path: `/resource_${currentSpec.endpoints.length + 1}`,
      description: 'Fetch resource collection',
      auth_required: true,
      parameters: [],
      response_schemas: [{ status_code: 200, description: 'Success', schema_json: '{"items": []}' }]
    };
    const nextSpec = {
      ...currentSpec,
      endpoints: [...currentSpec.endpoints, newEp]
    };
    onChangeApiSpecification(nextSpec);
    setSelectedEndpointId(newId);
    toast.success('Added new API endpoint');
  };

  const handleCopySpec = () => {
    const text = activeOutputTab === 'json' ? openApiOutput.openapi_json : openApiOutput.openapi_yaml;
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied OpenAPI specification');
  };

  const handleDownloadSpec = () => {
    const text = activeOutputTab === 'json' ? openApiOutput.openapi_json : openApiOutput.openapi_yaml;
    const ext = activeOutputTab === 'json' ? 'json' : 'yaml';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openapi_specification_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded OpenAPI file');
  };

  const selectedEndpoint = currentSpec.endpoints.find(e => e.id === selectedEndpointId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ------------------------------------------------------------- */}
      {/* LEFT: ENDPOINTS LIST & BUILDER */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-6 space-y-4">
        {/* Endpoints List Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                API Endpoints ({currentSpec.endpoints.length})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Base: {currentSpec.base_url}</p>
            </div>
            {!readOnly && (
              <Button onClick={handleAddEndpoint} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7 px-2.5">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Endpoint
              </Button>
            )}
          </div>

          <div className="space-y-1.5 mt-3">
            {currentSpec.endpoints.map(ep => {
              const isSelected = selectedEndpointId === ep.id;
              const methodColor =
                ep.method === 'GET'
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                  : ep.method === 'POST'
                  ? 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
                  : ep.method === 'PUT' || ep.method === 'PATCH'
                  ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                  : 'text-red-400 bg-red-950/60 border-red-800';

              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpointId(ep.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${methodColor}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-semibold truncate">{ep.path}</span>
                  </div>
                  {ep.auth_required && (
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                      Auth
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Endpoint Editor */}
        {selectedEndpoint && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={selectedEndpoint.method}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = currentSpec.endpoints.map(ep =>
                      ep.id === selectedEndpoint.id ? { ...ep, method: e.target.value as HttpMethod } : ep
                    );
                    onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                  }}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono font-bold text-indigo-400"
                >
                  {HTTP_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={selectedEndpoint.path}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = currentSpec.endpoints.map(ep =>
                      ep.id === selectedEndpoint.id ? { ...ep, path: e.target.value } : ep
                    );
                    onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                  }}
                  className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200"
                />
              </div>

              {!readOnly && currentSpec.endpoints.length > 1 && (
                <button
                  onClick={() => {
                    const updated = currentSpec.endpoints.filter(ep => ep.id !== selectedEndpoint.id);
                    onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                    setSelectedEndpointId(updated[0]?.id || null);
                  }}
                  className="text-red-400 hover:text-red-300 p-1 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={selectedEndpoint.description}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = currentSpec.endpoints.map(ep =>
                      ep.id === selectedEndpoint.id ? { ...ep, description: e.target.value } : ep
                    );
                    onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedEndpoint.auth_required}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updated = currentSpec.endpoints.map(ep =>
                        ep.id === selectedEndpoint.id ? { ...ep, auth_required: e.target.checked } : ep
                      );
                      onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                    }}
                    className="rounded text-indigo-600 bg-slate-950 border-slate-700"
                  />
                  <span>Bearer JWT Required</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedEndpoint.idempotent || false}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updated = currentSpec.endpoints.map(ep =>
                        ep.id === selectedEndpoint.id ? { ...ep, idempotent: e.target.checked } : ep
                      );
                      onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                    }}
                    className="rounded text-indigo-600 bg-slate-950 border-slate-700"
                  />
                  <span>Idempotency Key Header</span>
                </label>
              </div>

              {/* Request Body JSON */}
              {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                <div>
                  <label className="block text-slate-400 mb-1">Request Body Schema (JSON)</label>
                  <textarea
                    rows={4}
                    value={selectedEndpoint.request_body_schema || ''}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updated = currentSpec.endpoints.map(ep =>
                        ep.id === selectedEndpoint.id ? { ...ep, request_body_schema: e.target.value } : ep
                      );
                      onChangeApiSpecification({ ...currentSpec, endpoints: updated });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT: LIVE OPENAPI 3.0 SPECIFICATION */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">OpenAPI 3.0.3 Document</span>
              <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5 text-xs">
                <button
                  onClick={() => setActiveOutputTab('json')}
                  className={`px-2.5 py-0.5 rounded font-mono ${activeOutputTab === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setActiveOutputTab('yaml')}
                  className={`px-2.5 py-0.5 rounded font-mono ${activeOutputTab === 'yaml' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  YAML
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopySpec}
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-300 text-xs h-7 px-2.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                onClick={handleDownloadSpec}
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-300 text-xs h-7 px-2.5"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Export
              </Button>
            </div>
          </div>

          <div className="mt-3.5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-[520px] leading-relaxed">
            <pre>{activeOutputTab === 'json' ? openApiOutput.openapi_json : openApiOutput.openapi_yaml}</pre>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            Compliant with OpenAPI 3.0.3 specification. Can be imported into Swagger UI, Postman, or API Gateway routers.
          </span>
        </div>
      </div>
    </div>
  );
}

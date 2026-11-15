// src/features/system-design/components/DatabaseDesignWorkspace.tsx
// Visual Relational / Distributed Schema Modeler with Multi-Dialect SQL DDL Generation

import * as React from 'react';
import {
  Database,
  Plus,
  Trash2,
  Copy,
  Code,
  Table,
  Key,
  Layers,
  Sparkles,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import {
  DatabaseDesign,
  DatabaseEntity,
  DatabaseAttribute,
  DatabaseRelationship,
  SqlDialect
} from '../types/systemDesign';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

interface DatabaseDesignWorkspaceProps {
  databaseDesign?: DatabaseDesign;
  onChangeDatabaseDesign: (design: DatabaseDesign) => void;
  onNavigateToSqlLab?: (initialSql: string) => void;
  readOnly?: boolean;
}

export function DatabaseDesignWorkspace({
  databaseDesign,
  onChangeDatabaseDesign,
  onNavigateToSqlLab,
  readOnly = false
}: DatabaseDesignWorkspaceProps) {
  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null);
  const [activeDialect, setActiveDialect] = React.useState<SqlDialect>('POSTGRESQL');
  const [generatedSql, setGeneratedSql] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

  // Initialize with sensible starter entities if none exist
  const currentDesign: DatabaseDesign = React.useMemo(() => {
    // An example is shown only until the student saves their own (an empty saved design stays empty).
    if (databaseDesign) {
      return databaseDesign;
    }
    return {
      entities: [
        {
          id: 'ent_users',
          name: 'users',
          description: 'Registered user account credentials and tenant profile',
          table_type: 'RELATIONAL',
          attributes: [
            { name: 'id', data_type: 'UUID', is_primary_key: true, is_nullable: false, index_type: 'BTREE' },
            { name: 'email', data_type: 'VARCHAR(255)', is_primary_key: false, is_nullable: false, is_unique: true, index_type: 'BTREE' },
            { name: 'password_hash', data_type: 'VARCHAR(255)', is_primary_key: false, is_nullable: false },
            { name: 'created_at', data_type: 'TIMESTAMPTZ', is_primary_key: false, is_nullable: false, default_value: 'NOW()' }
          ]
        },
        {
          id: 'ent_records',
          name: 'resource_mappings',
          description: 'Core entity records mapped to owner user ID',
          table_type: 'RELATIONAL',
          attributes: [
            { name: 'id', data_type: 'UUID', is_primary_key: true, is_nullable: false },
            { name: 'users_id', data_type: 'UUID', is_primary_key: false, is_nullable: false, index_type: 'BTREE' },
            { name: 'resource_key', data_type: 'VARCHAR(64)', is_primary_key: false, is_nullable: false, is_unique: true, index_type: 'HASH' },
            { name: 'target_destination', data_type: 'TEXT', is_primary_key: false, is_nullable: false },
            { name: 'click_count', data_type: 'BIGINT', is_primary_key: false, is_nullable: false, default_value: '0' },
            { name: 'created_at', data_type: 'TIMESTAMPTZ', is_primary_key: false, is_nullable: false, default_value: 'NOW()' }
          ]
        }
      ],
      relationships: [
        {
          id: 'rel_user_records',
          source_entity: 'ent_records',
          target_entity: 'ent_users',
          type: 'ONE_TO_MANY',
          on_delete: 'CASCADE'
        }
      ],
      tradeoffs_notes: 'B-Tree indexing on email enables sub-millisecond logins. Hash index on resource_key gives O(1) point lookups.'
    };
  }, [databaseDesign]);

  // Sync selected entity
  React.useEffect(() => {
    if (!selectedEntityId && currentDesign.entities.length > 0) {
      setSelectedEntityId(currentDesign.entities[0].id);
    }
  }, [selectedEntityId, currentDesign]);

  // Trigger SQL generation whenever schema or dialect changes
  React.useEffect(() => {
    const fetchSql = async () => {
      try {
        const res = await systemDesignApi.generateSql(currentDesign, activeDialect);
        setGeneratedSql(res.sql);
      } catch (err: any) {
        setGeneratedSql(`-- Error generating SQL: ${err.message}`);
      }
    };
    fetchSql();
  }, [currentDesign, activeDialect]);

  // Add Entity
  const handleAddEntity = () => {
    if (readOnly) return;
    const newId = `ent_${Date.now()}`;
    const newEnt: DatabaseEntity = {
      id: newId,
      name: `table_${currentDesign.entities.length + 1}`,
      description: 'New relational table',
      table_type: 'RELATIONAL',
      attributes: [
        { name: 'id', data_type: 'BIGSERIAL', is_primary_key: true, is_nullable: false },
        { name: 'created_at', data_type: 'TIMESTAMPTZ', is_primary_key: false, is_nullable: false, default_value: 'NOW()' }
      ]
    };
    const nextDesign = {
      ...currentDesign,
      entities: [...currentDesign.entities, newEnt]
    };
    onChangeDatabaseDesign(nextDesign);
    setSelectedEntityId(newId);
    toast.success('Added new database entity');
  };

  // Add Attribute to Selected Entity
  const handleAddAttribute = () => {
    if (readOnly || !selectedEntityId) return;
    const updatedEntities = currentDesign.entities.map(e => {
      if (e.id === selectedEntityId) {
        const newAttr: DatabaseAttribute = {
          name: `col_${e.attributes.length + 1}`,
          data_type: 'VARCHAR(255)',
          is_primary_key: false,
          is_nullable: true,
          index_type: 'NONE'
        };
        return { ...e, attributes: [...e.attributes, newAttr] };
      }
      return e;
    });
    onChangeDatabaseDesign({ ...currentDesign, entities: updatedEntities });
  };

  // Copy SQL
  const handleCopySql = () => {
    copyText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`Copied ${activeDialect} SQL DDL to clipboard`);
  };

  const selectedEntity = currentDesign.entities.find(e => e.id === selectedEntityId);

  const isExample = !databaseDesign;

  return (
    <div className="space-y-4">
      {isExample && !readOnly && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200" data-testid="database-example">
          <span>This is an example (a URL shortener) to show how the workspace works. It is not your design until you change it.</span>
          <button type="button" onClick={() => onChangeDatabaseDesign({ entities: [], relationships: [] })} className="rounded-lg border border-amber-400/50 px-2.5 py-1 font-semibold text-amber-100 hover:bg-amber-500/20">Start empty</button>
        </div>
      )}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ------------------------------------------------------------- */}
      {/* LEFT: ENTITY LIST & ATTRIBUTE EDITOR */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-6 space-y-4">
        {/* Table Selector Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-400" />
              Database Entities ({currentDesign.entities.length})
            </h3>
            {!readOnly && (
              <Button onClick={handleAddEntity} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7 px-2.5">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Entity
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {currentDesign.entities.map(ent => (
              <button
                key={ent.id}
                onClick={() => setSelectedEntityId(ent.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEntityId === ent.id
                    ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold font-mono truncate">{ent.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{ent.attributes.length} columns</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Entity Column Editor */}
        {selectedEntity && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <input
                  type="text"
                  value={selectedEntity.name}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = currentDesign.entities.map(ent =>
                      ent.id === selectedEntity.id ? { ...ent, name: e.target.value } : ent
                    );
                    onChangeDatabaseDesign({ ...currentDesign, entities: updated });
                  }}
                  className="bg-transparent font-mono font-bold text-sm text-indigo-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={selectedEntity.description || ''}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = currentDesign.entities.map(ent =>
                      ent.id === selectedEntity.id ? { ...ent, description: e.target.value } : ent
                    );
                    onChangeDatabaseDesign({ ...currentDesign, entities: updated });
                  }}
                  placeholder="Entity description..."
                  className="bg-transparent text-[11px] text-slate-400 block w-full focus:outline-none mt-0.5"
                />
              </div>

              {!readOnly && currentDesign.entities.length > 1 && (
                <button
                  onClick={() => {
                    const updated = currentDesign.entities.filter(e => e.id !== selectedEntity.id);
                    onChangeDatabaseDesign({ ...currentDesign, entities: updated });
                    setSelectedEntityId(updated[0]?.id || null);
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Column Attributes Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2">
                <span className="col-span-4">Column</span>
                <span className="col-span-3">Type</span>
                <span className="col-span-2 text-center">PK</span>
                <span className="col-span-2 text-center">Index</span>
                <span className="col-span-1"></span>
              </div>

              {selectedEntity.attributes.map((attr, aIdx) => (
                <div key={aIdx} className="grid grid-cols-12 items-center gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                  <input
                    type="text"
                    value={attr.name}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updatedAttr = { ...attr, name: e.target.value };
                      const updatedAttrs = [...selectedEntity.attributes];
                      updatedAttrs[aIdx] = updatedAttr;
                      const updatedEnts = currentDesign.entities.map(ent =>
                        ent.id === selectedEntity.id ? { ...ent, attributes: updatedAttrs } : ent
                      );
                      onChangeDatabaseDesign({ ...currentDesign, entities: updatedEnts });
                    }}
                    className="col-span-4 bg-transparent font-mono text-slate-200 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={attr.data_type}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updatedAttr = { ...attr, data_type: e.target.value };
                      const updatedAttrs = [...selectedEntity.attributes];
                      updatedAttrs[aIdx] = updatedAttr;
                      const updatedEnts = currentDesign.entities.map(ent =>
                        ent.id === selectedEntity.id ? { ...ent, attributes: updatedAttrs } : ent
                      );
                      onChangeDatabaseDesign({ ...currentDesign, entities: updatedEnts });
                    }}
                    className="col-span-3 bg-transparent font-mono text-slate-400 text-xs focus:outline-none"
                  />
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="checkbox"
                      checked={attr.is_primary_key}
                      disabled={readOnly}
                      onChange={(e) => {
                        const updatedAttr = { ...attr, is_primary_key: e.target.checked };
                        const updatedAttrs = [...selectedEntity.attributes];
                        updatedAttrs[aIdx] = updatedAttr;
                        const updatedEnts = currentDesign.entities.map(ent =>
                          ent.id === selectedEntity.id ? { ...ent, attributes: updatedAttrs } : ent
                        );
                        onChangeDatabaseDesign({ ...currentDesign, entities: updatedEnts });
                      }}
                      className="rounded text-indigo-600 bg-slate-900 border-slate-700"
                    />
                  </div>
                  <select
                    value={attr.index_type || 'NONE'}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updatedAttr = { ...attr, index_type: e.target.value as any };
                      const updatedAttrs = [...selectedEntity.attributes];
                      updatedAttrs[aIdx] = updatedAttr;
                      const updatedEnts = currentDesign.entities.map(ent =>
                        ent.id === selectedEntity.id ? { ...ent, attributes: updatedAttrs } : ent
                      );
                      onChangeDatabaseDesign({ ...currentDesign, entities: updatedEnts });
                    }}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 py-0.5"
                  >
                    <option value="NONE">None</option>
                    <option value="BTREE">B-Tree</option>
                    <option value="HASH">Hash</option>
                    <option value="GIN">GIN</option>
                  </select>
                  <div className="col-span-1 flex justify-end">
                    {!readOnly && selectedEntity.attributes.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedAttrs = selectedEntity.attributes.filter((_, i) => i !== aIdx);
                          const updatedEnts = currentDesign.entities.map(ent =>
                            ent.id === selectedEntity.id ? { ...ent, attributes: updatedAttrs } : ent
                          );
                          onChangeDatabaseDesign({ ...currentDesign, entities: updatedEnts });
                        }}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!readOnly && (
              <Button onClick={handleAddAttribute} size="sm" variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Column
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT: LIVE SQL DDL CODE PREVIEW & EXPORT */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          {/* Dialect Selector Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['POSTGRESQL', 'MYSQL', 'COCKROACHDB'] as SqlDialect[]).map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDialect(d)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    activeDialect === d
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopySql}
                size="sm"
                variant="outline"
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-7 px-2.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              {onNavigateToSqlLab && (
                <Button
                  onClick={() => onNavigateToSqlLab(generatedSql)}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  SQL Lab
                </Button>
              )}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="mt-3.5 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-[520px] leading-relaxed">
            <pre>{generatedSql}</pre>
          </div>
        </div>

        {/* Database Design Tradeoff Note */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            DDL output is safe and isolated. Generated statements include primary keys, foreign constraints, and indexing strategies.
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}

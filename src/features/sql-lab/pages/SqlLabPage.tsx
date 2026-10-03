// src/features/sql-lab/pages/SqlLabPage.tsx
// Complete Sandboxed SQL & Database Laboratory with Interactive Query Editor, Schema Browser, and Challenges

import * as React from 'react';
import {
  Database,
  Play,
  Sparkles,
  Table,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  RotateCcw,
  Zap,
  Terminal,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { SQLTableDefinition, SQLChallenge, SQLExecutionResult } from '../../../types/learningModules';
import { toast } from 'sonner';

interface SqlLabPageProps {
  onNavigate?: (path: string) => void;
}

export function SqlLabPage({ onNavigate }: SqlLabPageProps) {
  const [schemas, setSchemas] = React.useState<Record<string, SQLTableDefinition[]>>({});
  const [challenges, setChallenges] = React.useState<SQLChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = React.useState<SQLChallenge | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Editor State
  const [query, setQuery] = React.useState(
    'SELECT branch, COUNT(student_id) AS total_students, ROUND(AVG(cgpa), 2) AS avg_cgpa\nFROM students\nGROUP BY branch\nORDER BY avg_cgpa DESC;'
  );
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<SQLExecutionResult | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = React.useState<'editor' | 'schema' | 'challenges'>('editor');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedSchemas, fetchedChallenges] = await Promise.all([
        learningModulesApi.sqlLab.getSchemas(),
        learningModulesApi.sqlLab.getChallenges(),
      ]);
      setSchemas(fetchedSchemas);
      setChallenges(fetchedChallenges);
      if (fetchedChallenges.length > 0) {
        setSelectedChallenge(fetchedChallenges[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load SQL schemas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }
    try {
      setIsExecuting(true);
      const result = await learningModulesApi.sqlLab.executeSql(query);
      setExecutionResult(result);
      if (result.success) {
        toast.success(`Query executed in ${result.execution_time_ms}ms (${result.row_count} rows returned)`);
      } else {
        toast.error('SQL Execution Error: ' + result.error);
      }
    } catch (err: any) {
      toast.error('Sandbox execution failure: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApplyChallenge = (ch: SQLChallenge) => {
    setSelectedChallenge(ch);
    setQuery(ch.starter_query);
    setActiveTab('editor');
    toast.info(`Loaded challenge: ${ch.title}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="SQL / Database Lab" description="Loading isolated relational sandbox..." />
        <LoadingState message="SQLDatabaseAgent initializing safe relational tables..." />
      </PageContainer>
    );
  }

  const currentSchemaTables = schemas['university_db'] || [];

  return (
    <PageContainer>
      <PageHeader
        title="SQL / Database Lab"
        description="Interactive relational SQL workspace with isolated in-memory sandbox, schema visualizer, query execution plan, and challenges."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Sandboxed Environment
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('editor')}
              className={activeTab === 'editor' ? 'bg-[#2563EB] text-white' : ''}
            >
              SQL Editor
            </Button>
            <Button
              variant={activeTab === 'schema' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('schema')}
              className={activeTab === 'schema' ? 'bg-[#2563EB] text-white' : ''}
            >
              Schema Viewer
            </Button>
            <Button
              variant={activeTab === 'challenges' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('challenges')}
              className={activeTab === 'challenges' ? 'bg-[#2563EB] text-white' : ''}
            >
              Challenges ({challenges.length})
            </Button>
          </div>
        }
      />

      {/* Editor & Execution Output View */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Challenge Banner if active */}
          {selectedChallenge && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {selectedChallenge.category}
                  </span>
                  <span className="text-xs font-bold text-[#101828]">{selectedChallenge.title}</span>
                </div>
                <p className="text-xs text-[#344054]">{selectedChallenge.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-white"
                  onClick={() => toast.info('Hint: ' + (selectedChallenge.hints[0] || 'Use appropriate aggregations'))}
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1" />
                  View Hint
                </Button>
              </div>
            </div>
          )}

          {/* SQL Editor Area */}
          <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-[#101828]">SQL Query Console (university_db)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setQuery('SELECT * FROM students JOIN enrollments ON students.student_id = enrollments.student_id;')
                  }
                  className="text-xs"
                >
                  Load Join Query
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunQuery}
                  disabled={isExecuting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isExecuting ? 'Executing in Sandbox...' : 'Run Query (Ctrl+Enter)'}
                </Button>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-36 p-3 text-xs font-mono bg-gray-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Execution Result Table */}
          {executionResult && (
            <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#101828]">Execution Results</h3>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {executionResult.row_count} rows in {executionResult.execution_time_ms}ms
                  </span>
                </div>
              </div>

              {executionResult.success ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-[#344054] font-bold">
                      <tr>
                        {executionResult.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-2.5">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {executionResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50/70">
                          {executionResult.columns.map((col, cIdx) => (
                            <td key={cIdx} className="px-4 py-2 font-mono text-[#101828]">
                              {row[col] !== undefined ? String(row[col]) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    SQL Syntax or Runtime Exception
                  </p>
                  <p className="font-mono">{executionResult.error}</p>
                </div>
              )}

              {/* AI Explanation & Optimization Tips */}
              {executionResult.explanation && (
                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Query Execution Explanation
                  </span>
                  <p className="text-xs text-blue-950">{executionResult.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Schema Viewer Tab */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentSchemaTables.map((tbl) => (
              <div key={tbl.name} className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Table className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-[#101828] font-mono">{tbl.name}</h3>
                </div>

                <div className="space-y-1.5">
                  {tbl.columns.map((col, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                      <span className="font-mono font-medium text-[#101828] flex items-center gap-1">
                        {col.is_primary_key && <span className="text-[10px] text-amber-600 font-bold">PK</span>}
                        {col.is_foreign_key && <span className="text-[10px] text-blue-600 font-bold">FK</span>}
                        {col.name}
                      </span>
                      <span className="text-[#475467] font-mono text-[11px]">{col.type}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-gray-400">Sample preview: {tbl.sample_rows.length} rows loaded</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-3">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between hover:border-blue-400 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {ch.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ch.difficulty === 'EASY'
                        ? 'bg-emerald-50 text-emerald-700'
                        : ch.difficulty === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {ch.difficulty}
                  </span>
                  <h4 className="text-sm font-bold text-[#101828]">{ch.title}</h4>
                </div>
                <p className="text-xs text-[#475467]">{ch.description}</p>
              </div>

              <Button size="sm" onClick={() => handleApplyChallenge(ch)} className="bg-[#2563EB] text-white text-xs">
                Solve Challenge
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

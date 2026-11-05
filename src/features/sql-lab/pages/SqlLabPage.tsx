// src/features/sql-lab/pages/SqlLabPage.tsx
// Complete Sandboxed SQL & Database Laboratory with:
// 1. Manual Visual Schema & Table Builder (Columns, Data Types, Constraints, Foreign Keys)
// 2. Real-Time Generated SQL Preview & Compilation
// 3. Table Data Viewer & Manager (Insert Row, Edit Row, Delete Row, Pagination, Filter, Sample Data Generator)
// 4. Direct SQL Editor with Syntax Formatting, Execution Plan, and Query History
// 5. Schema Explorer with expandable tree & constraint badges

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
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Key,
  Link,
  Search,
  RefreshCw,
  FolderPlus,
  ArrowUpDown,
  History,
  FileCode,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import {
  SQLTableDefinition,
  SQLTableColumn,
  SQLChallenge,
  SQLExecutionResult,
  SQLQueryHistoryItem,
  TableDataResponse,
  SQLDataType,
} from '../../../types/learningModules';
import { toast } from 'sonner';

interface SqlLabPageProps {
  onNavigate?: (path: string) => void;
}

const SUPPORTED_DATA_TYPES: SQLDataType[] = [
  'INTEGER',
  'BIGINT',
  'DECIMAL',
  'FLOAT',
  'VARCHAR',
  'CHAR',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIME',
  'TIMESTAMP',
  'JSON',
];

export function SqlLabPage({ onNavigate }: SqlLabPageProps) {
  // Database & Schema state
  const [workspaces, setWorkspaces] = React.useState<Array<{ name: string; table_count: number }>>([]);
  const [selectedDb, setSelectedDb] = React.useState<string>('university_db');
  const [schemas, setSchemas] = React.useState<Record<string, SQLTableDefinition[]>>({});
  const [challenges, setChallenges] = React.useState<SQLChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = React.useState<SQLChallenge | null>(null);
  const [queryHistory, setQueryHistory] = React.useState<SQLQueryHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = React.useState<'builder' | 'editor' | 'data' | 'challenges' | 'history'>('builder');

  // Schema Explorer state
  const [expandedTables, setExpandedTables] = React.useState<Record<string, boolean>>({});
  const [selectedTable, setSelectedTable] = React.useState<SQLTableDefinition | null>(null);

  // Table Designer Modal / Pane State
  const [showTableDesigner, setShowTableDesigner] = React.useState(false);
  const [designerTableName, setDesignerTableName] = React.useState('');
  const [designerDescription, setDesignerDescription] = React.useState('');
  const [designerColumns, setDesignerColumns] = React.useState<SQLTableColumn[]>([
    { name: 'id', type: 'INTEGER', is_primary_key: true, is_auto_increment: true, is_nullable: false },
    { name: 'title', type: 'VARCHAR', length_precision: '100', is_nullable: false },
  ]);
  const [generatedSqlPreview, setGeneratedSqlPreview] = React.useState('');
  const [isCreatingTable, setIsCreatingTable] = React.useState(false);

  // Foreign key modal within designer
  const [showFkSection, setShowFkSection] = React.useState(false);
  const [fkSourceCol, setFkSourceCol] = React.useState('');
  const [fkTargetTable, setFkTargetTable] = React.useState('');
  const [fkTargetCol, setFkTargetCol] = React.useState('');
  const [fkOnUpdate, setFkOnUpdate] = React.useState<'CASCADE' | 'RESTRICT' | 'SET NULL'>('CASCADE');
  const [fkOnDelete, setFkOnDelete] = React.useState<'CASCADE' | 'RESTRICT' | 'SET NULL'>('RESTRICT');

  // Create Database Modal
  const [showCreateDbModal, setShowCreateDbModal] = React.useState(false);
  const [newDbName, setNewDbName] = React.useState('');

  // Table Data Viewer State
  const [tableData, setTableData] = React.useState<TableDataResponse | null>(null);
  const [dataSearch, setDataSearch] = React.useState('');
  const [dataSortBy, setDataSortBy] = React.useState('');
  const [dataSortDir, setDataSortDir] = React.useState<'ASC' | 'DESC'>('ASC');
  const [dataPage, setDataPage] = React.useState(1);
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  // Insert Row Modal
  const [showInsertRowModal, setShowInsertRowModal] = React.useState(false);
  const [newRowData, setNewRowData] = React.useState<Record<string, any>>({});
  const [isInsertingRow, setIsInsertingRow] = React.useState(false);

  // Edit Row Modal
  const [editingRow, setEditingRow] = React.useState<Record<string, any> | null>(null);
  const [editRowData, setEditRowData] = React.useState<Record<string, any>>({});

  // SQL Editor State
  const [query, setQuery] = React.useState(
    'SELECT branch, COUNT(student_id) AS total_students, ROUND(AVG(cgpa), 2) AS avg_cgpa\nFROM students\nGROUP BY branch\nORDER BY avg_cgpa DESC;'
  );
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<SQLExecutionResult | null>(null);

  // Load initial data
  const loadInitialData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedWorkspaces, fetchedSchemas, fetchedChallenges, fetchedHistory] = await Promise.all([
        learningModulesApi.sqlLab.getWorkspaces().catch(() => [{ name: 'university_db', table_count: 4 }]),
        learningModulesApi.sqlLab.getSchemas(),
        learningModulesApi.sqlLab.getChallenges(),
        learningModulesApi.sqlLab.getHistory(selectedDb).catch(() => []),
      ]);
      setWorkspaces(fetchedWorkspaces);
      setSchemas(fetchedSchemas);
      setChallenges(fetchedChallenges);
      setQueryHistory(fetchedHistory);

      // Auto-select first table if exists
      const currentTables = fetchedSchemas[selectedDb] || [];
      if (currentTables.length > 0 && !selectedTable) {
        setSelectedTable(currentTables[0]);
        // Expand first table in explorer
        setExpandedTables({ [currentTables[0].name]: true });
      }
    } catch (err: any) {
      toast.error('Failed to load SQL database: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDb, selectedTable]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load table data when selected table changes
  const loadCurrentTableData = React.useCallback(async (tableName: string, page = 1) => {
    try {
      setIsLoadingData(true);
      const res = await learningModulesApi.sqlLab.getTableData(selectedDb, tableName, {
        page,
        limit: 15,
        search: dataSearch,
        sort_by: dataSortBy,
        sort_dir: dataSortDir,
      });
      setTableData(res);
      setDataPage(page);
    } catch (err: any) {
      toast.error('Failed to load table records: ' + err.message);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedDb, dataSearch, dataSortBy, dataSortDir]);

  React.useEffect(() => {
    if (selectedTable) {
      loadCurrentTableData(selectedTable.name, dataPage);
    }
  }, [selectedTable, loadCurrentTableData, dataPage]);

  // Keep Generated SQL Synchronized in Real-Time
  React.useEffect(() => {
    if (!designerTableName.trim()) {
      setGeneratedSqlPreview('-- Please specify a table name above');
      return;
    }
    const colsSql = designerColumns.map((col) => {
      let line = `  "${col.name || 'col'}" ${col.type}`;
      if (col.length_precision) {
        line += `(${col.length_precision})`;
      }
      if (col.is_primary_key) line += ' PRIMARY KEY';
      if (col.is_auto_increment) line += ' AUTO_INCREMENT';
      if (!col.is_nullable && !col.is_primary_key) line += ' NOT NULL';
      if (col.is_unique && !col.is_primary_key) line += ' UNIQUE';
      if (col.default_value) {
        const isNum = !isNaN(Number(col.default_value));
        line += ` DEFAULT ${isNum ? col.default_value : `'${col.default_value}'`}`;
      }
      if (col.foreign_key) {
        line += ` REFERENCES "${col.foreign_key.referenced_table}" ("${col.foreign_key.referenced_column}")`;
        if (col.foreign_key.on_delete) line += ` ON DELETE ${col.foreign_key.on_delete}`;
        if (col.foreign_key.on_update) line += ` ON UPDATE ${col.foreign_key.on_update}`;
      }
      return line;
    });

    setGeneratedSqlPreview(`CREATE TABLE "${designerTableName.trim().toLowerCase()}" (\n${colsSql.join(',\n')}\n);`);
  }, [designerTableName, designerColumns]);

  // Run SQL in Sandbox
  const handleRunQuery = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }
    try {
      setIsExecuting(true);
      const result = await learningModulesApi.sqlLab.executeSql(q, selectedDb);
      setExecutionResult(result);
      if (result.success) {
        toast.success(`Query executed in ${result.execution_time_ms}ms (${result.row_count} rows returned)`);
        // Refresh schemas and table data if DDL was run
        loadInitialData();
      } else {
        toast.error('SQL Execution Error: ' + result.error);
      }
    } catch (err: any) {
      toast.error('Sandbox execution failure: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  // Toggle Table Tree Expansion
  const toggleTableExpand = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  // Column Designer Handlers
  const handleAddColumn = () => {
    const newColName = `col_${designerColumns.length + 1}`;
    setDesignerColumns((prev) => [
      ...prev,
      {
        name: newColName,
        type: 'VARCHAR',
        length_precision: '50',
        is_nullable: true,
      },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    if (designerColumns.length <= 1) {
      toast.error('Table must have at least one column');
      return;
    }
    setDesignerColumns((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleColumnChange = (index: number, field: keyof SQLTableColumn, value: any) => {
    setDesignerColumns((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Attach Foreign Key
  const handleAddForeignKey = () => {
    if (!fkSourceCol || !fkTargetTable || !fkTargetCol) {
      toast.error('Please specify source column, target table, and target column');
      return;
    }
    setDesignerColumns((prev) =>
      prev.map((col) => {
        if (col.name === fkSourceCol) {
          return {
            ...col,
            is_foreign_key: true,
            references: `${fkTargetTable}(${fkTargetCol})`,
            foreign_key: {
              source_column: fkSourceCol,
              referenced_table: fkTargetTable,
              referenced_column: fkTargetCol,
              on_update: fkOnUpdate,
              on_delete: fkOnDelete,
            },
          };
        }
        return col;
      })
    );
    setShowFkSection(false);
    toast.success(`Foreign key constraint attached: ${fkSourceCol} -> ${fkTargetTable}(${fkTargetCol})`);
  };

  // Execute Create Table from Designer
  const handleCreateTable = async () => {
    if (!designerTableName.trim()) {
      toast.error('Please enter a valid table name');
      return;
    }
    try {
      setIsCreatingTable(true);
      const foreign_keys = designerColumns
        .filter((c) => c.foreign_key)
        .map((c) => c.foreign_key!);

      const res = await learningModulesApi.sqlLab.createTable(selectedDb, {
        name: designerTableName.trim().toLowerCase(),
        schema_name: selectedDb,
        description: designerDescription,
        columns: designerColumns,
        foreign_keys,
        sample_rows: [],
      });

      toast.success(`Table '${res.table.name}' created in sandbox database '${selectedDb}'!`);
      setShowTableDesigner(false);
      setDesignerTableName('');
      setDesignerDescription('');
      // Reload database schemas
      await loadInitialData();
      setSelectedTable(res.table);
      setActiveTab('data');
    } catch (err: any) {
      toast.error('Failed to create table: ' + err.message);
    } finally {
      setIsCreatingTable(false);
    }
  };

  // Drop Table Handler
  const handleDropTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to drop table '${tableName}' from ${selectedDb}? This cannot be undone.`)) {
      return;
    }
    try {
      await learningModulesApi.sqlLab.dropTable(selectedDb, tableName);
      toast.success(`Table '${tableName}' dropped.`);
      if (selectedTable?.name === tableName) {
        setSelectedTable(null);
        setTableData(null);
      }
      loadInitialData();
    } catch (err: any) {
      toast.error('Cannot drop table: ' + err.message);
    }
  };

  // Create Schema / Database Handler
  const handleCreateDatabase = async () => {
    if (!newDbName.trim()) {
      toast.error('Please enter a database name');
      return;
    }
    try {
      const res = await learningModulesApi.sqlLab.createWorkspace(newDbName);
      toast.success(res.message);
      setShowCreateDbModal(false);
      const cleanName = newDbName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      setSelectedDb(cleanName);
      setNewDbName('');
      loadInitialData();
    } catch (err: any) {
      toast.error('Failed to create database: ' + err.message);
    }
  };

  // Insert Row Handler
  const handleInsertRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    try {
      setIsInsertingRow(true);
      await learningModulesApi.sqlLab.insertRow(selectedDb, selectedTable.name, newRowData);
      toast.success('Row inserted successfully!');
      setShowInsertRowModal(false);
      setNewRowData({});
      loadCurrentTableData(selectedTable.name, dataPage);
    } catch (err: any) {
      toast.error('Constraint violation: ' + err.message);
    } finally {
      setIsInsertingRow(false);
    }
  };

  // Edit Row Handler
  const handleEditRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !editingRow) return;
    const pkCol = selectedTable.columns.find((c) => c.is_primary_key);
    if (!pkCol) return;
    try {
      await learningModulesApi.sqlLab.updateRow(selectedDb, selectedTable.name, editingRow[pkCol.name], editRowData);
      toast.success('Row updated successfully!');
      setEditingRow(null);
      loadCurrentTableData(selectedTable.name, dataPage);
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    }
  };

  // Delete Row Handler
  const handleDeleteRow = async (row: Record<string, any>) => {
    if (!selectedTable) return;
    const pkCol = selectedTable.columns.find((c) => c.is_primary_key);
    if (!pkCol) return;
    if (!confirm(`Delete record where ${pkCol.name}=${row[pkCol.name]}?`)) return;
    try {
      await learningModulesApi.sqlLab.deleteRow(selectedDb, selectedTable.name, row[pkCol.name]);
      toast.success('Record deleted.');
      loadCurrentTableData(selectedTable.name, dataPage);
    } catch (err: any) {
      toast.error('Delete rejected: ' + err.message);
    }
  };

  // Generate Sample Records Handler
  const handleGenerateSampleData = async () => {
    if (!selectedTable) return;
    try {
      const res = await learningModulesApi.sqlLab.generateSampleData(selectedDb, selectedTable.name, 3);
      toast.success(`Generated ${res.generated_count} sample records for '${selectedTable.name}'`);
      loadCurrentTableData(selectedTable.name, dataPage);
    } catch (err: any) {
      toast.error('Sample generation failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="SQL / Database Lab" description="Loading isolated relational sandbox..." />
        <LoadingState message="SQLDatabaseAgent initializing safe relational tables & workspaces..." />
      </PageContainer>
    );
  }

  const currentTables = schemas[selectedDb] || [];

  return (
    <PageContainer>
      <PageHeader
        title="SQL / Database Lab"
        description="Dual visual schema designer & SQL console with isolated sandbox, constraint enforcement, real data viewer, and execution planner."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Sandbox Isolated
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Database Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1">
              <Database className="w-4 h-4 text-slate-500" />
              <select
                value={selectedDb}
                onChange={(e) => {
                  setSelectedDb(e.target.value);
                  setSelectedTable(null);
                  setTableData(null);
                }}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {workspaces.map((w) => (
                  <option key={w.name} value={w.name}>
                    {w.name} ({w.table_count} tables)
                  </option>
                ))}
              </select>
            </div>

            {/* Create DB Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDbModal(true)}
              className="text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              <FolderPlus className="w-4 h-4 mr-1.5 text-slate-600" />
              New Schema
            </Button>

            {/* Create Table Button */}
            <Button
              size="sm"
              onClick={() => setShowTableDesigner(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Table
            </Button>
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Visual Schema Builder
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'editor'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          SQL Editor & Console
        </button>
        <button
          onClick={() => {
            if (!selectedTable && currentTables.length > 0) {
              setSelectedTable(currentTables[0]);
            }
            setActiveTab('data');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'data'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Table className="w-4 h-4" />
          Table Data Viewer
          {selectedTable && (
            <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-800 text-xs rounded font-mono">
              {selectedTable.name}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'challenges'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          Lab Challenges ({challenges.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Query History
        </button>
      </div>

      {/* TAB 1: VISUAL SCHEMA BUILDER & EXPLORER */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Schema Explorer Tree */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Schema Explorer
                </h3>
                <p className="text-xs text-slate-500 font-mono">Active: {selectedDb}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTableDesigner(true)}
                className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Table
              </Button>
            </div>

            {currentTables.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Table className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">No tables created yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Use the visual table designer to create your first relational table.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowTableDesigner(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  Create Table Now
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {currentTables.map((tbl) => {
                  const isExpanded = !!expandedTables[tbl.name];
                  const isSelected = selectedTable?.name === tbl.name;
                  return (
                    <div
                      key={tbl.name}
                      className={`rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      {/* Table Header Row */}
                      <div className="flex items-center justify-between p-2.5">
                        <button
                          onClick={() => toggleTableExpand(tbl.name)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <Table className="w-4 h-4 text-blue-600" />
                          <span className="font-mono text-sm font-bold text-slate-800">{tbl.name}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                            {tbl.columns.length} cols
                          </span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedTable(tbl);
                              setActiveTab('data');
                            }}
                            title="View Records in Data Manager"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDropTable(tbl.name)}
                            title="Drop Table"
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Columns List */}
                      {isExpanded && (
                        <div className="border-t border-slate-200/80 px-3 py-2 space-y-1 bg-white/70">
                          {tbl.columns.map((col) => (
                            <div
                              key={col.name}
                              className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-slate-100/70"
                            >
                              <div className="flex items-center gap-1.5">
                                {col.is_primary_key ? (
                                  <Key className="w-3.5 h-3.5 text-amber-500" aria-label="Primary Key" />
                                ) : col.is_foreign_key ? (
                                  <Link className="w-3.5 h-3.5 text-indigo-500" aria-label="Foreign Key" />
                                ) : (
                                  <span className="w-3.5" />
                                )}
                                <span className="font-mono text-slate-700 font-medium">{col.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                                  {col.type}
                                  {col.length_precision ? `(${col.length_precision})` : ''}
                                </span>
                                {col.is_primary_key && (
                                  <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                                    PK
                                  </span>
                                )}
                                {col.is_foreign_key && (
                                  <span className="text-[9px] px-1 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">
                                    FK
                                  </span>
                                )}
                                {!col.is_nullable && !col.is_primary_key && (
                                  <span className="text-[9px] px-1 py-0.2 bg-red-100 text-red-700 rounded">
                                    NN
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Visual Table Designer or Structure Inspector */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-[700px]">
            {showTableDesigner ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Table className="w-5 h-5 text-blue-600" />
                      Visual Table Designer
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure schema attributes, constraints, data types, and foreign key relations.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTableDesigner(false)}
                      className="text-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateTable}
                      disabled={isCreatingTable}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isCreatingTable ? 'Creating...' : 'Create Table in Sandbox'}
                    </Button>
                  </div>
                </div>

                {/* Form Fields: Table Name and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Table Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. orders, instructors, submissions"
                      value={designerTableName}
                      onChange={(e) => setDesignerTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student lab submissions with timestamps"
                      value={designerDescription}
                      onChange={(e) => setDesignerDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Columns Table Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Columns Definition ({designerColumns.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFkSection(!showFkSection)}
                      className="h-7 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      <Link className="w-3 h-3 mr-1" />
                      Add Relationship / FK
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddColumn}
                      className="h-7 text-xs bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Column
                    </Button>
                  </div>
                </div>

                {/* Foreign Key Attachment Dropdown if Open */}
                {showFkSection && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg mb-3 text-xs">
                    <h5 className="font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-indigo-600" />
                      Configure Foreign Key Relationship
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
                      <div>
                        <label className="block text-indigo-800 font-medium mb-1">Source Column</label>
                        <select
                          value={fkSourceCol}
                          onChange={(e) => setFkSourceCol(e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded p-1 text-slate-700 font-mono"
                        >
                          <option value="">Select column</option>
                          {designerColumns.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-indigo-800 font-medium mb-1">Referenced Table</label>
                        <select
                          value={fkTargetTable}
                          onChange={(e) => {
                            setFkTargetTable(e.target.value);
                            setFkTargetCol('');
                          }}
                          className="w-full bg-white border border-indigo-200 rounded p-1 text-slate-700 font-mono"
                        >
                          <option value="">Select table</option>
                          {currentTables.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-indigo-800 font-medium mb-1">Referenced Column</label>
                        <select
                          value={fkTargetCol}
                          onChange={(e) => setFkTargetCol(e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded p-1 text-slate-700 font-mono"
                        >
                          <option value="">Select PK col</option>
                          {fkTargetTable &&
                            currentTables
                              .find((t) => t.name === fkTargetTable)
                              ?.columns.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name} ({c.type})
                                </option>
                              ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-indigo-800 font-medium mb-1">ON UPDATE</label>
                        <select
                          value={fkOnUpdate}
                          onChange={(e: any) => setFkOnUpdate(e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded p-1 text-slate-700 font-mono"
                        >
                          <option value="CASCADE">CASCADE</option>
                          <option value="RESTRICT">RESTRICT</option>
                          <option value="SET NULL">SET NULL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-indigo-800 font-medium mb-1">ON DELETE</label>
                        <select
                          value={fkOnDelete}
                          onChange={(e: any) => setFkOnDelete(e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded p-1 text-slate-700 font-mono"
                        >
                          <option value="RESTRICT">RESTRICT</option>
                          <option value="CASCADE">CASCADE</option>
                          <option value="SET NULL">SET NULL</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddForeignKey}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
                      >
                        Attach Constraint
                      </Button>
                    </div>
                  </div>
                )}

                {/* Columns Scrollable List */}
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg mb-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Column Name</th>
                        <th className="py-2 px-3">Data Type</th>
                        <th className="py-2 px-2">Length/Precision</th>
                        <th className="py-2 px-2 text-center" title="Primary Key">PK</th>
                        <th className="py-2 px-2 text-center" title="Not Null">NN</th>
                        <th className="py-2 px-2 text-center" title="Unique">UQ</th>
                        <th className="py-2 px-2 text-center" title="Auto Increment">AI</th>
                        <th className="py-2 px-3">Default Value</th>
                        <th className="py-2 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {designerColumns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-3">
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => handleColumnChange(idx, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                              className="w-full border border-slate-300 rounded px-2 py-1 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                              placeholder="column_name"
                            />
                          </td>
                          <td className="py-1.5 px-3">
                            <select
                              value={col.type}
                              onChange={(e) => handleColumnChange(idx, 'type', e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white font-mono"
                            >
                              {SUPPORTED_DATA_TYPES.map((dt) => (
                                <option key={dt} value={dt}>
                                  {dt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={col.length_precision || ''}
                              onChange={(e) => handleColumnChange(idx, 'length_precision', e.target.value)}
                              placeholder="e.g. 255"
                              disabled={!['VARCHAR', 'CHAR', 'DECIMAL'].includes(col.type)}
                              className="w-16 border border-slate-300 rounded px-1.5 py-1 text-xs font-mono disabled:bg-slate-100"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!col.is_primary_key}
                              onChange={(e) => handleColumnChange(idx, 'is_primary_key', e.target.checked)}
                              className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={!col.is_nullable}
                              onChange={(e) => handleColumnChange(idx, 'is_nullable', !e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!col.is_unique}
                              onChange={(e) => handleColumnChange(idx, 'is_unique', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!col.is_auto_increment}
                              onChange={(e) => handleColumnChange(idx, 'is_auto_increment', e.target.checked)}
                              disabled={!['INTEGER', 'BIGINT'].includes(col.type)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40"
                            />
                          </td>
                          <td className="py-1.5 px-3">
                            <input
                              type="text"
                              value={col.default_value || ''}
                              onChange={(e) => handleColumnChange(idx, 'default_value', e.target.value)}
                              placeholder="NULL"
                              className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              onClick={() => handleRemoveColumn(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Real-Time Generated SQL Preview */}
                <div className="bg-slate-900 rounded-lg p-3 text-slate-200">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-blue-400" />
                      Generated DDL SQL Preview
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSqlPreview);
                        toast.success('SQL copied to clipboard');
                      }}
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                      Copy SQL
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-emerald-400 overflow-x-auto max-h-24">
                    {generatedSqlPreview}
                  </pre>
                </div>
              </div>
            ) : selectedTable ? (
              /* Selected Table Structure & Relationships View */
              <div className="flex-1 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Table className="w-5 h-5 text-blue-600" />
                      {selectedTable.name}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedTable.description || 'Database entity'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('data')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      <Table className="w-3.5 h-3.5 mr-1.5" />
                      Open in Data Manager
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(`SELECT * FROM ${selectedTable.name} LIMIT 20;`);
                        setActiveTab('editor');
                      }}
                      className="text-xs text-slate-700 border-slate-300"
                    >
                      <Terminal className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Query in SQL Editor
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                    Table Schema & Constraints
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Constraints</th>
                        <th className="py-2.5 px-3">Foreign Key Reference</th>
                        <th className="py-2.5 px-3">Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTable.columns.map((c) => (
                        <tr key={c.name} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800 flex items-center gap-1.5">
                            {c.is_primary_key && <Key className="w-3.5 h-3.5 text-amber-500" />}
                            {c.is_foreign_key && <Link className="w-3.5 h-3.5 text-indigo-500" />}
                            {c.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {c.type}
                            {c.length_precision ? `(${c.length_precision})` : ''}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              {c.is_primary_key && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  PRIMARY KEY
                                </span>
                              )}
                              {!c.is_nullable && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-medium border border-red-200">
                                  NOT NULL
                                </span>
                              )}
                              {c.is_unique && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
                                  UNIQUE
                                </span>
                              )}
                              {c.is_auto_increment && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200">
                                  AUTO_INC
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs text-indigo-700">
                            {c.references || (c.foreign_key ? `${c.foreign_key.referenced_table}(${c.foreign_key.referenced_column})` : '—')}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-xs">
                            {c.default_value || 'NULL'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Foreign Key Relations Card */}
                  {selectedTable.foreign_keys && selectedTable.foreign_keys.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Link className="w-4 h-4 text-indigo-600" />
                        Relational Foreign Key Rules
                      </h4>
                      <div className="space-y-2">
                        {selectedTable.foreign_keys.map((fk, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <span className="font-mono text-slate-700">
                              <span className="font-bold text-slate-900">{selectedTable.name}</span>.{fk.source_column} &rarr;{' '}
                              <span className="font-bold text-indigo-700">{fk.referenced_table}</span>.{fk.referenced_column}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                                ON DELETE: {fk.on_delete || 'RESTRICT'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                                ON UPDATE: {fk.on_update || 'CASCADE'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Table className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-base font-semibold text-slate-800">Select a table or create a new one</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click any table in the Schema Explorer on the left to inspect its column constraints, or launch the Table Designer.
                </p>
                <Button
                  onClick={() => setShowTableDesigner(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Launch Table Designer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SQL EDITOR & CONSOLE */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Editor Top Bar */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{selectedDb} &gt; SQL Console</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-8"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  {isExecuting ? 'Executing...' : 'Run Query (Ctrl+Enter)'}
                </Button>
              </div>
            </div>

            {/* SQL Textarea */}
            <div className="p-4 bg-slate-950">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                rows={6}
                className="w-full bg-transparent text-emerald-400 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                placeholder="Write SQL statement (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, JOIN)..."
              />
            </div>

            {/* Quick Templates Bar */}
            <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-500 font-semibold">Templates:</span>
              <button
                onClick={() => setQuery(`SELECT * FROM students LIMIT 10;`)}
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
              >
                SELECT *
              </button>
              <button
                onClick={() =>
                  setQuery(
                    `SELECT s.name, s.branch, d.dept_name, d.building\nFROM students s\nJOIN departments d ON s.dept_id = d.dept_id;`
                  )
                }
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
              >
                JOIN Tables
              </button>
              <button
                onClick={() =>
                  setQuery(
                    `SELECT branch, COUNT(*) AS count, ROUND(AVG(cgpa), 2) AS avg_cgpa\nFROM students\nGROUP BY branch\nORDER BY avg_cgpa DESC;`
                  )
                }
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
              >
                GROUP BY Aggregates
              </button>
              <button
                onClick={() =>
                  setQuery(
                    `INSERT INTO students (name, email, branch, dept_id, semester, cgpa)\nVALUES ('Kavya Reddy', 'kavya.reddy@btech.edu', 'Computer Science', 'CSE', 6, 9.20);`
                  )
                }
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
              >
                INSERT Record
              </button>
            </div>
          </div>

          {/* Results Panel */}
          {executionResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  {executionResult.success ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      Execution Error
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    Duration: <strong className="text-slate-800">{executionResult.execution_time_ms}ms</strong>
                  </span>
                  <span className="text-xs text-slate-500">
                    Returned Rows: <strong className="text-slate-800">{executionResult.row_count}</strong>
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {executionResult.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono text-red-700 mb-3">
                  {executionResult.error}
                </div>
              )}

              {/* Execution Plan / Relational Insights */}
              {executionResult.explanation && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 mb-3 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Query Execution Plan: </span>
                    <span className="font-mono">{executionResult.explanation}</span>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {executionResult.rows.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 text-slate-400 font-mono w-12 text-center">#</th>
                        {executionResult.columns.map((col) => (
                          <th key={col} className="py-2 px-3 font-mono">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {executionResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-mono">
                          <td className="py-2 px-3 text-slate-400 text-center">{idx + 1}</td>
                          {executionResult.columns.map((col) => (
                            <td key={col} className="py-2 px-3 text-slate-800">
                              {row[col] === null ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : typeof row[col] === 'boolean' ? (
                                row[col] ? 'TRUE' : 'FALSE'
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : executionResult.success ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Statement executed successfully. No rows returned.
                </p>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TABLE DATA VIEWER & ROW MANAGER */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-semibold text-slate-700">Select Table:</span>
              <select
                value={selectedTable?.name || ''}
                onChange={(e) => {
                  const tbl = currentTables.find((t) => t.name === e.target.value);
                  if (tbl) setSelectedTable(tbl);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {currentTables.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={dataSearch}
                  onChange={(e) => setDataSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSampleData}
                disabled={!selectedTable}
                className="text-xs text-slate-700 border-slate-300"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Generate Sample Rows
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setNewRowData({});
                  setShowInsertRowModal(true);
                }}
                disabled={!selectedTable}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Insert Row
              </Button>
            </div>
          </div>

          {/* Table Data Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoadingData ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <LoadingState message="Loading table records from sandbox..." />
              </div>
            ) : !tableData || tableData.rows.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Table className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No records found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Insert rows manually or click "Generate Sample Rows" to populate test data.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleGenerateSampleData}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs"
                  >
                    Generate 3 Sample Rows
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewRowData({});
                      setShowInsertRowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    Insert Single Row
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-slate-400 font-mono w-10 text-center">#</th>
                      {tableData.columns.map((col) => (
                        <th
                          key={col.name}
                          onClick={() => {
                            if (dataSortBy === col.name) {
                              setDataSortDir(dataSortDir === 'ASC' ? 'DESC' : 'ASC');
                            } else {
                              setDataSortBy(col.name);
                              setDataSortDir('ASC');
                            }
                          }}
                          className="py-2.5 px-3 font-mono cursor-pointer hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-1">
                            {col.is_primary_key && <Key className="w-3 h-3 text-amber-500" />}
                            {col.name}
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-400 text-center">
                          {(tableData.page - 1) * tableData.limit + idx + 1}
                        </td>
                        {tableData.columns.map((col) => (
                          <td key={col.name} className="py-2.5 px-3 text-slate-800">
                            {row[col.name] === null ? (
                              <span className="text-slate-400 italic">NULL</span>
                            ) : typeof row[col.name] === 'boolean' ? (
                              row[col.name] ? 'TRUE' : 'FALSE'
                            ) : (
                              String(row[col.name])
                            )}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingRow(row);
                                setEditRowData({ ...row });
                              }}
                              title="Edit Record"
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row)}
                              title="Delete Record"
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {tableData && tableData.total_pages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {(tableData.page - 1) * tableData.limit + 1} to{' '}
                  {Math.min(tableData.page * tableData.limit, tableData.total_rows)} of {tableData.total_rows} records
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={tableData.page <= 1}
                    onClick={() => loadCurrentTableData(selectedTable!.name, tableData.page - 1)}
                    className="h-7 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="px-2 font-semibold">
                    {tableData.page} / {tableData.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={tableData.page >= tableData.total_pages}
                    onClick={() => loadCurrentTableData(selectedTable!.name, tableData.page + 1)}
                    className="h-7 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Available Challenges</h3>
            {challenges.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setSelectedChallenge(ch)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedChallenge?.id === ch.id
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ch.difficulty === 'EASY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ch.difficulty === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ch.difficulty}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{ch.category}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{ch.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ch.description}</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            {selectedChallenge ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedChallenge.title}</h3>
                    <span className="text-xs text-slate-500">Database: {selectedChallenge.schema_name}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuery(selectedChallenge.starter_query);
                      setActiveTab('editor');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    Load into SQL Editor
                  </Button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Problem Statement</h4>
                  <p className="text-sm text-slate-700">{selectedChallenge.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Starter Query</h4>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs">
                    {selectedChallenge.starter_query}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Hints</h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {selectedChallenge.hints.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 5: QUERY HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Student SQL Query History
          </h3>
          {queryHistory.length === 0 ? (
            <p className="text-xs text-slate-400">No queries executed in this session yet.</p>
          ) : (
            <div className="space-y-3">
              {queryHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          h.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {h.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{h.schema_name}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(h.executed_at).toLocaleTimeString()} ({h.duration_ms}ms)
                      </span>
                    </div>
                    <pre className="text-xs font-mono text-slate-800 overflow-x-auto max-w-2xl">{h.query}</pre>
                    {h.error && <p className="text-xs text-red-600 font-mono">{h.error}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setQuery(h.query);
                      setActiveTab('editor');
                    }}
                    className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Reopen
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE SCHEMA / DATABASE */}
      {showCreateDbModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-600" />
              Create Student Lab Database
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate a dedicated relational schema workspace inside your sandbox environment.
            </p>
            <input
              type="text"
              placeholder="e.g. library_system, hospital_db"
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateDbModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateDatabase} className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Database
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INSERT ROW MODAL */}
      {showInsertRowModal && selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Insert Row into `{selectedTable.name}`
              </h3>
              <button onClick={() => setShowInsertRowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertRowSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedTable.columns.map((col) => (
                <div key={col.name}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>
                      {col.name}{' '}
                      {!col.is_nullable && !col.is_auto_increment && <span className="text-red-500">*</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {col.type} {col.is_auto_increment ? '(Auto Increment)' : ''}
                    </span>
                  </label>
                  <input
                    type={col.type === 'INTEGER' || col.type === 'DECIMAL' ? 'number' : 'text'}
                    step={col.type === 'DECIMAL' ? '0.01' : '1'}
                    disabled={col.is_auto_increment}
                    placeholder={col.is_auto_increment ? 'Generated automatically' : col.default_value || 'Value'}
                    value={newRowData[col.name] !== undefined ? newRowData[col.name] : ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono disabled:bg-slate-100"
                  />
                  {col.foreign_key && (
                    <p className="text-[10px] text-indigo-600 mt-0.5">
                      References {col.foreign_key.referenced_table}({col.foreign_key.referenced_column})
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowInsertRowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isInsertingRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isInsertingRow ? 'Inserting...' : 'Insert Row'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT ROW MODAL */}
      {editingRow && selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Record in `{selectedTable.name}`
              </h3>
              <button onClick={() => setEditingRow(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRowSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedTable.columns.map((col) => (
                <div key={col.name}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{col.name} {col.is_primary_key && '(Primary Key)'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{col.type}</span>
                  </label>
                  <input
                    type={col.type === 'INTEGER' || col.type === 'DECIMAL' ? 'number' : 'text'}
                    step={col.type === 'DECIMAL' ? '0.01' : '1'}
                    disabled={col.is_primary_key}
                    value={editRowData[col.name] !== undefined ? editRowData[col.name] : ''}
                    onChange={(e) => setEditRowData({ ...editRowData, [col.name]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono disabled:bg-slate-100"
                  />
                </div>
              ))}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 mt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingRow(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

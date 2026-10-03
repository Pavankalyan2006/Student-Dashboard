// src/features/knowledge/pages/KnowledgeBasePage.tsx
// Complete Personal Knowledge Base Hub with Semantic Search, Collection Categorization, and Interactive Knowledge Graph

import * as React from 'react';
import {
  Brain,
  Search,
  FolderOpen,
  Plus,
  Tag,
  BookOpen,
  FileText,
  HelpCircle,
  Code2,
  Sparkles,
  Share2,
  ExternalLink,
  Layers,
  ChevronRight,
  Network,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { KnowledgeItem, KnowledgeCollection, KnowledgeGraphData } from '../../../types/learningModules';
import { toast } from 'sonner';

interface KnowledgeBasePageProps {
  onNavigate?: (path: string) => void;
}

export function KnowledgeBasePage({ onNavigate }: KnowledgeBasePageProps) {
  const [collections, setCollections] = React.useState<KnowledgeCollection[]>([]);
  const [items, setItems] = React.useState<KnowledgeItem[]>([]);
  const [graphData, setGraphData] = React.useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'items' | 'collections' | 'graph' | 'create'>('items');
  const [selectedItem, setSelectedItem] = React.useState<KnowledgeItem | null>(null);

  // New Item State
  const [newItemTitle, setNewItemTitle] = React.useState('');
  const [newItemContent, setNewItemContent] = React.useState('');
  const [newItemTopic, setNewItemTopic] = React.useState('Database Management Systems');
  const [newItemTags, setNewItemTags] = React.useState('normalization, bcnf, relational-design');
  const [isSaving, setIsSaving] = React.useState(false);

  const loadData = React.useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const [colls, fetchedItems, graph] = await Promise.all([
        learningModulesApi.knowledge.getCollections(),
        learningModulesApi.knowledge.getItems(query),
        learningModulesApi.knowledge.getGraph(),
      ]);
      setCollections(colls);
      setItems(fetchedItems);
      setGraphData(graph);
      if (fetchedItems.length > 0 && !selectedItem) {
        setSelectedItem(fetchedItems[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load knowledge base: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !newItemContent.trim()) {
      toast.error('Please enter a title and markdown content');
      return;
    }
    try {
      setIsSaving(true);
      const created = await learningModulesApi.knowledge.createItem({
        title: newItemTitle,
        content: newItemContent,
        topic: newItemTopic,
        tags: newItemTags.split(',').map((t) => t.trim()).filter(Boolean),
        type: 'NOTE',
      });
      toast.success('Knowledge item stored & indexed for cross-agent semantic search!');
      setNewItemTitle('');
      setNewItemContent('');
      setSelectedItem(created);
      setActiveTab('items');
      loadData();
    } catch (err: any) {
      toast.error('Failed to store knowledge: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Personal Knowledge Base" description="Connecting student academic memory and notes..." />
        <LoadingState message="KnowledgeBaseAgent indexing multi-modal learning references..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Personal Knowledge Base"
        description="Unified long-term learning repository uniting your notes, doubts, documents, labs, and research citations."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            KnowledgeBaseAgent Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setActiveTab(activeTab === 'create' ? 'items' : 'create')}
              className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'create' ? 'View Knowledge' : 'Add Note / Resource'}
            </Button>
          </div>
        }
      />

      {/* Semantic Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes, doubts, citations... e.g. 'What did I learn about normalization?'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#D0D5DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <Button type="submit" size="sm" className="bg-[#101828] text-white text-xs">
          Search
        </Button>
      </form>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'items' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          All Knowledge Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'collections' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Collections ({collections.length})
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'graph' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Interactive Knowledge Graph
        </button>
      </div>

      {/* Tab 1: Knowledge Items Dual Pane */}
      {activeTab === 'items' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Items List (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedItem?.id === item.id
                    ? 'border-blue-500 bg-blue-50/30 shadow-sm ring-1 ring-blue-400'
                    : 'border-[#E4E7EC] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                  <span className="text-[11px] text-[#475467]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#101828] mt-1.5">{item.title}</h4>
                <p className="text-xs text-[#475467] line-clamp-2 mt-0.5">{item.content}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Full Item Markdown Viewer (7 cols) */}
          <div className="lg:col-span-7">
            {selectedItem ? (
              <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {selectedItem.topic}
                    </span>
                    <h2 className="text-xl font-bold text-[#101828] mt-1">{selectedItem.title}</h2>
                  </div>
                  <span className="text-xs text-[#475467]">
                    Updated {new Date(selectedItem.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-[#344054] leading-relaxed whitespace-pre-line font-normal space-y-2">
                  {selectedItem.content}
                </div>

                {selectedItem.source_reference && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-[#475467] flex items-center justify-between">
                    <span>Source: {selectedItem.source_reference.entity_type} ({selectedItem.source_reference.entity_id})</span>
                    <span className="font-semibold text-blue-600">Verified Evidence</span>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState title="Select a Knowledge Item" description="Choose a document or note from the left list." />
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Collections View */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collections.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#101828]">{c.name}</h3>
              <p className="text-xs text-[#475467]">{c.description}</p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#475467]">
                <span>{c.item_count} items stored</span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Explore</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Knowledge Graph Visualizer */}
      {activeTab === 'graph' && (
        <div className="p-6 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#101828] flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-600" />
              Curriculum & Learning Knowledge Graph
            </h3>
            <span className="text-xs text-[#475467]">
              {graphData.nodes.length} Nodes • {graphData.edges.length} Semantic Relationships
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {graphData.nodes.map((node) => (
              <div key={node.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {node.type}
                </span>
                <h4 className="text-xs font-bold text-[#101828] truncate">{node.label}</h4>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-[#344054] uppercase tracking-wider">Active Graph Edges</h4>
            <div className="space-y-1.5">
              {graphData.edges.map((edge, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg text-xs flex items-center gap-2 text-[#344054]">
                  <span className="font-semibold text-[#101828]">{edge.from}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    --[{edge.relationship}]--&gt;
                  </span>
                  <span className="font-semibold text-[#101828]">{edge.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Create Knowledge Item */}
      {activeTab === 'create' && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Add to Personal Knowledge Memory
          </h2>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Relational Normalization Invariants & Decomposition Proofs"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Curriculum Topic</label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={newItemTopic}
                onChange={(e) => setNewItemTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="bcnf, 3nf, functional-dependencies"
                value={newItemTags}
                onChange={(e) => setNewItemTags(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Markdown Content / Notes</label>
              <textarea
                placeholder="Key theorems, code excerpts, architectural invariants..."
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab('items')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-[#2563EB] text-white">
                {isSaving ? 'Indexing Knowledge...' : 'Save Knowledge Item'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}

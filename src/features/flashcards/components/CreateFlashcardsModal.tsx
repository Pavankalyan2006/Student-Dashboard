// src/features/flashcards/components/CreateFlashcardsModal.tsx
import * as React from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  BookOpen,
  Layers,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { FlashcardDeck, FlashcardType } from '../../../types/learningModules';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { notesApi } from '../../notes/api/notesApi';
import { documentsApi } from '../../documents/api/documentsApi';
import { coursesApi } from '../../courses/api/coursesApi';
import { toast } from 'sonner';

interface CreateFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'manual' | 'ai' | 'notes' | 'course';
  onDeckCreated: (deck: FlashcardDeck) => void;
}

export const CreateFlashcardsModal: React.FC<CreateFlashcardsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'manual',
  onDeckCreated,
}) => {
  const [activeTab, setActiveTab] = React.useState<'manual' | 'ai' | 'notes' | 'course'>(defaultTab);

  // Sync defaultTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Loading & Submitting State
  const [isLoadingMaterials, setIsLoadingMaterials] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Option A: Manual Creation State
  const [manualTitle, setManualTitle] = React.useState('');
  const [manualSubject, setManualSubject] = React.useState('Operating Systems');
  const [manualDescription, setManualDescription] = React.useState('');
  const [manualTags, setManualTags] = React.useState('');
  const [manualCards, setManualCards] = React.useState<
    Array<{ front: string; back: string; type: FlashcardType; topic: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD' }>
  >([
    {
      front: '',
      back: '',
      type: 'CONCEPT',
      topic: 'Operating Systems',
      difficulty: 'MEDIUM',
    },
  ]);

  // Option B: AI Generation State
  const [aiTopic, setAiTopic] = React.useState('');
  const [aiSubject, setAiSubject] = React.useState('Computer Science');
  const [aiDifficulty, setAiDifficulty] = React.useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [aiStyle, setAiStyle] = React.useState<'DEFINITION' | 'CONCEPT' | 'COMPARISON' | 'EXAMPLE' | 'FORMULA' | 'MIXED'>('MIXED');
  const [aiCount, setAiCount] = React.useState(6);
  const [previewCards, setPreviewCards] = React.useState<any[] | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState('');
  const [previewSubject, setPreviewSubject] = React.useState('');

  // Option C: Notes & Documents State
  const [savedNotes, setSavedNotes] = React.useState<any[]>([]);
  const [savedDocs, setSavedDocs] = React.useState<any[]>([]);
  const [selectedSourceType, setSelectedSourceType] = React.useState<'NOTE' | 'DOCUMENT'>('NOTE');
  const [selectedNoteId, setSelectedNoteId] = React.useState('');
  const [selectedDocId, setSelectedDocId] = React.useState('');

  // Option D: Courses State
  const [enrolledCourses, setEnrolledCourses] = React.useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [selectedChapterId, setSelectedChapterId] = React.useState('');

  // Load contextual materials when opening Notes or Courses tabs
  React.useEffect(() => {
    if (!isOpen) return;

    async function loadSources() {
      try {
        setIsLoadingMaterials(true);
        const [notesRes, docsRes, coursesRes] = await Promise.allSettled([
          notesApi.getNotes(),
          documentsApi.getDocuments({ limit: 50 }),
          coursesApi.getCourses({ limit: 100 }),
        ]);

        if (notesRes.status === 'fulfilled') {
          const nList = notesRes.value?.items || [];
          setSavedNotes(nList);
          if (nList.length > 0 && !selectedNoteId) setSelectedNoteId(nList[0].id);
        }

        if (docsRes.status === 'fulfilled') {
          const dList = docsRes.value?.items || [];
          setSavedDocs(dList);
          if (dList.length > 0 && !selectedDocId) setSelectedDocId(dList[0].id);
        }

        if (coursesRes.status === 'fulfilled') {
          const cList: any[] = coursesRes.value?.items || [];
          setEnrolledCourses(cList);
          if (cList.length > 0 && !selectedCourseId) {
            setSelectedCourseId(cList[0].id);
            if (cList[0].chapters?.length > 0) {
              setSelectedChapterId(cList[0].chapters[0].id);
            }
          }
        }
      } catch (err) {
        // Non-critical loading failure
      } finally {
        setIsLoadingMaterials(false);
      }
    }

    loadSources();
  }, [isOpen]);

  if (!isOpen) return null;

  // Add Card to Manual Form
  const handleAddManualCard = () => {
    setManualCards((prev) => [
      ...prev,
      {
        front: '',
        back: '',
        type: 'CONCEPT',
        topic: manualSubject || 'General',
        difficulty: 'MEDIUM',
      },
    ]);
  };

  const handleRemoveManualCard = (index: number) => {
    if (manualCards.length <= 1) {
      toast.error('Deck must have at least one card');
      return;
    }
    setManualCards((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateManualCard = (index: number, field: string, value: any) => {
    setManualCards((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, [field]: value } : c))
    );
  };

  // Submit Option A: Manual
  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualSubject.trim()) {
      toast.error('Please enter a deck title and subject');
      return;
    }

    const invalidCard = manualCards.find((c) => !c.front.trim() || !c.back.trim());
    if (invalidCard) {
      toast.error('All cards must have a front question and back answer');
      return;
    }

    try {
      setIsSubmitting(true);
      const tagsArray = manualTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await learningModulesApi.flashcards.createDeck({
        title: manualTitle.trim(),
        subject: manualSubject.trim(),
        description: manualDescription.trim(),
        tags: tagsArray,
        source_type: 'MANUAL',
        cards: manualCards.map((c) => ({
          ...c,
          topic: c.topic || manualSubject,
        })) as any,
      });

      toast.success('Flashcard deck saved with active recall prompts!');
      onDeckCreated(created);
      onClose();
    } catch (err: any) {
      toast.error('Failed to create deck: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Option B: AI Generation Preview
  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic or concept to generate flashcards');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await learningModulesApi.flashcards.generateAIFlashcards({
        topic: aiTopic.trim(),
        subject: aiSubject.trim(),
        difficulty: aiDifficulty,
        style: aiStyle,
        count: aiCount,
      });

      setPreviewCards(res.cards);
      setPreviewTitle(res.title);
      setPreviewSubject(res.subject);
      toast.success(
        res.is_fallback
          ? 'Generated structured flashcards from academic syllabus base!'
          : 'AI generated high-yield active recall flashcards!'
      );
    } catch (err: any) {
      toast.error('Failed to generate cards: ' + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Save AI Generated Deck
  const handleSavePreviewDeck = async (sourceType: 'AI_GENERATED' | 'NOTES' | 'DOCUMENT' | 'COURSE' = 'AI_GENERATED', sourceId?: string, sourceTitle?: string) => {
    if (!previewCards || previewCards.length === 0) return;

    try {
      setIsSubmitting(true);
      const created = await learningModulesApi.flashcards.createDeck({
        title: previewTitle || `${aiTopic} Flashcards`,
        subject: previewSubject || aiSubject || 'Computer Science',
        description: `Generated ${previewCards.length} high-yield concept cards covering ${previewTitle}.`,
        source_type: sourceType,
        source_id: sourceId,
        source_title: sourceTitle,
        tags: [previewSubject || aiSubject, 'AI Generated', 'Active Recall'],
        cards: previewCards.map((c) => ({
          front: c.front,
          back: c.back,
          type: c.type || 'CONCEPT',
          topic: c.topic || previewSubject || aiSubject,
          difficulty: c.difficulty || 'MEDIUM',
          explanation: c.explanation || '',
          example: c.example || '',
        })) as any,
      });

      toast.success('Generated flashcard deck saved to your library!');
      onDeckCreated(created);
      onClose();
    } catch (err: any) {
      toast.error('Failed to save deck: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate from Notes / Documents
  const handleGenerateFromMaterial = async () => {
    try {
      setIsGenerating(true);
      if (selectedSourceType === 'NOTE') {
        if (!selectedNoteId) {
          toast.error('Please select a note');
          return;
        }
        const res = await learningModulesApi.flashcards.generateFromNote(selectedNoteId);
        setPreviewCards(res.cards);
        setPreviewTitle(res.title);
        setPreviewSubject(res.subject);
      } else {
        if (!selectedDocId) {
          toast.error('Please select an uploaded document');
          return;
        }
        const res = await learningModulesApi.flashcards.generateFromDocument(selectedDocId, 8);
        setPreviewCards(res.cards);
        setPreviewTitle(res.title);
        setPreviewSubject(res.subject);
      }
      toast.success('Extracted grounded revision cards from study material!');
    } catch (err: any) {
      toast.error('Generation failed: ' + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate from Course
  const handleGenerateFromCourse = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await learningModulesApi.flashcards.generateFromCourse(
        selectedCourseId,
        selectedChapterId || undefined,
        8
      );
      setPreviewCards(res.cards);
      setPreviewTitle(res.title);
      setPreviewSubject(res.subject);
      toast.success('Extracted syllabus-aligned cards from enrolled course!');
    } catch (err: any) {
      toast.error('Generation failed: ' + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Flashcards</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Choose your preferred method to build active recall revision decks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Creation Tabs */}
        <div className="px-6 border-b border-gray-100 flex items-center gap-2 overflow-x-auto bg-white py-2">
          <button
            onClick={() => {
              setActiveTab('manual');
              setPreviewCards(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Manual Creation
          </button>

          <button
            onClick={() => {
              setActiveTab('ai');
              setPreviewCards(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Topic Generator
          </button>

          <button
            onClick={() => {
              setActiveTab('notes');
              setPreviewCards(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            From Notes & Documents
          </button>

          <button
            onClick={() => {
              setActiveTab('course');
              setPreviewCards(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'course'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            From Semester Courses
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* =========================================================
              Tab 1: Manual Creation
              ========================================================= */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deck Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Operating Systems: Synchronization Primitives"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Branch <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Brief scope of topics covered in this deck..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    placeholder="e.g. Sem 4, Mutex, Deadlocks, GATE"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cards List in Form */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Deck Flashcards ({manualCards.length})
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddManualCard}
                    className="text-xs h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Card
                  </Button>
                </div>

                {manualCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Card #{idx + 1}</span>
                      {manualCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveManualCard(idx)}
                          className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={card.front}
                        onChange={(e) => handleUpdateManualCard(idx, 'front', e.target.value)}
                        placeholder="Front: Clear question, definition prompt, or concept check..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        value={card.back}
                        onChange={(e) => handleUpdateManualCard(idx, 'back', e.target.value)}
                        placeholder="Back: Direct answer, explanation, formulas, or code..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <select
                          aria-label="Card type"
                          value={card.type}
                          onChange={(e) => handleUpdateManualCard(idx, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                        >
                          <option value="CONCEPT">Concept</option>
                          <option value="DEFINITION">Definition</option>
                          <option value="FORMULA">Formula</option>
                          <option value="COMPARISON">Comparison</option>
                          <option value="CODE">Code / Syntax</option>
                          <option value="QA">Question & Answer</option>
                        </select>
                      </div>

                      <div>
                        <select
                          aria-label="Card difficulty"
                          value={card.difficulty}
                          onChange={(e) => handleUpdateManualCard(idx, 'difficulty', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSubmitting ? 'Saving Deck...' : 'Save Deck to Library'}
                </Button>
              </div>
            </form>
          )}

          {/* =========================================================
              Tab 2: AI Topic Generator
              ========================================================= */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {!previewCards ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Topic or Concept <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Bellman-Ford Shortest Path Algorithm, Virtual Memory Paging, ACID Properties"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Area</label>
                      <input
                        type="text"
                        value={aiSubject}
                        onChange={(e) => setAiSubject(e.target.value)}
                        placeholder="e.g. Data Structures, Operating Systems, Computer Networks"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                      <select
                        aria-label="Difficulty"
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="BEGINNER">Beginner (Foundations & Terms)</option>
                        <option value="INTERMEDIATE">Intermediate (Engineering Core)</option>
                        <option value="ADVANCED">Advanced (Proof & Invariants)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Card Style</label>
                      <select
                        aria-label="Card style"
                        value={aiStyle}
                        onChange={(e) => setAiStyle(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="MIXED">Mixed (Balanced Recall)</option>
                        <option value="DEFINITION">Definitions & Core Laws</option>
                        <option value="CONCEPT">Conceptual Mechanics</option>
                        <option value="COMPARISON">Comparisons & Trade-offs</option>
                        <option value="FORMULA">Formula & Complexity Bounds</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Number of Cards: <span className="font-bold text-blue-600">{aiCount}</span>
                      </label>
                      <input
                        type="range"
                        min={3}
                        max={12}
                        value={aiCount}
                        onChange={(e) => setAiCount(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !aiTopic.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGenerating ? 'AI Generating Active Recall Cards...' : 'Generate Flashcards'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Preview State */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{previewTitle}</h4>
                      <p className="text-xs text-slate-600">
                        Review the generated cards. You can edit or remove cards before saving to your library.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewCards(null)}
                      className="text-xs gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {previewCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            Card #{idx + 1} • {card.type}
                          </span>
                          <button
                            onClick={() =>
                              setPreviewCards((prev) => prev?.filter((_, i) => i !== idx) || [])
                            }
                            className="text-xs text-rose-500 hover:text-rose-700"
                            title="Remove Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={card.front}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreviewCards((prev) =>
                              prev?.map((c, i) => (i === idx ? { ...c, front: val } : c)) || []
                            );
                          }}
                          className="w-full text-xs font-bold text-slate-900 bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />

                        <textarea
                          value={card.back}
                          rows={2}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreviewCards((prev) =>
                              prev?.map((c, i) => (i === idx ? { ...c, back: val } : c)) || []
                            );
                          }}
                          className="w-full text-xs text-slate-600 bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button variant="outline" size="sm" onClick={() => setPreviewCards(null)}>
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSavePreviewDeck('AI_GENERATED')}
                      disabled={isSubmitting || previewCards.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6"
                    >
                      {isSubmitting ? 'Saving Deck...' : `Save ${previewCards.length} Cards to Library`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              Tab 3: From Notes & Documents
              ========================================================= */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {!previewCards ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">Source Material Type:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSourceType('NOTE')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedSourceType === 'NOTE'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        My Saved Notes ({savedNotes.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSourceType('DOCUMENT')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedSourceType === 'DOCUMENT'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Uploaded Documents ({savedDocs.length})
                      </button>
                    </div>
                  </div>

                  {selectedSourceType === 'NOTE' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Select Note</label>
                      {savedNotes.length > 0 ? (
                        <select
                          aria-label="Note"
                          value={selectedNoteId}
                          onChange={(e) => setSelectedNoteId(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {savedNotes.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.title} ({n.tags?.[0] || 'Note'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                          No notes found in your account. You can create notes in the Notes module first.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Document (PDF / DOCX / TXT)
                      </label>
                      {savedDocs.length > 0 ? (
                        <select
                          aria-label="Document"
                          value={selectedDocId}
                          onChange={(e) => setSelectedDocId(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {savedDocs.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.title} [{d.file_name || d.category || 'Doc'}]
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                          No documents found. You can upload textbook or syllabus PDFs in the Documents module.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      onClick={handleGenerateFromMaterial}
                      disabled={isGenerating || (selectedSourceType === 'NOTE' ? !selectedNoteId : !selectedDocId)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGenerating ? 'Synthesizing Grounded Flashcards...' : 'Extract Flashcards from Material'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{previewTitle}</h4>
                      <p className="text-xs text-slate-600">
                        Grounded in: {selectedSourceType === 'NOTE' ? 'Saved Study Note' : 'Indexed Document'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPreviewCards(null)}>
                      Back
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {previewCards.map((card, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Card #{idx + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-900">{card.front}</p>
                        <p className="text-xs text-slate-600">{card.back}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSavePreviewDeck(
                          selectedSourceType === 'NOTE' ? 'NOTES' : 'DOCUMENT',
                          selectedSourceType === 'NOTE' ? selectedNoteId : selectedDocId,
                          previewTitle
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6"
                    >
                      Save to Deck Library
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              Tab 4: From Courses
              ========================================================= */}
          {activeTab === 'course' && (
            <div className="space-y-4">
              {!previewCards ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Enrolled Course</label>
                    {enrolledCourses.length > 0 ? (
                      <select
                        aria-label="Course"
                        value={selectedCourseId}
                        onChange={(e) => {
                          const cId = e.target.value;
                          setSelectedCourseId(cId);
                          const crs = enrolledCourses.find((c) => c.id === cId);
                          if (crs?.chapters?.length > 0) {
                            setSelectedChapterId(crs.chapters[0].id);
                          } else {
                            setSelectedChapterId('');
                          }
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {enrolledCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.code || c.branch || 'Course'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                        No enrolled courses found. Enroll in subjects in the Courses module first.
                      </div>
                    )}
                  </div>

                  {selectedCourseId && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Chapter / Syllabus Unit (Optional)
                      </label>
                      {enrolledCourses.find((c) => c.id === selectedCourseId)?.chapters?.length > 0 ? (
                        <select
                          aria-label="Chapter"
                          value={selectedChapterId}
                          onChange={(e) => setSelectedChapterId(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">All Units & Chapters</option>
                          {enrolledCourses
                            .find((c) => c.id === selectedCourseId)
                            ?.chapters.map((ch: any) => (
                              <option key={ch.id} value={ch.id}>
                                {ch.title}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <p className="text-xs text-gray-400 italic">This course has no separate chapters configured.</p>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      onClick={handleGenerateFromCourse}
                      disabled={isGenerating || !selectedCourseId}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGenerating ? 'Extracting Syllabus Active Recall Cards...' : 'Generate Syllabus Flashcards'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{previewTitle}</h4>
                      <p className="text-xs text-slate-600">Grounded in official course syllabus</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPreviewCards(null)}>
                      Back
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {previewCards.map((card, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Card #{idx + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-900">{card.front}</p>
                        <p className="text-xs text-slate-600">{card.back}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSavePreviewDeck('COURSE', selectedCourseId, previewTitle)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6"
                    >
                      Save to Deck Library
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

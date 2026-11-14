// src/features/knowledge-base/components/KnowledgeStudyMaterialModal.tsx
// Interactive study material generator & viewer (Flashcards, Quizzes, Summaries, Formulas)

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileText,
  Calculator,
  Award,
} from 'lucide-react';
import {
  StudyMaterialType,
  GeneratedStudyMaterial,
  FlashcardItem,
  QuizQuestionItem,
  FormulaItem,
} from '../types/knowledgeBaseTypes';
import { DocumentCardData } from '../../documents/types/document';
import { knowledgeBaseApi } from '../api/knowledgeBaseApi';

interface KnowledgeStudyMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentCardData[];
  initialDocumentId?: string;
}

export const KnowledgeStudyMaterialModal: React.FC<KnowledgeStudyMaterialModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDocumentId,
}) => {
  const [documentId, setDocumentId] = useState<string>(
    initialDocumentId || (documents.length > 0 ? documents[0].id : '')
  );
  const [materialType, setMaterialType] = useState<StudyMaterialType>('FLASHCARDS');
  const [topicFocus, setTopicFocus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedMaterial, setGeneratedMaterial] = useState<GeneratedStudyMaterial | null>(null);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, number>>({});

  // Module Export States
  const [savingNote, setSavingNote] = useState(false);
  const [savedNoteMsg, setSavedNoteMsg] = useState<string | null>(null);

  const [savingFlashcards, setSavingFlashcards] = useState(false);
  const [savedFlashcardsMsg, setSavedFlashcardsMsg] = useState<string | null>(null);

  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savedQuizMsg, setSavedQuizMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!documentId) return;
    setGenerating(true);
    setGeneratedMaterial(null);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setCurrentQuizIndex(0);
    setUserSelectedOption(null);
    setQuizScore(0);
    setAnsweredMap({});
    setSavedNoteMsg(null);
    setSavedFlashcardsMsg(null);
    setSavedQuizMsg(null);

    try {
      const result = await knowledgeBaseApi.generateStudyMaterial({
        document_id: documentId,
        type: materialType,
        topic: topicFocus.trim() || undefined,
      });
      setGeneratedMaterial(result);
    } catch (err) {
      console.error('Failed generating study material:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToNotes = async () => {
    if (!generatedMaterial) return;
    setSavingNote(true);
    setSavedNoteMsg(null);
    try {
      await knowledgeBaseApi.saveMaterialToNotes(generatedMaterial.id);
      setSavedNoteMsg('Saved to Notes!');
    } catch {
      setSavedNoteMsg('Save failed');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveToFlashcards = async () => {
    if (!generatedMaterial) return;
    setSavingFlashcards(true);
    setSavedFlashcardsMsg(null);
    try {
      await knowledgeBaseApi.saveMaterialToFlashcards(generatedMaterial.id);
      setSavedFlashcardsMsg('Exported to Deck!');
    } catch {
      setSavedFlashcardsMsg('Export failed');
    } finally {
      setSavingFlashcards(false);
    }
  };

  const handleSaveToQuiz = async () => {
    if (!generatedMaterial) return;
    setSavingQuiz(true);
    setSavedQuizMsg(null);
    try {
      await knowledgeBaseApi.saveMaterialToQuiz(generatedMaterial.id);
      setSavedQuizMsg('Quiz Created!');
    } catch {
      setSavedQuizMsg('Save failed');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleSelectQuizAnswer = (optionIdx: number, correctIdx: number) => {
    if (answeredMap[currentQuizIndex] !== undefined) return; // already answered
    setUserSelectedOption(optionIdx);
    setAnsweredMap({ ...answeredMap, [currentQuizIndex]: optionIdx });
    if (optionIdx === correctIdx) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const selectedDoc = documents.find((d) => d.id === documentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Study Deck & Practice Lab</h2>
              <p className="text-xs text-slate-500">Generate interactive revision aids from your notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Configuration controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Document Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Source Document
                </label>
                <select
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {documents.length === 0 && <option value="">No documents uploaded</option>}
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title || d.original_filename}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Type Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Study Format
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as StudyMaterialType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="FLASHCARDS">Interactive Flashcards</option>
                  <option value="QUIZ">Self-Assessment Quiz (MCQ)</option>
                  <option value="SUMMARY">Executive Structured Summary</option>
                  <option value="FORMULA_SHEET">Formula & Complexity Sheet</option>
                </select>
              </div>
            </div>

            {/* Optional Topic Focus */}
            <div className="flex gap-2">
              <input
                type="text"
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                placeholder="Optional topic focus (e.g. 'Virtual Memory' or 'Time Complexity')..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !documentId}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-purple-600/25 shrink-0"
              >
                {generating ? 'Synthesizing...' : 'Generate Deck'}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {generating && (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900">Generating {materialType.toLowerCase()}...</p>
              <p className="text-xs text-slate-500 mt-1">Analyzing pages and extracting high-yield concepts</p>
            </div>
          )}

          {/* Generated Material Interactive View */}
          {generatedMaterial && !generating && (
            <div className="space-y-4">
              {/* Material Title Banner */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900">{generatedMaterial.title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">
                  {generatedMaterial.type}
                </span>
              </div>

              {/* 1. FLASHCARDS INTERACTIVE VIEW */}
              {generatedMaterial.type === 'FLASHCARDS' &&
                generatedMaterial.content.flashcards &&
                generatedMaterial.content.flashcards.length > 0 && (
                  <div className="space-y-4">
                    {/* Card Counter & Progress */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Card {currentFlashcardIndex + 1} of{' '}
                        {generatedMaterial.content.flashcards.length}
                      </span>
                      <span className="text-indigo-600 font-medium">Click card to flip</span>
                    </div>

                    {/* Flip Card Container */}
                    {(() => {
                      const card =
                        generatedMaterial.content.flashcards[currentFlashcardIndex];
                      return (
                        <div
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="min-h-[220px] p-6 rounded-2xl surface-hero border border-slate-200 hover:border-purple-200 transition cursor-pointer shadow-xl flex flex-col justify-between text-center select-none"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {card.topic || 'Core Concept'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                card.difficulty === 'HARD'
                                  ? 'text-red-600 bg-red-50'
                                  : card.difficulty === 'MEDIUM'
                                  ? 'text-amber-600 bg-amber-50'
                                  : 'text-emerald-600 bg-emerald-50'
                              }`}
                            >
                              {card.difficulty || 'MEDIUM'}
                            </span>
                          </div>

                          <div className="my-auto py-4">
                            {!isFlipped ? (
                              <div>
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                  Question
                                </span>
                                <h4 className="text-lg font-bold text-slate-900 px-4 leading-snug">
                                  {card.question}
                                </h4>
                              </div>
                            ) : (
                              <div className="animate-fade-in">
                                <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block mb-2">
                                  Answer & Rationale
                                </span>
                                <p className="text-sm font-medium text-slate-800 px-4 leading-relaxed">
                                  {card.answer}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                            <RotateCw className="w-3 h-3" />
                            <span>{!isFlipped ? 'Click to reveal answer' : 'Click to see question'}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={currentFlashcardIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-semibold transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIndex((prev) =>
                            Math.min(
                              generatedMaterial.content.flashcards!.length - 1,
                              prev + 1
                            )
                          );
                        }}
                        disabled={
                          currentFlashcardIndex ===
                          generatedMaterial.content.flashcards.length - 1
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold transition shadow-md shadow-purple-600/20"
                      >
                        <span>Next Card</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              {/* 2. QUIZ INTERACTIVE VIEW */}
              {generatedMaterial.type === 'QUIZ' &&
                generatedMaterial.content.quiz_questions &&
                generatedMaterial.content.quiz_questions.length > 0 && (
                  <div className="space-y-4">
                    {/* Score Tally Banner */}
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span>
                        Question {currentQuizIndex + 1} of{' '}
                        {generatedMaterial.content.quiz_questions.length}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <Award className="w-4 h-4" /> Score: {quizScore} /{' '}
                        {Object.keys(answeredMap).length}
                      </span>
                    </div>

                    {(() => {
                      const q = generatedMaterial.content.quiz_questions[currentQuizIndex];
                      const selectedIdx = answeredMap[currentQuizIndex];
                      const isAnswered = selectedIdx !== undefined;

                      return (
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {q.question}
                          </h4>

                          {/* Options */}
                          <div className="space-y-2">
                            {q.options.map((opt, idx) => {
                              const isCorrect = idx === q.correct_answer_index;
                              const isSelected = selectedIdx === idx;

                              let btnStyle =
                                'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';
                              if (isAnswered) {
                                if (isCorrect) {
                                  btnStyle =
                                    'bg-emerald-100 border-emerald-200 text-emerald-700 font-semibold';
                                } else if (isSelected) {
                                  btnStyle =
                                    'bg-red-100 border-red-200 text-red-700 font-semibold';
                                } else {
                                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-500';
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleSelectQuizAnswer(idx, q.correct_answer_index)}
                                  disabled={isAnswered}
                                  className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {isAnswered && isCorrect && (
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                  )}
                                  {isAnswered && isSelected && !isCorrect && (
                                    <XCircle className="w-4 h-4 text-red-600 shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Pedagogical Explanation */}
                          {isAnswered && (
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 animate-fade-in">
                              <span className="font-bold text-slate-900 block">Explanation:</span>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}

                          {/* Next Question Button */}
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => {
                                setCurrentQuizIndex((prev) =>
                                  Math.min(
                                    generatedMaterial.content.quiz_questions!.length - 1,
                                    prev + 1
                                  )
                                );
                              }}
                              disabled={
                                currentQuizIndex ===
                                generatedMaterial.content.quiz_questions.length - 1
                              }
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition"
                            >
                              Next Question →
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* 3. SUMMARY VIEW */}
              {generatedMaterial.type === 'SUMMARY' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  {generatedMaterial.content.summary && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Executive Synthesis
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {generatedMaterial.content.summary}
                      </p>
                    </div>
                  )}

                  {generatedMaterial.content.key_takeaways && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Key Engineering Takeaways
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {generatedMaterial.content.key_takeaways.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generatedMaterial.content.prerequisites && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Prerequisites
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {generatedMaterial.content.prerequisites.map((p, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. FORMULA SHEET VIEW */}
              {generatedMaterial.type === 'FORMULA_SHEET' &&
                generatedMaterial.content.formula_sheet && (
                  <div className="space-y-3">
                    {generatedMaterial.content.formula_sheet.map((f, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{f.name}</span>
                          {f.complexity && (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-mono text-[11px] font-semibold">
                              {f.complexity}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs text-cyan-700 overflow-x-auto">
                          {f.formula}
                        </div>
                        <p className="text-xs text-slate-500">{f.description}</p>
                        {f.variables && (
                          <p className="text-[11px] text-slate-500 italic">
                            Variables: {f.variables}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            {generatedMaterial && (
              <>
                <button
                  type="button"
                  onClick={handleSaveToNotes}
                  disabled={savingNote}
                  className="px-3.5 py-1.5 bg-indigo-100 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{savedNoteMsg || (savingNote ? 'Saving...' : 'Save to Notes')}</span>
                </button>

                {generatedMaterial.type === 'FLASHCARDS' && (
                  <button
                    type="button"
                    onClick={handleSaveToFlashcards}
                    disabled={savingFlashcards}
                    className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{savedFlashcardsMsg || (savingFlashcards ? 'Exporting...' : 'Export Deck')}</span>
                  </button>
                )}

                {generatedMaterial.type === 'QUIZ' && (
                  <button
                    type="button"
                    onClick={handleSaveToQuiz}
                    disabled={savingQuiz}
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{savedQuizMsg || (savingQuiz ? 'Saving...' : 'Save as Practice Quiz')}</span>
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl transition"
          >
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
};

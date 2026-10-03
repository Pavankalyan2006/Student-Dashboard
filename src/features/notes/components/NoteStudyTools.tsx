import * as React from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { FlashcardItem, QuizQuestionItem } from '../types/notes';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface FlashcardDeckProps {
  cards: FlashcardItem[];
  title?: string;
  onClose?: () => void;
}

export function FlashcardDeck({ cards, title, onClose }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#475467]">
        No flashcards available. Click Generate Flashcards to synthesize active recall cards.
      </div>
    );
  }

  const current = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  return (
    <Card className="border border-[#E4E7EC] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-[#E4E7EC] py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#2563EB]" />
          <CardTitle className="text-xs font-semibold text-[#101828]">
            {title ? `${title} · Flashcards` : 'Active Recall Flashcards'}
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#475467]">
            {currentIndex + 1} / {cards.length}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#98A2B3] hover:text-[#101828]"
            >
              Close
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Flashcard Area */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="min-h-[220px] p-6 rounded-xl border border-[#D0D5DD] bg-gradient-to-b from-white to-slate-50 cursor-pointer flex flex-col justify-between hover:shadow-md transition-all select-none"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#98A2B3]">
            <span>{isFlipped ? 'ANSWER & INTUITION' : 'QUESTION / PROMPT'}</span>
            <span className="capitalize text-[#2563EB]">{current.concept}</span>
          </div>

          <div className="my-auto py-4 text-center">
            <p className="text-sm font-medium text-[#101828] leading-relaxed">
              {isFlipped ? current.answer : current.question}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#98A2B3]">
            <span>Click card to flip</span>
            <span className="font-mono text-[10px] uppercase">{current.difficulty || 'medium'}</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#F2F4F7]">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="text-xs text-[#475467] flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-xs text-[#2563EB] font-medium hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Flip Card
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="text-xs text-[#475467] flex items-center gap-1"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuizRunnerProps {
  questions: QuizQuestionItem[];
  title?: string;
  onClose?: () => void;
}

export function QuizRunner({ questions, title, onClose }: QuizRunnerProps) {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#475467]">
        No quiz questions generated. Click Generate Quiz to evaluate your mastery.
      </div>
    );
  }

  const current = questions[currentIdx];

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === current.correct_answer_index) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="border border-[#E4E7EC] bg-white p-6 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] mx-auto mb-3">
          <Trophy className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-[#101828] mb-1">Quiz Completed!</h3>
        <p className="text-xs text-[#475467] mb-4">
          You scored <strong className="text-[#101828]">{score}</strong> out of{' '}
          <strong className="text-[#101828]">{questions.length}</strong> ({percentage}%)
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRestart} className="text-xs">
            Retake Quiz
          </Button>
          {onClose && (
            <Button size="sm" onClick={onClose} className="bg-[#2563EB] text-white text-xs">
              Finish Review
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-[#E4E7EC] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-[#E4E7EC] py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#2563EB]" />
          <CardTitle className="text-xs font-semibold text-[#101828]">
            {title ? `${title} · Quiz` : 'Concept Mastery Quiz'}
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#475467]">
            Question {currentIdx + 1} of {questions.length}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#98A2B3] hover:text-[#101828]"
            >
              Close
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-[#101828] leading-snug mb-4">
            {current.question}
          </h4>

          {/* Options */}
          <div className="space-y-2">
            {current.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === current.correct_answer_index;

              let style = 'border-[#D0D5DD] bg-white text-[#344054] hover:bg-slate-50';
              if (submitted) {
                if (isCorrect) {
                  style = 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-medium';
                } else if (isSelected && !isCorrect) {
                  style = 'border-rose-400 bg-rose-50/60 text-rose-950';
                } else {
                  style = 'border-[#E4E7EC] bg-white opacity-60';
                }
              } else if (isSelected) {
                style = 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-medium';
              }

              return (
                <div
                  key={idx}
                  onClick={() => !submitted && setSelectedOption(idx)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${style}`}
                >
                  <span>{opt}</span>
                  {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                  {submitted && isSelected && !isCorrect && (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation once submitted */}
        {submitted && (
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-[#1E3A8A]">
            <p className="font-semibold mb-1">Diagnostic Explanation:</p>
            <p className="leading-relaxed">{current.explanation}</p>
          </div>
        )}

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          {!submitted ? (
            <Button
              size="sm"
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 px-4"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 px-4"
            >
              {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

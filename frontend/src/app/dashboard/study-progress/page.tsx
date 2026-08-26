'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetStudyProgress, useGetIncorrectQuestions } from '@/services/studentDashboardApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function IncorrectQuestionsViewer({ chapterId, chapterName, onClose }: { chapterId: string; chapterName: string; onClose: () => void }) {
  const { data: response, isLoading } = useGetIncorrectQuestions(chapterId);
  const questions = response?.data || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl bg-muted shadow-2xl overflow-hidden flex flex-col h-full border-l border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-border">
            <div>
              <h3 className="text-[18px] font-bold text-foreground">Review Mistakes: {chapterName}</h3>
              <p className="text-[13px] font-medium text-muted-foreground mt-0.5">Reviewing {questions.length > 0 ? questions.length : ''} questions you answered incorrectly or skipped</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white hover:bg-muted border border-border rounded-full transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-muted-hover [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-hover">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-[20px] bg-white shadow-sm border border-border" />
                <Skeleton className="h-64 w-full rounded-[20px] bg-white shadow-sm border border-border" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[20px] border border-border shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 bg-success-light text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-[18px] font-bold text-foreground">Perfect Record!</h4>
                <p className="text-[14px] text-muted-foreground mt-1 font-medium">You haven't made any mistakes in this chapter yet.</p>
              </div>
            ) : (
              questions.map((q: any, i: number) => {
                const questionData = q.question;

                return (
                  <div key={i} className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-muted text-muted-foreground font-medium text-[12px] rounded-full">Question {i + 1}</span>
                      <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {q.timeSpent}s spent
                      </span>
                    </div>

                    <div className="text-[15px] font-medium text-foreground mb-5 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: questionData.questionText }} />

                    {questionData.questionImage && (
                      <div className="mb-5 border border-border rounded-xl overflow-hidden">
                        <img src={questionData.questionImage} alt="Question" className="max-w-full max-h-64 object-contain" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {questionData.options?.map((opt: any, optIdx: number) => {
                        const isCorrect = opt.isCorrect;
                        const isSelected = q.selectedOptionId === opt._id;

                        let optStyle = "border-border bg-white text-muted-foreground";
                        let bubbleStyle = "bg-muted text-muted-foreground";

                        if (isCorrect) {
                          optStyle = "border-[#10b981] bg-success-light/30 text-emerald-900";
                          bubbleStyle = "bg-[#10b981] text-white";
                        } else if (isSelected && !isCorrect) {
                          optStyle = "border-[#ef4444] bg-destructive-light/30 text-red-900";
                          bubbleStyle = "bg-[#ef4444] text-white";
                        }

                        return (
                          <div key={optIdx} className={`px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${optStyle}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${bubbleStyle}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="font-medium text-[14px]" dangerouslySetInnerHTML={{ __html: opt.text }} />

                            {/* Status Icon */}
                            {isCorrect && <CheckCircle className="w-4 h-4 text-[#10b981] ml-auto shrink-0" />}
                            {(isSelected && !isCorrect) && <X className="w-4 h-4 text-[#ef4444] ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {questionData.explanation && (
                      <div className="mt-6 p-4 bg-muted rounded-xl border border-border">
                        <h5 className="text-[13px] font-bold text-muted-foreground mb-2">Explanation:</h5>
                        <div className="text-[14px] font-medium text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: questionData.explanation }} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StudyProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'weak' ? 'weak' : 'strong';

  const [activeTab, setActiveTab] = useState<'strong' | 'weak'>(initialTab);
  const [selectedChapterForErrors, setSelectedChapterForErrors] = useState<{ id: string, name: string } | null>(null);

  const { data: response, isLoading } = useGetStudyProgress();
  const chaptersData = response?.data || [];

  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [sortBy, setSortBy] = useState('Performance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredChapters = useMemo(() => {
    let result = [...chaptersData];
    if (activeTab === 'strong') {
      result = result.filter(c => c.isStrong);
    } else {
      result = result.filter(c => !c.isStrong);
    }

    if (subjectFilter !== 'All Subjects') {
      result = result.filter(c => c.subject === subjectFilter);
    }

    if (sortBy === 'Performance') {
      result.sort((a, b) => b.accuracy - a.accuracy);
    } else if (sortBy === 'Attempts') {
      result.sort((a, b) => b.attempts - a.attempts);
    } else if (sortBy === 'Alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [chaptersData, subjectFilter, activeTab, sortBy]);

  const totalPages = Math.ceil(filteredChapters.length / itemsPerPage) || 1;
  const currentData = filteredChapters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8 rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="font-sans text-foreground">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-foreground">
          Study <span className="font-semibold text-foreground">Progress!</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 mb-6 border-b border-border">
        <button
          onClick={() => { setActiveTab('strong'); setCurrentPage(1); }}
          className={`pb-4 text-[15px] font-semibold transition-colors relative ${activeTab === 'strong'
              ? 'text-[#10b981]'
              : 'text-muted-foreground hover:text-muted-foreground'
            }`}
        >
          Chapters Strong ({chaptersData.filter(c => c.isStrong).length})
          {activeTab === 'strong' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981] rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('weak'); setCurrentPage(1); }}
          className={`pb-4 text-[15px] font-semibold transition-colors relative ${activeTab === 'weak'
              ? 'text-[#10b981]'
              : 'text-muted-foreground hover:text-muted-foreground'
            }`}
        >
          Needs Practice ({chaptersData.filter(c => !c.isStrong).length})
          {activeTab === 'weak' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981] rounded-t-full"></div>
          )}
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border overflow-hidden flex flex-col">

        {/* Table Header Controls */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-white">
          <h2 className="text-[18px] font-bold text-foreground">Chapter Performance</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={subjectFilter}
                onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none text-[13px] font-medium text-muted-foreground bg-white pl-4 pr-10 py-2 rounded-xl border border-border cursor-pointer outline-none hover:bg-muted transition-colors shadow-sm"
              >
                <option value="All Subjects">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="appearance-none text-[13px] font-medium text-muted-foreground bg-muted pl-[34px] pr-4 py-2 rounded-xl border border-border cursor-pointer outline-none hover:bg-muted transition-colors"
              >
                <option value="Performance">Sort: Performance</option>
                <option value="Attempts">Sort: Attempts</option>
                <option value="Alphabetical">Sort: Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-[13px] font-medium text-muted-foreground w-[280px]">Chapter</th>
                <th className="px-4 py-4 text-[13px] font-medium text-muted-foreground">Subject</th>
                <th className="px-4 py-4 text-[13px] font-medium text-muted-foreground text-center">Accuracy</th>
                <th className="px-4 py-4 text-[13px] font-medium text-muted-foreground text-center">Attempts</th>
                <th className="px-4 py-4 text-[13px] font-medium text-muted-foreground text-center">Correct</th>
                <th className="px-4 py-4 text-[13px] font-medium text-muted-foreground text-center">Incorrect</th>
                <th className="px-4 py-4 text-[13px] font-medium text-muted-foreground text-center">Score</th>
                <th className="px-6 py-4 text-[13px] font-medium text-muted-foreground w-[180px]">Progress</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((chapter, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center h-full min-h-[64px]">
                    <span className="font-bold text-foreground text-[14px]">{chapter.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium
                      ${chapter.subject === 'Physics' ? 'bg-[#ecfdf5] text-[#10b981]' :
                        chapter.subject === 'Chemistry' ? 'bg-[#eff6ff] text-[#3b82f6]' :
                          'bg-[#f5f3ff] text-[#8b5cf6]'}`}
                    >
                      {chapter.subject}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold text-[14px] ${chapter.accuracy >= 70 ? 'text-[#10b981]' : 'text-[#f97316]'}`}>
                      {chapter.accuracy}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-muted-foreground text-[14px]">
                    {chapter.attempts}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-[#10b981] text-[14px]">
                    {chapter.correct}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-[#ef4444] text-[13px]">
                    {chapter.wrong}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-muted-foreground text-[14px]">
                    {chapter.score}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${chapter.accuracy >= 70 ? 'bg-[#10b981]' : chapter.accuracy >= 40 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`}
                          style={{ width: `${chapter.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-[13px] font-medium text-muted-foreground w-8">{chapter.accuracy}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setSelectedChapterForErrors({ id: chapter.id, name: chapter.name })}
                      className="p-2 rounded-full hover:bg-muted transition-colors group"
                      title="View Incorrect Questions"
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#8b5cf6] transition-colors" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    No chapters found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/50">
          <div className="text-[13px] text-muted-foreground font-medium">
            Showing {filteredChapters.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredChapters.length)} of {filteredChapters.length} chapters
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-colors ${currentPage === i + 1
                    ? 'bg-[#10b981] text-white'
                    : 'text-muted-foreground hover:bg-muted-hover'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

      </div>

      {selectedChapterForErrors && (
        <IncorrectQuestionsViewer
          chapterId={selectedChapterForErrors.id}
          chapterName={selectedChapterForErrors.name}
          onClose={() => setSelectedChapterForErrors(null)}
        />
      )}
    </div>
  );
}

export default function StudyProgressPage() {
  return (
    <React.Suspense fallback={<div className="p-8"><Skeleton className="h-full w-full min-h-[500px] rounded-3xl" /></div>}>
      <StudyProgressContent />
    </React.Suspense>
  );
}

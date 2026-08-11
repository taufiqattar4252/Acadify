'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Filter, Check, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetQuestions, Question } from '@/services/questionApi';
import { useGetSubjects } from '@/services/subjectApi';
import { useGetChapters } from '@/services/chapterApi';
import QuestionPreviewModal from '../QuestionPreviewModal';

interface QuestionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (questions: Question[]) => void;
  selectedIds: string[]; // To mark already selected questions
}

export default function QuestionSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedIds
}: QuestionSelectorModalProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [pyqYearFilter, setPyqYearFilter] = useState('');
  
  const [localSelection, setLocalSelection] = useState<Map<string, Question>>(new Map());
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const { data: questionsData, isLoading } = useGetQuestions(
    page, 20, debouncedSearch, subjectFilter, chapterFilter, difficultyFilter, pyqYearFilter
  );

  const { data: subjectsData } = useGetSubjects(1, '', 100);
  const { data: chaptersData } = useGetChapters(1, '', subjectFilter || undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Clear local selection when opened
  useEffect(() => {
    if (isOpen) {
      setLocalSelection(new Map());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelection = (question: Question) => {
    const newSelection = new Map(localSelection);
    if (newSelection.has(question._id)) {
      newSelection.delete(question._id);
    } else {
      newSelection.set(question._id, question);
    }
    setLocalSelection(newSelection);
  };

  const selectAllCurrentPage = () => {
    const newSelection = new Map(localSelection);
    questionsData?.questions.forEach(q => {
      if (!selectedIds.includes(q._id)) {
        newSelection.set(q._id, q);
      }
    });
    setLocalSelection(newSelection);
  };

  const handleConfirm = () => {
    const selectedQuestions = Array.from(localSelection.values());
    onSelect(selectedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Questions</h2>
            <p className="text-sm text-slate-500 mt-1">
              {localSelection.size} selected. {selectedIds.length} already in mock test.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setChapterFilter(''); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[120px]"
          >
            <option value="">All Subjects</option>
            {subjectsData?.subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <select
            value={chapterFilter}
            onChange={(e) => { setChapterFilter(e.target.value); setPage(1); }}
            disabled={!subjectFilter}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[120px]"
          >
            <option value="">All Chapters</option>
            {chaptersData?.chapters.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[120px]"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <input
            type="number"
            placeholder="PYQ Year (e.g. 2023)"
            value={pyqYearFilter}
            onChange={(e) => { setPyqYearFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white w-[140px]"
          />
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questionsData?.questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No questions found matching the filters.
            </div>
          ) : (
            <div className="space-y-3">
              {questionsData?.questions.map((question) => {
                const isAlreadyAdded = selectedIds.includes(question._id);
                const isSelected = localSelection.has(question._id);
                
                return (
                  <div 
                    key={question._id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      isAlreadyAdded 
                        ? 'bg-slate-100 border-slate-200 opacity-60' 
                        : isSelected 
                          ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-200' 
                          : 'bg-white border-slate-200 hover:border-primary-200 hover:shadow-sm cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isAlreadyAdded) toggleSelection(question);
                    }}
                  >
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isAlreadyAdded ? 'bg-slate-300 border-slate-300' 
                        : isSelected ? 'bg-primary-500 border-primary-500 text-white' 
                        : 'border-slate-300 bg-white'
                      }`}>
                        {(isSelected || isAlreadyAdded) && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="text-sm text-slate-900 font-medium line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: question.questionText }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewQuestion(question);
                          }}
                          className="shrink-0 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Preview
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{question.subject?.name} - {question.chapter?.name}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {question.estimatedTime}s</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          +{question.positiveMarks} / -{question.negativeMarks}
                        </span>
                        {question.pyqYears && question.pyqYears.length > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            PYQ {question.pyqYears[0]} {question.pyqYears.length > 1 ? `+${question.pyqYears.length - 1}` : ''}
                          </span>
                        )}
                        {isAlreadyAdded && (
                          <span className="ml-auto flex items-center gap-1 text-slate-500 font-medium bg-slate-200 px-2 py-0.5 rounded">
                            <ShieldAlert className="w-3 h-3" /> Already in Mock Test
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={selectAllCurrentPage} disabled={!questionsData?.questions.length}>
              Select All on Page
            </Button>
            <div className="flex gap-1">
              <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1.5 h-auto text-slate-600">
                &lt;
              </Button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700">Page {page} of {questionsData?.pagination.pages || 1}</span>
              <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={page >= (questionsData?.pagination.pages || 1)} className="px-2 py-1.5 h-auto text-slate-600">
                &gt;
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={localSelection.size === 0}>
              Add {localSelection.size} Questions
            </Button>
          </div>
        </div>
      </motion.div>

      <QuestionPreviewModal 
        isOpen={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
      />
    </div>
  );
}

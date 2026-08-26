'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, Database, FileSpreadsheet, 
  Copy, Eye, ArchiveRestore, RotateCcw, Image as ImageIcon
} from 'lucide-react';
import { 
  useGetQuestions, useDeleteQuestion, useToggleQuestionStatus, 
  useRestoreQuestion, useDuplicateQuestion 
} from '@/services/questionApi';
import { useGetSubjects } from '@/services/subjectApi';
import { useGetChapters } from '@/services/chapterApi';
import { Button } from '@/components/ui/Button';
import QuestionFormModal from '@/components/admin/QuestionFormModal';
import QuestionPreviewModal from '@/components/admin/QuestionPreviewModal';
import BulkImportModal from '@/components/admin/BulkImportModal';
// No date-fns import needed
import api from '@/lib/axios';

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pyqYearFilter, setPyqYearFilter] = useState('');
  const [sort, setSort] = useState('-createdAt');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const { data: subjectsData } = useGetSubjects(1, '', 100 as any); // hack for getting all subjects
  const { data: chaptersData } = useGetChapters(1, '', subjectFilter); // gets chapters for selected subject

  const { data, isLoading } = useGetQuestions(
    page, limit, debouncedSearch, subjectFilter, chapterFilter, difficultyFilter, statusFilter, pyqYearFilter, sort
  );

  const deleteQuestion = useDeleteQuestion();
  const toggleStatus = useToggleQuestionStatus();
  const restoreQuestion = useRestoreQuestion();
  const duplicateQuestion = useDuplicateQuestion();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/questions/export', {
        params: { search: debouncedSearch, subject: subjectFilter, chapter: chapterFilter, difficulty: difficultyFilter, status: statusFilter, pyqYear: pyqYearFilter },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'questions.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const renderPagination = () => {
    if (!data?.pagination) return null;
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-border gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total {data.pagination.total} questions</span>
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="border-border rounded-md focus:ring-primary-500 py-1"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm font-medium px-4">
            Page {page} of {data.pagination.pages}
          </span>
          <Button variant="secondary" disabled={page === data.pagination.pages || data.pagination.pages === 0} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Question Bank</h2>
          <p className="text-muted-foreground mt-1">Manage all examination questions in the system.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="gap-2">
            <Database className="w-4 h-4" /> Import
          </Button>
          <Button variant="secondary" onClick={handleExport} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => { setSelectedQuestion(null); setIsFormModalOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Create Question
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search question text or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setChapterFilter(''); setPage(1); }}
            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm"
          >
            <option value="">All Subjects</option>
            {subjectsData?.subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select
            value={chapterFilter}
            onChange={(e) => { setChapterFilter(e.target.value); setPage(1); }}
            disabled={!subjectFilter}
            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm disabled:bg-muted disabled:text-muted-foreground"
          >
            <option value="">All Chapters</option>
            {chaptersData?.chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>

          <input
            type="number"
            placeholder="PYQ Year"
            value={pyqYearFilter}
            onChange={(e) => { setPyqYearFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Context</th>
                <th className="px-6 py-4">PYQ Years</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right sticky right-0 bg-muted shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-muted-foreground">Loading questions...</p>
                  </td>
                </tr>
              ) : data?.questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No questions found matching the filters.
                  </td>
                </tr>
              ) : (
                data?.questions.map((q: any) => (
                  <tr key={q._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground truncate" title={q.questionText}>
                          {q.questionText.replace(/(<([^>]+)>)/gi, "").substring(0, 50)}...
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{q.questionType}</span>
                          {q.questionImage && <ImageIcon className="w-3 h-3 text-primary" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-muted-foreground">{q.subject?.name}</span>
                        <span className="text-xs text-muted-foreground">{q.chapter?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {q.pyqYears && q.pyqYears.length > 0 ? (
                        <div className="text-xs font-medium text-primary">
                          {q.pyqYears.slice(0, 3).join(', ')}
                          {q.pyqYears.length > 3 && ` +${q.pyqYears.length - 3} More`}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit
                          ${q.difficulty === 'Easy' ? 'bg-success-light text-success' : 
                            q.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 
                            'bg-destructive-light text-destructive'}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">+{q.positiveMarks} / -{q.negativeMarks} marks</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          q.status === 'Published' ? 'bg-green-500' : 
                          q.status === 'Draft' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        <span className="text-sm text-muted-foreground">{q.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                      <button 
                        onClick={() => { setSelectedQuestion(q); setIsPreviewModalOpen(true); }}
                        className="p-1.5 text-muted-foreground hover:text-primary-600 transition-colors bg-white hover:bg-muted rounded shadow-sm border border-border"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedQuestion(q); setIsFormModalOpen(true); }}
                        className="p-1.5 text-muted-foreground hover:text-primary-600 transition-colors bg-white hover:bg-muted rounded shadow-sm border border-border"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Duplicate this question?')) duplicateQuestion.mutate(q._id); }}
                        className="p-1.5 text-muted-foreground hover:text-primary-600 transition-colors bg-white hover:bg-muted rounded shadow-sm border border-border"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Archive this question?')) deleteQuestion.mutate(q._id); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors bg-white hover:bg-destructive-light rounded shadow-sm border border-border"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      <QuestionFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        editQuestion={selectedQuestion} 
      />
      <QuestionPreviewModal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        question={selectedQuestion} 
      />
      <BulkImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
}

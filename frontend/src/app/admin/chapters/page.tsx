'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, BookOpen } from 'lucide-react';
import { useGetChapters, useDeleteChapter, useToggleChapterStatus } from '@/services/chapterApi';
import { useGetSubjects } from '@/services/subjectApi';
import { Button } from '@/components/ui/Button';
import ChapterFormModal from '@/components/admin/ChapterFormModal';

export default function ChaptersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const { data, isLoading } = useGetChapters(page, debouncedSearch, subjectFilter);
  const { data: subjectsData } = useGetSubjects(1, ''); // For filter dropdown

  const deleteChapter = useDeleteChapter();
  const toggleStatus = useToggleChapterStatus();

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleEdit = (chapter: any) => {
    setSelectedChapter(chapter);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedChapter(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter? It will be soft-deleted.')) {
      deleteChapter.mutate(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus.mutate(id);
  };

  const renderPagination = () => {
    if (!data?.pagination || data.pagination.pages <= 1) return null;
    return (
      <div className="flex justify-between items-center px-6 py-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Showing page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
        </span>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button 
            variant="secondary" 
            disabled={page === data.pagination.pages} 
            onClick={() => setPage(p => p + 1)}
          >
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
          <h2 className="text-2xl font-bold text-foreground">Chapters Management</h2>
          <p className="text-muted-foreground mt-1">Organize syllabus chapters under subjects</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Chapter
        </Button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Chapters</p>
            <p className="text-2xl font-bold text-foreground">{data?.pagination.total || 0}</p>
          </div>
        </div>
        
        <div className="md:col-span-2 relative h-16 md:h-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chapters by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full min-h-[4rem] pl-11 pr-4 rounded-xl border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground"
          />
        </div>

        <div className="h-16 md:h-auto">
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-full min-h-[4rem] px-4 rounded-xl border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground bg-white"
          >
            <option value="">All Subjects</option>
            {subjectsData?.subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Chapter Name</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-muted-foreground">Loading chapters...</p>
                  </td>
                </tr>
              ) : data?.chapters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No chapters found.
                  </td>
                </tr>
              ) : (
                data?.chapters.map((chapter: any) => (
                  <tr key={chapter._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{chapter.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      {chapter.subject ? (
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: chapter.subject.color || '#3B82F6' }}
                          ></span>
                          <span className="text-muted-foreground">{chapter.subject.name}</span>
                        </div>
                      ) : (
                        <span className="text-destructive">Unknown Subject</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {chapter.code}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(chapter._id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${chapter.isActive ? 'bg-primary-600' : 'bg-muted-hover'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${chapter.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {chapter.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(chapter)}
                        className="p-1.5 text-muted-foreground hover:text-primary-600 transition-colors bg-white hover:bg-muted rounded shadow-sm border border-border"
                        title="Edit Chapter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(chapter._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors bg-white hover:bg-destructive-light rounded shadow-sm border border-border"
                        title="Delete Chapter"
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

      <ChapterFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editChapter={selectedChapter} 
      />
    </div>
  );
}

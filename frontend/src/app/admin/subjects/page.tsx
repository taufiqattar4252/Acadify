'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ArrowLeftRight, Check, X, ShieldAlert, Layers } from 'lucide-react';
import { useGetSubjects, useDeleteSubject, useToggleSubjectStatus } from '@/services/subjectApi';
import { Button } from '@/components/ui/Button';
import SubjectFormModal from '@/components/admin/SubjectFormModal';

export default function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const { data, isLoading } = useGetSubjects(page, debouncedSearch);
  const deleteSubject = useDeleteSubject();
  const toggleStatus = useToggleSubjectStatus();

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? It will be soft-deleted.')) {
      deleteSubject.mutate(id);
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
          <h2 className="text-2xl font-bold text-foreground">Subjects Management</h2>
          <p className="text-muted-foreground mt-1">Create and manage MHT-CET subjects</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
            <p className="text-2xl font-bold text-foreground">{data?.pagination.total || 0}</p>
          </div>
        </div>
        
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-11 pr-4 rounded-xl border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Subject Info</th>
                <th className="px-6 py-4">Chapters</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Display Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-muted-foreground">Loading subjects...</p>
                  </td>
                </tr>
              ) : data?.subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                data?.subjects.map((subject: any) => (
                  <tr key={subject._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
                          style={{ backgroundColor: subject.color || '#3B82F6' }}
                        >
                          {subject.code.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{subject.name}</div>
                          <div className="text-muted-foreground text-xs">Code: {subject.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {subject.chaptersCount} Chapters
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(subject._id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${subject.isActive ? 'bg-primary-600' : 'bg-muted-hover'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${subject.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {subject.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(subject)}
                        className="p-1.5 text-muted-foreground hover:text-primary-600 transition-colors bg-white hover:bg-muted rounded shadow-sm border border-border"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(subject._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors bg-white hover:bg-destructive-light rounded shadow-sm border border-border"
                        title="Delete Subject"
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

      <SubjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editSubject={selectedSubject} 
      />
    </div>
  );
}

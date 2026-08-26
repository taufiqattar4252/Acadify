'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, 
  Trash2, Copy, FileText, Clock, IndianRupee,
  ChevronLeft, ChevronRight, X, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  useGetMockTests, 
  useDeleteMockTest, 
  useCloneMockTest,
  useUpdateMockTestStatus 
} from '@/services/mockTestApi';

export default function MockTestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('-createdAt');
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { data, isLoading } = useGetMockTests(page, limit, debouncedSearch, statusFilter, categoryFilter, '', sort);
  const deleteMock = useDeleteMockTest();
  const cloneMock = useCloneMockTest();
  const updateStatus = useUpdateMockTestStatus();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Dropdown click outside is handled by a backdrop div instead

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mock test?')) {
      deleteMock.mutate(id);
    }
  };

  const handleClone = (id: string) => {
    cloneMock.mutate(id);
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    updateStatus.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mock Tests</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, build, and publish mock tests.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={() => router.push('/admin/mock-tests/create')} className="w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Create Mock Test
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm bg-white min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Hidden">Hidden</option>
            <option value="Archived">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm bg-white min-w-[140px]"
          >
            <option value="">All Categories</option>
            <option value="Full Mock Test">Full Mock Test</option>
            <option value="Physics Test">Physics Test</option>
            <option value="Chemistry Test">Chemistry Test</option>
            <option value="Mathematics Test">Mathematics Test</option>
            <option value="Chapter-wise Test">Chapter-wise Test</option>
            <option value="Previous Year Paper">Previous Year Paper</option>
            <option value="Custom Practice Test">Custom Practice Test</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm bg-white min-w-[140px]"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-price">Highest Price</option>
            <option value="price">Lowest Price</option>
            <option value="-duration">Longest Duration</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border min-h-[300px]">
        <div className="overflow-visible">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Title & Category</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-muted-foreground">Loading mock tests...</p>
                  </td>
                </tr>
              ) : data?.tests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No mock tests found matching the filters.
                  </td>
                </tr>
              ) : (
                data?.tests.map((test) => (
                  <tr key={test._id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="font-semibold text-foreground">{test.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{test.slug}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border
                            ${test.category === 'Full Mock Test' ? 'bg-primary-light text-primary border-indigo-200' : 
                              test.category === 'Previous Year Paper' ? 'bg-warning-light text-warning border-amber-200' :
                              'bg-primary-light text-primary border-purple-200'}`}
                          >
                            {test.category || 'Full Mock Test'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-muted-foreground" /> {test.questions.length} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {test.duration} mins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {test.price === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-light text-success border border-green-200">
                          Free
                        </span>
                      ) : (
                        <span className="flex items-center text-sm font-medium text-foreground">
                          <IndianRupee className="w-3 h-3" /> {test.price}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleStatusToggle(test._id, test.status)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors border
                          ${test.status === 'Published' ? 'bg-success-light text-success border-green-200 hover:bg-success-light' : 
                            test.status === 'Draft' ? 'bg-muted text-muted-foreground border-border hover:bg-muted-hover' : 
                            'bg-warning-light text-warning border-orange-200 hover:bg-warning-light'}`}
                      >
                        {test.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === test._id ? null : test._id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === test._id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                              }}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-6 top-10 w-40 bg-white rounded-xl shadow-lg border border-border py-1 z-50"
                            >
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  router.push(`/admin/mock-tests/${test._id}/edit`);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit Builder
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleClone(test._id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4 text-muted-foreground" /> Duplicate
                              </button>
                              <div className="h-px bg-muted my-1 mx-2"></div>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(test._id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive-light flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" /> Delete
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(page * limit, data.pagination.total)}</span> of{' '}
              <span className="font-medium text-foreground">{data.pagination.total}</span> mock tests
            </p>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1.5 h-auto text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                let pageNum = page;
                if (page < 3) pageNum = i + 1;
                else if (page > data.pagination.pages - 2) pageNum = data.pagination.pages - 4 + i;
                else pageNum = page - 2 + i;
                
                if (pageNum > 0 && pageNum <= data.pagination.pages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'primary' : 'secondary'}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 h-auto min-w-[32px] ${page !== pageNum ? 'text-muted-foreground' : ''}`}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-2 py-1.5 h-auto text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

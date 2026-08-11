'use client';

import React, { useState } from 'react';
import { useAdminGetStudents, useAdminGetStudentStats, useAdminToggleStudentBlock } from '@/services/adminStudentApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Crown,
  Target,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  Key,
  Mail,
  Gift,
  RefreshCw,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import StudentDetailsDrawer from '@/components/admin/Students/StudentDetailsDrawer';

// Component for a Stat Card
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
    </div>
  </div>
);

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purchasedFilter, setPurchasedFilter] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading } = useAdminGetStudentStats();

  const { data: studentsData, isLoading: studentsLoading, refetch } = useAdminGetStudents({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter,
    purchased: purchasedFilter,
  });

  const toggleBlockMutation = useAdminToggleStudentBlock();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Debounce can be handled via a custom hook, but for simplicity here we just use the timeout
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('');
    setPurchasedFilter('');
    setPage(1);
  };

  const handleViewProfile = (id: string) => {
    setSelectedStudentId(id);
    setIsDrawerOpen(true);
  };

  const handleToggleBlock = (id: string, currentStatus: boolean) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'block' : 'unblock'} this student?`)) {
      toggleBlockMutation.mutate({ id, action: currentStatus ? 'block' : 'unblock' });
    }
  };

  const stats = statsData || {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    newRegistrations: 0,
    premiumStudents: 0,
    avgAccuracy: 0
  };

  const students = studentsData?.data?.students || [];
  const pagination = studentsData?.data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Students" value={statsLoading ? '...' : stats.totalStudents} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Students" value={statsLoading ? '...' : stats.activeStudents} icon={UserCheck} color="bg-green-500" />
        <StatCard title="Inactive Students" value={statsLoading ? '...' : stats.inactiveStudents} icon={UserX} color="bg-red-500" />
        <StatCard title="New Today" value={statsLoading ? '...' : stats.newRegistrations} icon={UserPlus} color="bg-purple-500" />
        <StatCard title="Premium Users" value={statsLoading ? '...' : stats.premiumStudents} icon={Crown} color="bg-amber-500" />
        <StatCard title="Avg Accuracy" value={statsLoading ? '...' : `${stats.avgAccuracy}%`} icon={Target} color="bg-indigo-500" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">

        {/* Header & Actions */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Students Management</h2>
          <Button variant="secondary" className="flex items-center gap-2" onClick={() => toast.error('Export feature coming soon!')}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={handleSearch}
                placeholder="Search by name, email, or phone..."
                className="pl-9 w-full"
              />
            </div>
            <Button type="submit" variant="primary">Search</Button>
          </form>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>

            <select
              value={purchasedFilter}
              onChange={(e) => { setPurchasedFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
            >
              <option value="">All Users</option>
              <option value="true">Premium Users</option>
              <option value="false">Free Users</option>
            </select>

            <Button variant="secondary" onClick={handleResetFilters} title="Reset Filters">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Reg. Date</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Purchases</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                    <p className="mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{student.fullName}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                          {student.phone && <p className="text-xs text-slate-400">{student.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs"><span className="font-medium text-slate-700">Avg:</span> {Math.round(student.averageScore)} pts</span>
                        <span className="text-xs"><span className="font-medium text-slate-700">Acc:</span> {Math.round(student.accuracy)}%</span>
                        <span className="text-xs text-slate-400">{student.examsAttempted} exams</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${student.purchasedMockTests > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {student.purchasedMockTests > 0 ? 'Premium' : 'Free'}
                        </span>
                        <span className="text-xs text-slate-500">₹{(student.totalAmountSpent || 0).toFixed(2)} spent</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => handleViewProfile(student._id)} title="View Profile" className="px-3 py-1">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          className={`px-3 py-1 ${student.isActive ? 'text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                          onClick={() => handleToggleBlock(student._id, student.isActive)}
                          title={student.isActive ? 'Block Student' : 'Unblock Student'}
                        >
                          {student.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!studentsLoading && students.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white rounded-b-xl">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> students
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                className="px-3 py-1 text-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                disabled={page === pagination.pages}
                className="px-3 py-1 text-sm"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <StudentDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedStudentId(null); }}
        studentId={selectedStudentId}
      />
    </div>
  );
}

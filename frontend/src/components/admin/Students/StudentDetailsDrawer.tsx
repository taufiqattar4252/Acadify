import React, { useState } from 'react';
import { 
  useAdminGetStudentDetails, 
  useAdminResetStudentPassword, 
  useAdminGrantMockTest 
} from '@/services/adminStudentApi';
import { X, User, Mail, Phone, Calendar, CreditCard, Activity, Target, Lock, Gift, ChevronRight, CheckCircle2, XCircle, AlertCircle, Loader2, Key } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function StudentDetailsDrawer({ isOpen, onClose, studentId }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newPassword, setNewPassword] = useState('');
  const [mockTestId, setMockTestId] = useState('');

  const { data, isLoading } = useAdminGetStudentDetails(studentId);
  const resetPasswordMutation = useAdminResetStudentPassword();
  const grantMockTestMutation = useAdminGrantMockTest();

  if (!isOpen) return null;

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    resetPasswordMutation.mutate({ id: studentId, newPassword }, {
      onSuccess: () => setNewPassword('')
    });
  };

  const handleGrantMockTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockTestId) {
      toast.error('Please enter a Mock Test ID');
      return;
    }
    grantMockTestMutation.mutate({ id: studentId, mockTestId }, {
      onSuccess: () => setMockTestId('')
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
          <p>Loading student details...</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <p>Student not found</p>
        </div>
      );
    }

    const { student, stats, purchases, attempts } = data;

    return (
      <div className="flex-1 overflow-y-auto">
        {/* Header Profile Section */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl flex-shrink-0">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student.fullName}</h2>
              <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                <Mail className="w-4 h-4" /> {student.email}
              </p>
              {student.phone && (
                <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                  <Phone className="w-4 h-4" /> {student.phone}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('purchases')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchases' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Purchases
            </button>
            <button 
              onClick={() => setActiveTab('performance')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Performance
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'actions' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Actions
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Registration Date</p>
                  <p className="font-semibold text-slate-900">{format(new Date(student.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {student.isActive ? 'Active' : 'Blocked'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Total Purchases</p>
                  <p className="font-semibold text-slate-900">{stats.totalPurchases}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                  <p className="font-semibold text-slate-900">₹{(stats.totalAmountSpent || 0).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Exam Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Exams Attempted</p>
                      <p className="font-bold text-slate-900">{stats.examsAttempted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Avg Accuracy</p>
                      <p className="font-bold text-slate-900">{Math.round(stats.accuracy)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-4">
              {purchases.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No purchases found.</p>
              ) : (
                purchases.map((purchase: any) => (
                  <div key={purchase._id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{purchase.mockTest?.title || 'Unknown Test'}</p>
                      <p className="text-xs text-slate-500">{format(new Date(purchase.purchaseDate), 'MMM dd, yyyy hh:mm a')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{(purchase.amountPaid || 0).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${purchase.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              {attempts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No exam attempts found.</p>
              ) : (
                attempts.map((attempt: any) => (
                  <div key={attempt._id} className="p-4 border border-slate-200 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{attempt.mockTest?.title || 'Unknown Test'}</p>
                        <p className="text-xs text-slate-500">{format(new Date(attempt.startedAt), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">{attempt.score} pts</p>
                        <p className="text-xs text-slate-500">{attempt.percentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-2 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> {attempt.correct}</span>
                      <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> {attempt.wrong}</span>
                      <span className="flex items-center gap-1 text-slate-400"><AlertCircle className="w-4 h-4" /> {attempt.skipped}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-8">
              {/* Reset Password */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Reset Password</h4>
                    <p className="text-xs text-slate-500">Manually set a new password for this user.</p>
                  </div>
                </div>
                <form onSubmit={handleResetPassword} className="flex gap-2">
                  <Input 
                    type="text" 
                    placeholder="New password (min 8 chars)" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="primary" disabled={resetPasswordMutation.isPending}>
                    {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset'}
                  </Button>
                </form>
              </div>

              {/* Grant Mock Test */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Grant Mock Test</h4>
                    <p className="text-xs text-slate-500">Give free access to a specific mock test.</p>
                  </div>
                </div>
                <form onSubmit={handleGrantMockTest} className="flex gap-2">
                  <Input 
                    type="text" 
                    placeholder="Mock Test Object ID" 
                    value={mockTestId}
                    onChange={(e) => setMockTestId(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="primary" disabled={grantMockTestMutation.isPending}>
                    {grantMockTestMutation.isPending ? 'Granting...' : 'Grant'}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800">Student Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

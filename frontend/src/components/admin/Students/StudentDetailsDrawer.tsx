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
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
          <p>Loading student details...</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Student not found</p>
        </div>
      );
    }

    const { student, stats, purchases, attempts } = data;

    return (
      <div className="flex-1 overflow-y-auto">
        {/* Header Profile Section */}
        <div className="p-6 bg-muted border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl flex-shrink-0">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{student.fullName}</h2>
              <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                <Mail className="w-4 h-4" /> {student.email}
              </p>
              {student.phone && (
                <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                  <Phone className="w-4 h-4" /> {student.phone}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 border-b border-border">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('purchases')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchases' ? 'border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
            >
              Purchases
            </button>
            <button 
              onClick={() => setActiveTab('performance')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
            >
              Performance
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'actions' ? 'border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
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
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Registration Date</p>
                  <p className="font-semibold text-foreground">{format(new Date(student.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.isActive ? 'bg-success-light text-green-800' : 'bg-destructive-light text-red-800'}`}>
                    {student.isActive ? 'Active' : 'Blocked'}
                  </span>
                </div>
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
                  <p className="font-semibold text-foreground">{stats.totalPurchases}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="font-semibold text-foreground">₹{(stats.totalAmountSpent || 0).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Exam Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Exams Attempted</p>
                      <p className="font-bold text-foreground">{stats.examsAttempted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center text-success">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                      <p className="font-bold text-foreground">{Math.round(stats.accuracy)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-4">
              {purchases.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No purchases found.</p>
              ) : (
                purchases.map((purchase: any) => (
                  <div key={purchase._id} className="p-4 border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{purchase.mockTest?.title || 'Unknown Test'}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(purchase.purchaseDate), 'MMM dd, yyyy hh:mm a')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{(purchase.amountPaid || 0).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${purchase.status === 'completed' ? 'bg-success-light text-success' : 'bg-destructive-light text-destructive'}`}>
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
                <p className="text-muted-foreground text-center py-8">No exam attempts found.</p>
              ) : (
                attempts.map((attempt: any) => (
                  <div key={attempt._id} className="p-4 border border-border rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{attempt.mockTest?.title || 'Unknown Test'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(attempt.startedAt), 'MMM dd, yyyy hh:mm a')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">{attempt.score} pts</p>
                        <p className="text-xs text-muted-foreground">{attempt.percentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-2 pt-2 border-t border-border">
                      <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-4 h-4" /> {attempt.correct}</span>
                      <span className="flex items-center gap-1 text-destructive"><XCircle className="w-4 h-4" /> {attempt.wrong}</span>
                      <span className="flex items-center gap-1 text-muted-foreground"><AlertCircle className="w-4 h-4" /> {attempt.skipped}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-8">
              {/* Reset Password */}
              <div className="bg-muted p-5 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-warning-light text-warning rounded-lg">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Reset Password</h4>
                    <p className="text-xs text-muted-foreground">Manually set a new password for this user.</p>
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
              <div className="bg-muted p-5 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Grant Mock Test</h4>
                    <p className="text-xs text-muted-foreground">Give free access to a specific mock test.</p>
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
        <div className="flex items-center justify-between p-4 border-b border-border bg-white">
          <h2 className="text-lg font-bold text-foreground">Student Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

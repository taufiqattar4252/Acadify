import React from 'react';
import { Button } from '@/components/ui/Button';
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface SubmitConfirmationModalProps {
  stats: {
    answered: number;
    notAnswered: number;
    notVisited: number;
    marked: number;
    answeredMarked: number;
  };
  totalQuestions: number;
  timeRemaining: number;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function SubmitConfirmationModal({
  stats,
  totalQuestions,
  timeRemaining,
  onConfirm,
  onCancel,
  isSubmitting
}: SubmitConfirmationModalProps) {
  
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const totalAttempted = stats.answered + stats.answeredMarked;
  const remainingQuestions = totalQuestions - totalAttempted;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#00BC7D] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            Submit Exam?
          </h2>
          {!isSubmitting && (
            <button onClick={onCancel} className="text-muted-foreground hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-6 text-center">
            You are about to submit your exam. Please review your attempt summary below before final submission.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatBox label="Total Questions" value={totalQuestions} color="bg-muted text-foreground" />
            <StatBox label="Time Remaining" value={formatTime(timeRemaining)} color="bg-primary-light text-primary" isBold />
            <StatBox label="Answered" value={stats.answered} color="bg-[#4ca64c]/10 text-[#4ca64c]" />
            <StatBox label="Not Answered" value={stats.notAnswered} color="bg-[#ff3300]/10 text-[#ff3300]" />
            <StatBox label="Marked for Review" value={stats.marked} color="bg-[#6b52ae]/10 text-[#6b52ae]" />
            <StatBox label="Answered & Marked" value={stats.answeredMarked} color="bg-[#6b52ae]/10 text-[#6b52ae]" />
          </div>

          {/* Warning */}
          <div className="bg-warning-light border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-bold text-sm">Are you sure you want to submit?</p>
              <p className="text-warning/80 text-xs mt-1 font-medium">You will not be able to modify your answers or return to the exam after submission.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-muted border-t border-border flex items-center justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-white hover:bg-muted text-muted-foreground border-border"
          >
            Cancel & Return
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" /> Submitting...
              </span>
            ) : 'Yes, Submit Exam'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, isBold }: { label: string, value: string | number, color: string, isBold?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border border-black/5 ${color} flex flex-col justify-between items-center text-center`}>
      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1">{label}</span>
      <span className={`text-xl ${isBold ? 'font-black' : 'font-bold'}`}>{value}</span>
    </div>
  );
}

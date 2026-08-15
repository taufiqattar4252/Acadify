'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetExamSession, useSubmitExam } from '@/services/examApi';
import { useUser } from '@/services/authApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useExam, useAnswers, useQuestionNavigation, QuestionStatus } from '@/hooks/useExam';
import { CheckCircle2 } from 'lucide-react';

// New Components
import { ExamSummary } from '@/components/exam/ExamSummary';
import { ExamInstructions } from '@/components/exam/ExamInstructions';
import { ExamLayout } from '@/components/exam/ExamLayout';
import { SubmitConfirmationModal } from '@/components/exam/SubmitConfirmationModal';

export default function ExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: userData } = useUser();
  const { data: examData, isLoading: isExamDataLoading, isError, error } = useGetExamSession(sessionId);

  const duration = examData?.duration || 120;
  const questions = examData?.questions || [];

  // New State: Exam Stage
  const [stage, setStage] = useState<'summary' | 'instructions' | 'exam'>('summary');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Initialize Exam Hooks
  const { examState, syncState, clearState, isReady, isTimeUp } = useExam(sessionId, questions, duration, stage === 'exam');

  const currentQuestionId = questions[examState.currentIndex]?._id || '';
  const { handleSelectOption, handleClearResponse, handleToggleMark } = useAnswers(examState, syncState, currentQuestionId);
  const { goToQuestion, handleNext, handlePrev } = useQuestionNavigation(examState, syncState, questions);

  const submitExamMutation = useSubmitExam();

  const handleSubmit = async (isAutoSubmit = false) => {
    try {
      const payload = {
        sessionId,
        answers: examState.answers
      };
      await submitExamMutation.mutateAsync(payload);
      clearState();
      if (!isAutoSubmit) {
        setShowSubmitModal(false);
      }
      alert('Exam is submitted successfully');
      (window as any).isExamSubmitting = true;
      window.close();
      // Fallback if window.close is blocked
      router.push('/dashboard/mock-tests');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit exam');
      if (isAutoSubmit) {
        (window as any).isExamSubmitting = true;
        window.close();
        router.push('/dashboard/mock-tests');
      }
    }
  };

  // Auto Submit Effect
  useEffect(() => {
    // Only auto-submit if the timer runs out AND we are actually taking the exam.
    // If the timer is up but we are in summary, we shouldn't let them start anyway, or just submit.
    if (isTimeUp && isReady && !submitExamMutation.isPending && stage === 'exam') {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeUp, isReady, stage]);

  // Prevent accidental navigation
  useEffect(() => {
    if (stage !== 'exam') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((window as any).isExamSubmitting) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [stage]);

  // Keyboard Shortcuts (Only active during exam)
  useEffect(() => {
    if (!isReady || stage !== 'exam') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, examState.currentIndex, isReady, handleNext, handlePrev]);

  if (isExamDataLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Spinner size="xl" />
        <p className="mt-4 text-slate-500 font-medium animate-pulse">
          {!isReady ? 'Restoring exam session...' : 'Loading exam environment...'}
        </p>
      </div>
    );
  }

  if (isError || !examData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Exam</h2>
          <p className="text-slate-500 mb-6">
            {(error as any)?.response?.data?.message || 'We could not load your exam session.'}
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If time was already up before they even entered the exam view (e.g. they refreshed)
  // or if they ran out of time
  if (isTimeUp && stage === 'exam') {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Time's Up!</h2>
          <p className="text-slate-500 mb-6">
            Your exam duration has ended. We are automatically submitting your answers.
          </p>
          <div className="flex justify-center">
            <Spinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  const { statuses, timeRemaining } = examState;
  const studentName = userData?.fullName || 'Student';

  // Calculate stats for Summary Modal and Palette
  const stats = {
    answered: 0,
    marked: 0,
    answeredMarked: 0,
    notVisited: 0,
    notAnswered: 0,
  };

  Object.values(statuses).forEach((status: QuestionStatus) => {
    if (status === 'Answered') stats.answered++;
    else if (status === 'Marked for Review') stats.marked++;
    else if (status === 'Answered & Marked') stats.answeredMarked++;
    else if (status === 'Not Visited') stats.notVisited++;
    else if (status === 'Visited') stats.notAnswered++;
  });

  // Flow Controller
  return (
    <>
      {stage === 'summary' && (
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          <ExamSummary
            examData={examData}
            studentName={studentName}
            onContinue={() => setStage('instructions')}
          />
        </div>
      )}

      {stage === 'instructions' && (
        <div className="animate-in fade-in duration-500 slide-in-from-right-8">
          <ExamInstructions
            examData={examData}
            studentName={studentName}
            onReady={() => {
              try {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen();
                }
              } catch (e) {
                console.error("Fullscreen request failed", e);
              }
              setStage('exam');
            }}
          />
        </div>
      )}

      {stage === 'exam' && (
        <div className="animate-in fade-in zoom-in-95 duration-500 h-screen w-full">
          <ExamLayout
            examName="MHT-CET Mock Test"
            studentName={studentName}
            questions={questions}
            examState={examState}
            stats={stats}
            onSubmitClick={() => setShowSubmitModal(true)}
            goToQuestion={goToQuestion}
            handleNext={handleNext}
            handlePrev={handlePrev}
            handleSelectOption={handleSelectOption}
            handleClearResponse={handleClearResponse}
            handleToggleMark={handleToggleMark}
          />
        </div>
      )}

      {showSubmitModal && (
        <SubmitConfirmationModal
          stats={stats}
          totalQuestions={questions.length}
          timeRemaining={timeRemaining}
          onConfirm={() => handleSubmit(false)}
          onCancel={() => setShowSubmitModal(false)}
          isSubmitting={submitExamMutation.isPending}
        />
      )}
    </>
  );
}

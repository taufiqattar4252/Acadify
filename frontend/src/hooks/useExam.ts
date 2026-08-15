import { useState, useEffect, useCallback, useRef } from 'react';

export type QuestionStatus = 'Not Visited' | 'Visited' | 'Answered' | 'Marked for Review' | 'Answered & Marked';

export interface ExamState {
  sessionId: string;
  currentIndex: number;
  answers: Record<string, string>; // { questionId: optionId }
  statuses: Record<string, QuestionStatus>;
  timeRemaining: number;
  lastUpdated: number;
}

// Storage Hook
export const useExamStorage = (sessionId: string) => {
  const getStorageKey = useCallback(() => `exam_${sessionId}`, [sessionId]);

  const saveState = useCallback((state: ExamState) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save exam state', e);
    }
  }, [getStorageKey]);

  const loadState = useCallback((): ExamState | null => {
    try {
      const data = localStorage.getItem(getStorageKey());
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load exam state', e);
    }
    return null;
  }, [getStorageKey]);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (e) {
      console.error('Failed to clear exam state', e);
    }
  }, [getStorageKey]);

  return { saveState, loadState, clearState };
};

// Main Exam Hook
export const useExam = (sessionId: string, initialQuestions: any[], durationMinutes: number, isTimerActive: boolean = false) => {
  const { saveState, loadState, clearState } = useExamStorage(sessionId);
  const isInitialized = useRef(false);

  const [examState, setExamState] = useState<ExamState>({
    sessionId,
    currentIndex: 0,
    answers: {},
    statuses: {},
    timeRemaining: durationMinutes * 60,
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    if (isInitialized.current) return;
    
    if (!initialQuestions || initialQuestions.length === 0) return;
    
    isInitialized.current = true;

    const savedState = loadState();
    if (savedState) {
      setExamState(savedState);
    } else {
      // Initialize fresh
      const initialStatuses: Record<string, QuestionStatus> = {};
      initialQuestions.forEach((q, index) => {
        initialStatuses[q._id] = index === 0 ? 'Visited' : 'Not Visited';
      });

      const freshState = {
        sessionId,
        currentIndex: 0,
        answers: {},
        statuses: initialStatuses,
        timeRemaining: durationMinutes * 60,
        lastUpdated: Date.now(),
      };
      setExamState(freshState);
      saveState(freshState);
    }
  }, [sessionId, initialQuestions, durationMinutes, loadState, saveState]);

  // Auto-save effect
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const interval = setInterval(() => {
      setExamState(prev => {
        const newState = { ...prev, lastUpdated: Date.now() };
        saveState(newState);
        return newState;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [saveState]);

  // Timer effect
  useEffect(() => {
    if (!isInitialized.current || !isTimerActive) return;

    const timer = setInterval(() => {
      setExamState(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(timer);
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive]);

  // Sync back state changes immediately to storage
  const syncState = useCallback((updater: ExamState | ((prev: ExamState) => ExamState)) => {
    setExamState(prev => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      saveState(nextState);
      return nextState;
    });
  }, [saveState]);

  return { 
    examState, 
    syncState, 
    clearState, 
    isReady: isInitialized.current,
    isTimeUp: examState.timeRemaining <= 0
  };
};

// Answers Hook
export const useAnswers = (
  examState: ExamState, 
  syncState: (updater: ExamState | ((prev: ExamState) => ExamState)) => void,
  currentQuestionId: string
) => {
  
  const handleSelectOption = useCallback((optionId: string) => {
    if (!currentQuestionId) return;

    syncState(prev => {
      const newAnswers = { ...prev.answers, [currentQuestionId]: optionId };
      
      let newStatus = prev.statuses[currentQuestionId];
      if (newStatus === 'Marked for Review' || newStatus === 'Answered & Marked') {
        newStatus = 'Answered & Marked';
      } else {
        newStatus = 'Answered';
      }

      const newStatuses = { ...prev.statuses, [currentQuestionId]: newStatus };
      
      return {
        ...prev,
        answers: newAnswers,
        statuses: newStatuses,
        lastUpdated: Date.now()
      };
    });
  }, [syncState, currentQuestionId]);

  const handleClearResponse = useCallback(() => {
    if (!currentQuestionId) return;

    syncState(prev => {
      const newAnswers = { ...prev.answers };
      delete newAnswers[currentQuestionId];

      let newStatus = prev.statuses[currentQuestionId];
      if (newStatus === 'Answered & Marked' || newStatus === 'Marked for Review') {
        newStatus = 'Marked for Review';
      } else {
        newStatus = 'Visited';
      }

      const newStatuses = { ...prev.statuses, [currentQuestionId]: newStatus };

      return {
        ...prev,
        answers: newAnswers,
        statuses: newStatuses,
        lastUpdated: Date.now()
      };
    });
  }, [syncState, currentQuestionId]);

  const handleToggleMark = useCallback(() => {
    if (!currentQuestionId) return;

    syncState(prev => {
      let newStatus = prev.statuses[currentQuestionId] || 'Visited';
      
      if (newStatus === 'Answered') newStatus = 'Answered & Marked';
      else if (newStatus === 'Visited') newStatus = 'Marked for Review';
      else if (newStatus === 'Answered & Marked') newStatus = 'Answered';
      else if (newStatus === 'Marked for Review') newStatus = 'Visited';

      const newStatuses = { ...prev.statuses, [currentQuestionId]: newStatus };

      return {
        ...prev,
        statuses: newStatuses,
        lastUpdated: Date.now()
      };
    });
  }, [syncState, currentQuestionId]);

  return { handleSelectOption, handleClearResponse, handleToggleMark };
};

// Navigation Hook
export const useQuestionNavigation = (
  examState: ExamState,
  syncState: (updater: ExamState | ((prev: ExamState) => ExamState)) => void,
  questions: any[]
) => {
  const goToQuestion = useCallback((index: number) => {
    if (!questions || index < 0 || index >= questions.length) return;

    const newQId = questions[index]._id;

    syncState(prev => {
      // Status transition for new question
      const newStatuses = { ...prev.statuses };
      if (newStatuses[newQId] === 'Not Visited' || !newStatuses[newQId]) {
        newStatuses[newQId] = 'Visited';
      }

      return {
        ...prev,
        currentIndex: index,
        statuses: newStatuses,
        lastUpdated: Date.now()
      };
    });
  }, [syncState, questions]);

  const handleNext = useCallback(() => {
    if (questions && examState.currentIndex < questions.length - 1) {
      goToQuestion(examState.currentIndex + 1);
    }
  }, [examState, questions, goToQuestion]);

  const handlePrev = useCallback(() => {
    if (questions && examState.currentIndex > 0) {
      goToQuestion(examState.currentIndex - 1);
    }
  }, [examState, questions, goToQuestion]);

  return { goToQuestion, handleNext, handlePrev };
};

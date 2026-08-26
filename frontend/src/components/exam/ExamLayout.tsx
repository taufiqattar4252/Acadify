import React, { useState, useEffect } from 'react';
import { IExamQuestion, IQuestionOption } from '@/services/examApi';
import { ExamState, QuestionStatus } from '@/hooks/useExam';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface ExamLayoutProps {
  examName: string;
  studentName: string;
  questions: IExamQuestion[];
  examState: ExamState;
  stats: any;
  onSubmitClick: () => void;
  // Navigation hooks
  goToQuestion: (index: number) => void;
  handleNext: () => void;
  handlePrev: () => void;
  // Answer hooks
  handleSelectOption: (optionId: string) => void;
  handleClearResponse: () => void;
  handleToggleMark: () => void;
}

export function ExamLayout({
  examName, studentName, questions, examState, stats, onSubmitClick,
  goToQuestion, handleNext, handlePrev,
  handleSelectOption, handleClearResponse, handleToggleMark
}: ExamLayoutProps) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const { currentIndex, statuses, answers, timeRemaining } = examState;
  const currentQuestion = questions[currentIndex];

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Deduced Sections Logic (MHT-CET format)
  const sections = [
    { name: 'Physics', start: 0, end: 49 },
    { name: 'Chemistry', start: 50, end: 99 },
    { name: 'Mathematics', start: 100, end: 149 }
  ];

  const safeSections = sections.map(s => ({
    ...s,
    end: Math.min(s.end, questions.length - 1)
  })).filter(s => s.start <= s.end);

  const currentSection = safeSections.find(s => currentIndex >= s.start && currentIndex <= s.end)?.name || 'General';

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'Answered': return 'bg-[#4ca64c] text-white border-transparent';
      case 'Visited': return 'bg-[#ff3300] text-white border-transparent'; // Not Answered
      case 'Marked for Review': return 'bg-[#6b52ae] text-white border-transparent !rounded-full';
      case 'Answered & Marked': return 'bg-[#6b52ae] text-white border-transparent !rounded-full';
      default: return 'bg-[#e5e5e5] text-[#333] border-transparent'; // Not Visited
    }
  };

  // Keep a timer for "Time/Que"
  const [questionTime, setQuestionTime] = useState(0);
  useEffect(() => {
    setQuestionTime(0); // Reset when question changes
    const interval = setInterval(() => {
      setQuestionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const SummaryRow = ({ label, value, color, isCircle, hasGreenTick }: any) => (
    <div className="flex items-center justify-between px-4 py-2 text-[12px]">
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 ${color} ${isCircle ? 'rounded-full' : 'rounded-sm'} border border-border ${hasGreenTick ? 'relative flex items-center justify-center' : ''}`}>
          {hasGreenTick && <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />}
        </div>
        <span className="font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );

  return (
    <div className="h-screen flex flex-col font-sans bg-white overflow-hidden text-sm">
      
      {/* HEADER exactly like reference */}
      <header className="bg-[#00BC7D] text-white px-4 py-2 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="font-bold flex items-center gap-2">
          <span>Name : {studentName}</span>
        </div>
        <div className="font-bold flex items-center gap-4 text-sm">
          <span>Date : {todayDate}</span>
          <span>Remaining Time : {formatTime(timeRemaining)}</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-[300px] border-r border-border flex flex-col bg-white shrink-0">
          {/* Sidebar Header */}
          <div className="bg-[#00BC7D] text-white px-4 py-2 font-bold text-[13px]">
            Section {currentSection}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-muted">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const status = statuses[q._id] || 'Not Visited';
                const isCurrent = idx === currentIndex;
                
                return (
                  <div key={q._id} className="relative h-9 w-9 mx-auto">
                    <button
                      onClick={() => goToQuestion(idx)}
                      className={`
                        w-full h-full rounded flex items-center justify-center font-bold text-[13px] shadow-sm relative
                        ${getStatusColor(status)}
                        ${isCurrent ? 'ring-2 ring-offset-1 ring-[#00BC7D]' : 'border border-border'}
                      `}
                    >
                      {idx + 1}
                    </button>
                    {status === 'Answered & Marked' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00e676] rounded-full flex items-center justify-center pointer-events-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white border-t border-border">
            <div className="bg-[#00BC7D] text-white text-center font-bold py-1.5 text-xs">
              Summary
            </div>
            <div className="divide-y divide-slate-200">
              <SummaryRow label="Answered" value={stats.answered} color="bg-[#4ca64c]" />
              <SummaryRow label="Not Answered" value={stats.notAnswered} color="bg-[#ff3300]" />
              <SummaryRow label="Not Visited" value={stats.notVisited} color="bg-[#e5e5e5] text-foreground" />
              <SummaryRow label="Marked for Review" value={stats.marked} color="bg-[#6b52ae]" isCircle />
              <SummaryRow label="Answered & Marked for Review" value={stats.answeredMarked} color="bg-[#6b52ae]" isCircle hasGreenTick />
            </div>
          </div>
        </aside>

        {/* QUESTION AREA (RIGHT) */}
        <main className="flex-1 flex flex-col bg-white min-w-0">
          
          {/* Top Toolbar */}
          <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-white text-[13px]">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground">
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer"
                checked={statuses[currentQuestion._id]?.includes('Marked')}
                onChange={handleToggleMark}
              />
              Mark for Review
            </label>

            <div className="text-muted-foreground font-medium">
              Time/Que : <span className="font-bold">{questionTime} Sec</span> (For Mock Test purpose only)
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Zoom</span>
                <select 
                  className="border border-border rounded px-1 py-0.5 bg-white text-[13px]"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                >
                  <option value="80">80%</option>
                  <option value="100">100%</option>
                  <option value="120">120%</option>
                  <option value="150">150%</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Section</span>
                <select 
                  className="border border-border rounded px-1 py-0.5 bg-white text-[13px] font-bold"
                  value={currentSection}
                  onChange={(e) => {
                    const sec = safeSections.find(s => s.name === e.target.value);
                    if (sec) goToQuestion(sec.start);
                  }}
                >
                  {safeSections.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ fontSize: `${zoomLevel}%` }}>
            <div className="font-bold text-foreground mb-4 border-b border-border pb-2 inline-block">
              Question {currentIndex + 1} of {questions.length} :
            </div>
            
            <div className="prose prose-slate max-w-none text-foreground font-medium">
              <p className="whitespace-pre-wrap">{currentQuestion.questionText}</p>
              {currentQuestion.questionImage && (
                <div className="my-4">
                  <Image 
                    src={currentQuestion.questionImage} 
                    alt="Question" 
                    width={600} 
                    height={400} 
                    className="max-w-full h-auto"
                  />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((opt: IQuestionOption) => {
                const isSelected = answers[currentQuestion._id] === opt._id;
                return (
                  <label key={opt._id} className="flex items-start gap-3 cursor-pointer p-1">
                    <input 
                      type="radio" 
                      name={`question-${currentQuestion._id}`}
                      value={opt._id}
                      checked={isSelected}
                      onChange={() => handleSelectOption(opt._id)}
                      className="mt-1 w-4 h-4 cursor-pointer text-[#00BC7D]" 
                    />
                    <div className="flex-1 text-foreground">
                      {opt.text}
                      {opt.image && (
                        <div className="mt-2">
                          <Image src={opt.image} alt="Option" width={300} height={200} className="max-w-full h-auto" />
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted shrink-0">
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={handleClearResponse}
                className="bg-white text-muted-foreground border-border font-bold px-6"
              >
                Reset Answer
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  if (!statuses[currentQuestion._id]?.includes('Marked')) {
                    handleToggleMark();
                  }
                  handleNext();
                }}
                className="bg-white text-muted-foreground border-border font-bold px-6"
              >
                Mark for Review & Next
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="bg-white text-muted-foreground border-border font-bold px-8"
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                className="bg-[#00BC7D] hover:bg-[#00a36c] text-white font-bold px-8"
              >
                Save & Next
              </Button>

              <Button 
                onClick={onSubmitClick}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 ml-4"
              >
                Submit
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color, isCircle, hasGreenTick }: { label: string; value: number; color: string; isCircle?: boolean; hasGreenTick?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white hover:bg-muted">
      <span className="font-bold text-muted-foreground text-[12px]">{label}</span>
      <div className={`
        flex items-center justify-center font-bold text-white text-[12px] w-7 h-7 relative
        ${color}
        ${isCircle ? 'rounded-full' : 'rounded'}
      `}>
        {value}
        {hasGreenTick && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border border-white">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        )}
      </div>
    </div>
  );
}

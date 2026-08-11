import React from 'react';
import { Button } from '@/components/ui/Button';
import { IExamData } from '@/services/examApi';
import { Info, AlertCircle } from 'lucide-react';

interface ExamSummaryProps {
  examData: IExamData;
  studentName: string;
  onContinue: () => void;
}

export function ExamSummary({ examData, studentName, onContinue }: ExamSummaryProps) {
  // We will deduce some information based on standard MHT-CET format
  // or use safe defaults
  const examName = "MHT-CET Mock Test";
  const duration = examData.duration; // in minutes
  const totalQuestions = examData.questions?.length || 150;

  // Calculate total marks by summing positive marks of all questions
  const totalMarks = examData.questions?.reduce((acc, q) => acc + (q.positiveMarks || 1), 0) || 200;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-[#00BC7D] p-6 md:p-8 text-white text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{examName}</h1>
          <p className="text-white/80 font-medium text-lg">Exam Summary</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoRow label="Student Name" value={studentName} />
              <InfoRow label="Exam Duration" value={`${duration} Minutes`} />
              <InfoRow label="Maximum Marks" value={totalMarks.toString()} />
              <InfoRow label="Total Questions" value={totalQuestions.toString()} />
            </div>
            <div className="space-y-4">
              <InfoRow label="Subjects Included" value="Physics, Chemistry, Mathematics" />
              <InfoRow label="Negative Marking" value="None" />
              <InfoRow label="Language" value="English" />
              <InfoRow label="Attempt Type" value="Online Mock Test" />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Question Distribution */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#00BC7D]" />
              Question Distribution (MHT-CET Pattern)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DistributionCard subject="Physics" count="50 Questions" marks="50 Marks" />
              <DistributionCard subject="Chemistry" count="50 Questions" marks="50 Marks" />
              <DistributionCard subject="Mathematics" count="50 Questions" marks="100 Marks" />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Legend */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Question Status Legend</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-sm">
              <LegendItem status="Answered" className="bg-[#4ca64c] text-white rounded" />
              <LegendItem status="Not Answered" className="bg-[#ff3300] text-white rounded" />
              <LegendItem status="Not Visited" className="bg-[#e5e5e5] text-slate-800 rounded" />
              <LegendItem status="Marked for Review" className="bg-[#6b52ae] text-white !rounded-full" />
              <LegendItem 
                status="Answered & Marked" 
                className="bg-[#6b52ae] text-white !rounded-full" 
                isAnsweredMarked={true}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Important Instructions */}
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Important Instructions
            </h3>
            <ul className="list-disc list-outside ml-5 space-y-2 text-blue-800 font-medium">
              <li>Exam will automatically submit when time ends.</li>
              <li>Internet disconnection will not stop the timer. Your responses are auto-saved.</li>
              <li>You cannot restart the exam once submitted.</li>
              <li>Ensure you have a stable internet connection throughout the test.</li>
            </ul>
          </div>

          {/* Action */}
          <div className="flex justify-end pt-4">
            <Button className="w-full sm:w-auto px-12 !bg-[#00BC7D] !text-white hover:!bg-[#00a36c] !border-none" onClick={onContinue}>
              Continue
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 font-semibold text-right">{value}</span>
    </div>
  );
}

function DistributionCard({ subject, count, marks }: { subject: string; count: string; marks: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <h4 className="font-bold text-slate-800 mb-1">{subject}</h4>
      <p className="text-sm text-slate-500">{count}</p>
      <p className="text-sm font-medium text-[#00BC7D]">{marks}</p>
    </div>
  );
}

function LegendItem({ status, className, isAnsweredMarked }: { status: string; className: string; isAnsweredMarked?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-7 h-7">
        <span className={`w-7 h-7 flex items-center justify-center font-bold text-xs shadow-sm ${className}`}>1</span>
        {isAnsweredMarked && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00e676] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        )}
      </div>
      <span className="text-slate-600 font-medium leading-tight">{status}</span>
    </div>
  );
}

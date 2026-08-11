import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IExamData } from '@/services/examApi';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ExamInstructionsProps {
  examData: IExamData;
  studentName: string;
  onReady: () => void;
}

export function ExamInstructions({ examData, studentName, onReady }: ExamInstructionsProps) {
  const [isChecked, setIsChecked] = useState(false);
  const duration = examData.duration;
  const totalMarks = examData.questions?.reduce((acc, q) => acc + (q.positiveMarks || 1), 0) || 200;

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-4rem)]">

        {/* Header - Candidate Details */}
        <div className="bg-[#00BC7D] text-white p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm sticky top-0 z-10 shrink-0">
          <div>
            <p className="text-white font-medium">Candidate Name</p>
            <p className="font-bold">{studentName}</p>
          </div>
          <div>
            <p className="text-white font-medium">Exam Date</p>
            <p className="font-bold">{todayDate}</p>
          </div>
          <div>
            <p className="text-white font-medium">Exam Duration</p>
            <p className="font-bold">{duration} Minutes</p>
          </div>
          <div>
            <p className="text-white font-medium">Maximum Marks</p>
            <p className="font-bold">{totalMarks}</p>
          </div>
        </div>

        {/* Instructions Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Exam Instructions</h2>

          <div className="prose prose-slate max-w-none text-slate-700">
            <h3 className="font-bold text-lg text-slate-900">About Question Paper:</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>There are in all 150 Questions for this exam, <strong>Physics</strong> - 50 Questions (1 mark for each question), <strong>Chemistry</strong> - 50 Questions (1 mark for each question), <strong>Mathematics</strong> - 50 Questions (2 mark for each question).</li>
              <li>You will be given {duration} minutes to answer all questions.</li>
              <li><strong>There is no negative marking system for this test.</strong></li>
              <li>Questions will be in one language (English) only.</li>
              <li>The test will comprise of multiple choice objective type questions (Four Options).</li>
            </ul>

            <h3 className="font-bold text-lg text-slate-900">About answering the questions:</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>The candidates are requested to follow the instructions carefully. If any candidate does not follow the instructions / rules, it would be treated as a case of misconduct / adoption of unfair means.</li>
              <li>To answer a question, candidate must 'Mouse-click' the circle besides the alternative he/she feels appropriate/correct and then Click on any of the navigation buttons i.e. 'Next' OR 'Previous'. The clicked alternative/option shall be treated as the answer given by the candidate for the question.</li>
              <li>You can choose to deselect the already indicated answer by clicking the "Clear Response" button.</li>
              <li>You may <strong>Mark for Review</strong> questions which you would want to reconfirm later.</li>
              <li>In case of power failure or Loss of internet connection, the candidate's responses are saved up to last successful click and stored in databases. When candidate logs in again, test will resume from the same stage.</li>
            </ul>

            {/* Warnings */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
              <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                <AlertTriangle className="w-5 h-5" /> Important Warnings
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-amber-900 text-sm font-medium">
                <li>Do NOT refresh the browser window during the exam.</li>
                <li>Do NOT try to log in from multiple tabs or devices simultaneously.</li>
                <li>The exam will automatically submit when the timer ends.</li>
              </ul>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mb-4">Navigation Buttons Legend</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-w-2xl mb-8">
              <div className="bg-[#00BC7D] text-white font-bold p-3 text-center">
                Navigation Buttons
              </div>
              <div className="grid grid-cols-1 divide-y divide-slate-100">
                <LegendRow icon={<span className="w-8 h-8 rounded bg-[#4ca64c] text-white flex items-center justify-center font-bold">1</span>} text="Answered" />
                <LegendRow icon={<span className="w-8 h-8 rounded bg-[#ff3300] text-white flex items-center justify-center font-bold">2</span>} text="Not Answered" />
                <LegendRow icon={<span className="w-8 h-8 rounded bg-[#e5e5e5] text-[#333] flex items-center justify-center font-bold">3</span>} text="Not Visited" />
                <LegendRow icon={<span className="w-8 h-8 rounded-full bg-[#6b52ae] text-white flex items-center justify-center font-bold">4</span>} text="Marked for Review" />
                <LegendRow icon={
                  <div className="relative w-8 h-8">
                    <span className="w-8 h-8 rounded-full bg-[#6b52ae] text-white flex items-center justify-center font-bold">5</span>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00e676] rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  </div>
                } text="Answered & Marked for Review (Will be evaluated)" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <label className="flex items-start md:items-center gap-3 cursor-pointer group">
            <div className={`mt-0.5 md:mt-0 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-[#00BC7D] border-[#00BC7D]' : 'border-slate-400 group-hover:border-[#00BC7D]'}`}>
              {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <span className="text-sm font-bold text-red-600 select-none">
              I have read and accept the disclaimer, terms and conditions and understood the instructions given above.
            </span>
          </label>

          <Button
            className={`w-full md:w-auto px-8 !bg-[#00BC7D] hover:!bg-[#00a36c] !text-white transition-all duration-300 ${!isChecked ? 'opacity-50 cursor-not-allowed grayscale' : 'shadow-md'}`}
            disabled={!isChecked}
            onClick={() => isChecked && onReady()}
          >
            I am ready to begin
          </Button>
        </div>

      </div>
    </div>
  );
}

function LegendRow({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white hover:bg-slate-50">
      <div className="shrink-0">{icon}</div>
      <span className="font-medium text-slate-700">{text}</span>
    </div>
  );
}

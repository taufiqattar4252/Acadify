'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetAttemptDetails } from '@/services/resultApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
   ChevronLeft, ChevronRight, Printer, Download, Trophy, Target, Clock,
   BarChart2, CheckCircle2, XCircle, MinusCircle, Users, Award, Eye
} from 'lucide-react';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   PieChart, Pie, Cell
} from 'recharts';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export default function AttemptDetailsPage() {
   const params = useParams();
   const attemptId = params.attemptId as string;
   const router = useRouter();

   const { data: result, isLoading, isError } = useGetAttemptDetails(attemptId);
   const [reviewFilter, setReviewFilter] = useState<string>('all');
   const [subjectFilter, setSubjectFilter] = useState<string>('All');
   const [reviewPage, setReviewPage] = useState<number>(1);
   const [chapterPage, setChapterPage] = useState<number>(1);
   const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
   const [isDownloading, setIsDownloading] = useState(false);
   const pdfContainerRef = useRef<HTMLDivElement>(null);
   const page1Ref = useRef<HTMLDivElement>(null);
   const page2Ref = useRef<HTMLDivElement>(null);
   const questionsPerPage = 5;
   const chaptersPerPage = 5;

   const handleDownloadReport = async () => {
      if (!page1Ref.current || !page2Ref.current || !pdfContainerRef.current) return;
      setIsDownloading(true);

      const p1 = page1Ref.current;
      const p2 = page2Ref.current;
      const container = pdfContainerRef.current;

      try {
         // Show container offscreen so html2canvas can measure and paint it
         container.style.display = 'block';
         container.style.position = 'fixed';
         container.style.left = '-10000px';
         container.style.top = '0';
         container.style.zIndex = '-9999';

         await new Promise((resolve) => setTimeout(resolve, 200));

         const opts = {
            scale: 2, // 2x gives 1600x2264 - super crisp text & clean lines
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 800,
            height: 1132,
         };

         const canvas1 = await html2canvas(p1, opts);
         const canvas2 = await html2canvas(p2, opts);

         container.style.display = 'none';

         const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
         });

         // Exact full-bleed 210 x 297 mm A4
         pdf.addImage(canvas1.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
         pdf.addPage();
         pdf.addImage(canvas2.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

         const cleanTitle = (summary?.mockTestTitle || 'Report')
            .replace(/[^a-zA-Z0-9_\- ]/g, '')
            .trim()
            .replace(/\s+/g, '_');

         pdf.save(`Acadify_Report_${cleanTitle}.pdf`);
      } catch (error) {
         console.error('Error generating PDF report:', error);
      } finally {
         setIsDownloading(false);
      }
   };

   if (isLoading) {
      return (
         <div className="flex justify-center items-center h-[80vh]">
            <Spinner size="xl" />
            <p className="ml-4 text-muted-foreground font-medium">Crunching your performance data...</p>
         </div>
      );
   }

   if (isError || !result) {
      return (
         <div className="bg-destructive-light text-destructive p-6 rounded-xl border border-red-200 text-center">
            <h2 className="text-xl font-bold mb-2">Result Not Found</h2>
            <p>We couldn&apos;t load the details for this attempt.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard/results')}>Go Back</Button>
         </div>
      );
   }

   const { summary, analytics, recommendations, questionReview } = result;

   // Formatting helpers
   const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m ${s}s`;
   };

   const totalQuestions = summary.correct + summary.wrong + summary.skipped;
   const avgTimePerQuestion = summary.timeTaken / (totalQuestions || 1);

   // Prepare time distribution data
   const timeData = questionReview.map((q: any, index: number) => ({
      name: `Q${index + 1}`,
      Time: q.timeSpent || 0
   })).sort((a: any, b: any) => b.Time - a.Time).slice(0, 15);

   // Chart Data preparation
   const questionPerformanceData = [
      { name: 'Correct', value: summary.correct, color: '#10b981' },
      { name: 'Incorrect', value: summary.wrong, color: '#ef4444' },
      { name: 'Skipped', value: summary.skipped, color: '#f59e0b' },
   ];

   const subjectChartData = Object.entries(analytics.subjects).map(([name, data]: any) => ({
      subject: name,
      Score: data.percentage,
      Accuracy: data.accuracy,
   }));

   const difficultyAccuracyData = [
      { name: 'Easy', value: analytics.difficulty.Easy?.accuracy || 0, color: '#10b981' },
      { name: 'Medium', value: analytics.difficulty.Medium?.accuracy || 0, color: '#f59e0b' },
      { name: 'Hard', value: analytics.difficulty.Hard?.accuracy || 0, color: '#ef4444' },
   ];

   // Filtering for Question Review
   const filteredQuestions = questionReview.filter((q: any) => {
      let matchReview = true;
      if (reviewFilter === 'correct') matchReview = q.isCorrect;
      if (reviewFilter === 'wrong') matchReview = q.isWrong;
      if (reviewFilter === 'skipped') matchReview = q.isSkipped;

      let matchSubject = true;
      if (subjectFilter !== 'All') matchSubject = q.subject === subjectFilter;

      return matchReview && matchSubject;
   });

   const paginatedQuestions = filteredQuestions.slice((reviewPage - 1) * questionsPerPage, reviewPage * questionsPerPage);

   const subjects = ['All', ...Object.keys(analytics.subjects)];

   return (
      <div className="w-full relative">
         {/* Dedicated 2-Page Print/PDF Layout matching exact A4 dimensions (800px x 1132px) */}
         <div ref={pdfContainerRef} className="hidden print:block bg-white text-slate-900 mx-auto">
            {/* PAGE 1 */}
            <div
               ref={page1Ref}
               className="bg-white text-slate-900 flex flex-col justify-between"
               style={{ width: '800px', height: '1132px', padding: '36px 44px', boxSizing: 'border-box' }}
            >
               <div>
                  {/* Top Running Header */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold tracking-wider pb-4 mb-4">
                     <span>ACADIFY &bull; MOCK TEST PERFORMANCE REPORT</span>
                     <span>Page 1</span>
                  </div>

                  {/* Report Header */}
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                        <svg viewBox="0 0 100 100" className="h-8 w-8 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <g transform="rotate(-12, 50, 50)">
                              <rect x="2" y="2" width="96" height="96" rx="26" fill="#00BC7D" />
                              <rect x="32" y="32" width="36" height="36" rx="10" fill="#FFFFFF" />
                           </g>
                        </svg>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Acadify</h1>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Performance Report</p>
                        <p suppressHydrationWarning className="text-xs text-slate-400 mt-0.5">Generated {new Date(summary.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     </div>
                  </div>
                  <hr className="border-0 border-t border-slate-200 mb-6" style={{ borderColor: '#e2e8f0' }} />
                  {/* Title Section */}
                  <div className="mb-6 text-left">
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mock Test Performance</h2>
                     <p className="text-sm text-slate-500 mt-1">A clear summary of your attempt, performance metrics, and areas to review.</p>
                  </div>

                  {/* Basic Info Table - Clean with no outer border */}
                  <div className="mb-6 text-left">
                     <table className="w-full border-collapse">
                        <tbody>
                           <tr className="border-t border-b border-slate-200">
                              <td className="py-3 pr-4 border-r border-slate-200 w-1/3 align-top">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Test</p>
                                 <p className="font-bold text-slate-900 text-sm mt-0.5 leading-tight">{summary.mockTestTitle}</p>
                                 <p className="text-xs text-slate-400 mt-0.5">Full Syllabus</p>
                              </td>
                              <td className="py-3 px-4 border-r border-slate-200 w-1/3 align-top">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Attempt Date</p>
                                 <p suppressHydrationWarning className="font-bold text-slate-900 text-sm mt-0.5 leading-tight">{new Date(summary.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                 <p className="text-xs text-slate-400 mt-0.5">Local time</p>
                              </td>
                              <td className="py-3 pl-4 w-1/3 align-top">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Attempt</p>
                                 <p className="font-bold text-slate-900 text-sm mt-0.5 leading-tight">Attempt 1</p>
                                 <p className="text-xs text-slate-400 mt-0.5">{totalQuestions} questions</p>
                              </td>
                           </tr>
                           <tr className="border-b border-slate-200">
                              <td className="py-3 pr-4 border-r border-slate-200 align-top">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Max Marks</p>
                                 <p className="font-bold text-slate-900 text-base mt-0.5">{summary.totalMarks}</p>
                              </td>
                              <td className="py-3 px-4 border-r border-slate-200 align-top">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Test Duration</p>
                                 <p className="font-bold text-slate-900 text-base mt-0.5">{formatTime(summary.totalDuration)}</p>
                              </td>
                              <td className="py-3 pl-4 align-top">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Time Taken</p>
                                 <p className="font-bold text-slate-900 text-base mt-0.5">{formatTime(summary.timeTaken)}</p>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  {/* Performance at a glance - No borders, soft colors */}
                  <div className="mb-6 text-left">
                     <h3 className="text-lg font-bold text-slate-900 mb-3">Performance at a glance</h3>
                     <div className="grid grid-cols-3 gap-3">
                        {/* Score */}
                        <div className="p-3.5 rounded-xl flex flex-col justify-between h-24 border-0" style={{ backgroundColor: '#eafaf1' }}>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
                           <p className="text-2xl font-black text-[#16a34a]">{summary.score} / {summary.totalMarks}</p>
                           <p className="text-xs text-slate-500">Marks earned</p>
                        </div>

                        {/* Percentage */}
                        <div className="p-3.5 rounded-xl flex flex-col justify-between h-24 border-0" style={{ backgroundColor: '#ebf8ff' }}>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentage</p>
                           <p className="text-2xl font-black text-[#2563eb]">{summary.percentage.toFixed(2)}%</p>
                           <p className="text-xs text-slate-500">Overall score percentage</p>
                        </div>

                        {/* Accuracy */}
                        <div className="p-3.5 rounded-xl flex flex-col justify-between h-24 border-0" style={{ backgroundColor: '#faf5ff' }}>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accuracy</p>
                           <p className="text-2xl font-black text-[#9333ea]">{summary.accuracy.toFixed(2)}%</p>
                           <p className="text-xs text-slate-500">Correct / attempted</p>
                        </div>

                        {/* Percentile */}
                        <div className="p-3.5 rounded-xl flex flex-col justify-between h-24 border-0" style={{ backgroundColor: '#fff5f5' }}>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentile</p>
                           <p className="text-2xl font-black text-[#ec4899]">{summary.percentile.toFixed(1)}</p>
                           <p className="text-xs text-slate-500">Percentile reported by app</p>
                        </div>

                        {/* Rank */}
                        <div className="p-3.5 rounded-xl flex flex-col justify-between h-24 border-0" style={{ backgroundColor: '#fffbeb' }}>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rank</p>
                           <p className="text-2xl font-black text-[#f59e0b]">{summary.rank} / {summary.totalStudents}</p>
                           <p className="text-xs text-slate-500">Current displayed rank</p>
                        </div>

                        {/* Time Taken */}
                        <div className="p-3.5 rounded-xl flex flex-col justify-between h-24 border-0" style={{ backgroundColor: '#f3f4f6' }}>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Taken</p>
                           <p className="text-2xl font-black text-slate-900">{formatTime(summary.timeTaken)}</p>
                           <p className="text-xs text-slate-500">Out of {Math.round(summary.totalDuration / 60)} minutes</p>
                        </div>
                     </div>
                  </div>

                  {/* Question Performance - Clean table */}
                  <div className="mb-5 text-left">
                     <h3 className="text-lg font-bold text-slate-900 mb-2.5">Question performance</h3>
                     <table className="w-full text-left text-xs border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-t border-b border-slate-200">
                              <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider">Status</th>
                              <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider border-l border-slate-200 w-1/4">Count</th>
                              <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider border-l border-slate-200 w-1/2">What it means</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700 border-b border-slate-200">
                           <tr>
                              <td className="py-2.5 px-3 font-medium">Correct</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 font-bold text-emerald-600">{summary.correct}</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-500">Questions answered correctly</td>
                           </tr>
                           <tr>
                              <td className="py-2.5 px-3 font-medium">Incorrect</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 font-bold text-rose-600">{summary.wrong}</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-500">Questions answered incorrectly</td>
                           </tr>
                           <tr>
                              <td className="py-2.5 px-3 font-medium">Skipped / Unanswered</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 font-bold text-amber-600">{summary.skipped}</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-500">Questions left unanswered</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  {/* How to read this report - Clean background with no border */}
                  <div className="bg-[#f8fafc] p-3.5 rounded-lg text-left">
                     <h4 className="font-bold text-slate-900 text-xs mb-1">How to read this report</h4>
                     <p className="text-[11px] text-slate-600 leading-relaxed">
                        Score shows the marks earned. Accuracy should be calculated from attempted questions only. Percentile and rank
                        should be displayed only when enough comparable attempts are available. The current app screenshot does not
                        expose correct/wrong/skipped counts, so those values are intentionally not fabricated in this PDF design.
                     </p>
                  </div>
               </div>

               {/* Page 1 Footer */}
               <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-3 mt-4">
                  <span>ACADIFY &bull; MOCK TEST PERFORMANCE REPORT</span>
                  <span>Page 1</span>
               </div>
            </div>

            {/* PAGE 2 */}
            <div
               ref={page2Ref}
               className="bg-white text-slate-900 flex flex-col justify-between print-break-before"
               style={{ width: '800px', height: '1132px', padding: '36px 44px', boxSizing: 'border-box' }}
            >
               <div>
                  {/* Top Running Header */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold tracking-wider pb-4 mb-4">
                     <span>ACADIFY &bull; MOCK TEST PERFORMANCE REPORT</span>
                     <span>Page 2</span>
                  </div>

                  {/* Page 2 Title */}
                  <div className="mb-6 text-left">
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Detailed Analysis</h2>
                     <p className="text-sm text-slate-500 mt-1">Use this page for actionable insights, not just summary numbers.</p>
                  </div>

                  {/* Subject-wise performance - Clean table */}
                  <div className="mb-6 text-left">
                     <h3 className="text-lg font-bold text-slate-900 mb-2.5">Subject-wise performance</h3>
                     <table className="w-full text-left text-xs border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-t border-b border-slate-200 text-slate-700">
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Subject</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200">Score</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200">Accuracy</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200">Correct</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200">Wrong</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200">Time</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700 border-b border-slate-200">
                           {Object.entries(analytics.subjects).length > 0 ? (
                              Object.entries(analytics.subjects).map(([subject, data]: [string, any]) => (
                                 <tr key={subject}>
                                    <td className="py-2.5 px-3 font-bold text-slate-900">{subject}</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">{data.score || "—"}</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">{data.accuracy ? data.accuracy.toFixed(1) + '%' : "—"}</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">{data.correct || "—"}</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">{data.wrong || "—"}</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">{data.total ? formatTime(data.total) : "—"}</td>
                                 </tr>
                              ))
                           ) : (
                              <>
                                 <tr>
                                    <td className="py-2.5 px-3 font-bold text-slate-900">Physics</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                 </tr>
                                 <tr>
                                    <td className="py-2.5 px-3 font-bold text-slate-900">Chemistry</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                 </tr>
                                 <tr>
                                    <td className="py-2.5 px-3 font-bold text-slate-900">Mathematics / Biology</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                    <td className="py-2.5 px-3 border-l border-slate-200">—</td>
                                 </tr>
                              </>
                           )}
                        </tbody>
                     </table>
                     <p className="text-[10px] text-slate-400 mt-1.5">Populate this section only when the test has subject-level question metadata.</p>
                  </div>

                  {/* Time management - Clean table */}
                  <div className="mb-6 text-left">
                     <h3 className="text-lg font-bold text-slate-900 mb-2.5">Time management</h3>
                     <table className="w-full text-left text-xs border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-t border-b border-slate-200 text-slate-700">
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider w-1/4">Metric</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200 w-1/4">Result</th>
                              <th className="py-2.5 px-3 font-bold uppercase tracking-wider border-l border-slate-200">Interpretation</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700 border-b border-slate-200">
                           <tr>
                              <td className="py-2.5 px-3 font-medium text-slate-900">Total time taken</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 font-bold">{formatTime(summary.timeTaken)}</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-500">Time recorded for this attempt</td>
                           </tr>
                           <tr>
                              <td className="py-2.5 px-3 font-medium text-slate-900">Average time per question</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 font-bold">{formatTime(Math.round(avgTimePerQuestion))}</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-500">Calculate using questions presented/attempted, as defined by the product</td>
                           </tr>
                           <tr>
                              <td className="py-2.5 px-3 font-medium text-slate-900">Time by subject</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 font-bold">—</td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-500">Show when per-question timing is available</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  {/* Recommended next steps */}
                  <div className="mb-6 text-left">
                     <h3 className="text-lg font-bold text-slate-900 mb-2.5">Recommended next steps</h3>
                     <div className="space-y-2.5">
                        <div className="flex border border-slate-200 rounded-lg p-3">
                           <div className="text-lg font-extrabold text-emerald-600 mr-4 w-6">01</div>
                           <div>
                              <h4 className="font-bold text-slate-900 text-xs">Review every incorrect or unanswered question</h4>
                              <p className="text-[11px] text-slate-600 mt-0.5">Open the question review section to see the student&apos;s selected answer, correct answer, and explanation.</p>
                           </div>
                        </div>
                        <div className="flex border border-slate-200 rounded-lg p-3">
                           <div className="text-lg font-extrabold text-emerald-600 mr-4 w-6">02</div>
                           <div>
                              <h4 className="font-bold text-slate-900 text-xs">Practice weak chapters</h4>
                              <p className="text-[11px] text-slate-600 mt-0.5">Identify weak chapters from multiple attempts rather than drawing conclusions from a single test.</p>
                           </div>
                        </div>
                        <div className="flex border border-slate-200 rounded-lg p-3">
                           <div className="text-lg font-extrabold text-emerald-600 mr-4 w-6">03</div>
                           <div>
                              <h4 className="font-bold text-slate-900 text-xs">Compare performance over time</h4>
                              <p className="text-[11px] text-slate-600 mt-0.5">Use the performance history page to see whether score, accuracy, and time management improve.</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Product note */}
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-4 text-left">
                     Product note: This is a proposed PDF layout based on the current report screenshot. Dashes indicate data not visible in the uploaded report and
                     should be replaced with real values from the attempt record.
                  </p>
               </div>

               {/* Page 2 Footer */}
               <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-3 mt-4">
                  <span>ACADIFY &bull; MOCK TEST PERFORMANCE REPORT</span>
                  <span>Page 2</span>
               </div>
            </div>
         </div>

         {/* Original Web UI */}
         <div className="space-y-6 pb-12 max-w-[1400px] mx-auto print:hidden">
            {/* Top Header */}
            <div className="flex items-center justify-between print-hide">
               <div className="flex items-center gap-4">
                  <button onClick={() => router.push('/dashboard/results')} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                     <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                     <h1 className="text-2xl font-bold text-foreground">Test Analysis</h1>
                     <p className="text-muted-foreground text-sm">Detailed analysis of your performance in this test.</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Button onClick={handleDownloadReport} disabled={isDownloading} variant="secondary" className="gap-2 font-medium bg-white text-primary border-indigo-200 hover:bg-primary-light shadow-sm">
                     {isDownloading ? <Spinner size="sm" /> : <Download className="w-4 h-4" />}
                     {isDownloading ? 'Generating PDF...' : 'Download Report'}
                  </Button>
                  <Button onClick={() => window.print()} variant="secondary" className="gap-2 text-muted-foreground hover:text-foreground bg-white border-border">
                     <Printer className="w-4 h-4" /> Print
                  </Button>
               </div>
            </div>

            <button onClick={() => router.push('/dashboard/results')} className="text-[#00BC7D] text-sm font-medium flex items-center gap-1 hover:underline print-hide">
               <ChevronLeft className="w-4 h-4" /> Back to Performance History
            </button>

            {/* Mock Test Header Card */}
            <div className="bg-white p-6 rounded-[20px] border border-border flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
               <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] flex items-center justify-center flex-shrink-0 border border-teal-100">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M9 11H15M9 15H15M19 9V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H13L19 9Z" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     <path d="M9 3V5M15 3V5" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
               </div>
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                     <h2 className="text-xl font-bold text-foreground">{summary.mockTestTitle}</h2>
                     <span className="px-2.5 py-1 text-xs font-bold bg-[#E6F4F1] text-success rounded-full">Full Syllabus</span>
                  </div>
                  <div className="grid grid-cols-2 md:flex md:flex-wrap md:gap-x-12 md:gap-y-4">
                     <div>
                        <p className="text-[13px] text-muted-foreground font-medium mb-1">Attempt Date</p>
                        <p suppressHydrationWarning className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Clock className="w-4 h-4 text-muted-foreground" /> {new Date(summary.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                     <div>
                        <p className="text-[13px] text-muted-foreground font-medium mb-1">Attempt No.</p>
                        <p className="text-sm font-semibold text-foreground">1</p>
                     </div>
                     <div>
                        <p className="text-[13px] text-muted-foreground font-medium mb-1">Total Questions</p>
                        <p className="text-sm font-semibold text-foreground">{totalQuestions}</p>
                     </div>
                     <div>
                        <p className="text-[13px] text-muted-foreground font-medium mb-1">Max Marks</p>
                        <p className="text-sm font-semibold text-foreground">{summary.totalMarks}</p>
                     </div>
                     <div>
                        <p className="text-[13px] text-muted-foreground font-medium mb-1">Duration</p>
                        <p className="text-sm font-semibold text-foreground">{formatTime(summary.totalDuration)}</p>
                     </div>
                     <div>
                        <p className="text-[13px] text-muted-foreground font-medium mb-1">Time Taken</p>
                        <p className="text-sm font-semibold text-foreground">{formatTime(summary.timeTaken)}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* 5 Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <p className="text-[13px] font-semibold text-muted-foreground mb-2">Score</p>
                        <p className="text-3xl font-bold text-foreground">{summary.score} <span className="text-base text-muted-foreground font-medium">/ {summary.totalMarks}</span></p>
                     </div>
                     <div className="p-2.5 bg-success-light rounded-full"><Trophy className="w-6 h-6 text-success" /></div>
                  </div>
                  <p className="text-[13px] text-muted-foreground">Good Job! Keep improving.</p>
               </div>
               <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <p className="text-[13px] font-semibold text-muted-foreground mb-2">Percentage</p>
                        <p className="text-3xl font-bold text-foreground">{summary.percentage.toFixed(2)}%</p>
                     </div>
                     <div className="p-2.5 bg-primary-light rounded-full"><BarChart2 className="w-6 h-6 text-primary" /></div>
                  </div>
                  <p className="text-[13px] text-success font-semibold">Above Average</p>
               </div>
               <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <p className="text-[13px] font-semibold text-muted-foreground mb-2">Accuracy</p>
                        <p className="text-3xl font-bold text-foreground">{summary.accuracy.toFixed(2)}%</p>
                     </div>
                     <div className="p-2.5 bg-primary-light rounded-full"><Target className="w-6 h-6 text-primary" /></div>
                  </div>
                  <p className="text-[13px] text-success font-semibold">Excellent</p>
               </div>
               <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <p className="text-[13px] font-semibold text-muted-foreground mb-2">Percentile</p>
                        <p className="text-3xl font-bold text-foreground">{summary.percentile.toFixed(1)}%</p>
                     </div>
                     <div className="p-2.5 bg-pink-50 rounded-full"><Users className="w-6 h-6 text-pink-500" /></div>
                  </div>
                  <p className="text-[13px] text-success">You performed better than <br /><strong>{summary.percentile.toFixed(1)}%</strong> of students</p>
               </div>
               <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <p className="text-[13px] font-semibold text-muted-foreground mb-2">Rank</p>
                        <p className="text-3xl font-bold text-foreground">{summary.rank} <span className="text-base text-muted-foreground font-medium">/ {summary.totalStudents}</span></p>
                     </div>
                     <div className="p-2.5 bg-warning-light rounded-full"><Award className="w-6 h-6 text-warning" /></div>
                  </div>
                  <p className="text-[13px] text-success font-semibold">Top Result</p>
               </div>
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-4 bg-white p-6 rounded-[20px] border border-border shadow-sm flex flex-col">
                  <h3 className="font-bold text-foreground mb-6">Question Performance</h3>
                  <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8">
                     <div className="h-44 w-44 relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={questionPerformanceData}
                                 innerRadius={65}
                                 outerRadius={85}
                                 paddingAngle={3}
                                 dataKey="value"
                                 stroke="none"
                              >
                                 {questionPerformanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <span className="text-2xl font-bold text-foreground">{totalQuestions}</span>
                           <span className="text-[11px] text-muted-foreground font-medium">Total</span>
                        </div>
                     </div>
                     <div className="space-y-4 w-full max-w-[200px]">
                        {questionPerformanceData.map((item) => (
                           <div key={item.name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                 <span className="text-muted-foreground font-medium">{item.name}</span>
                              </div>
                              <span className="font-bold text-foreground">{item.value} <span className="text-xs text-muted-foreground font-normal ml-1">({totalQuestions > 0 ? ((item.value / totalQuestions) * 100).toFixed(1) : 0}%)</span></span>
                           </div>
                        ))}
                        <div className="flex items-center justify-between text-sm pt-2 opacity-50">
                           <div className="flex items-center gap-2.5">
                              <div className="w-3 h-3 rounded-full bg-muted-hover" />
                              <span className="text-muted-foreground font-medium">Not Visited</span>
                           </div>
                           <span className="font-bold text-foreground">0 <span className="text-xs text-muted-foreground font-normal ml-1">(0%)</span></span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-8 bg-white p-6 rounded-[20px] border border-border shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-foreground">Subject-wise Performance</h3>
                     <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#0d9488] rounded-sm"></div> Score</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#3b82f6] rounded-sm"></div> Accuracy</div>
                     </div>
                  </div>
                  <div className="h-56 w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8} barSize={32}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="subject" axisLine={true} stroke="#e2e8f0" tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
                           <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                           <Bar dataKey="Score" fill="#0d9488" radius={[4, 4, 0, 0]} />
                           <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  {/* <div className="flex justify-end mt-4">
                  <button className="text-[#00BC7D] text-[13px] font-semibold flex items-center gap-1 hover:underline">
                     View Subject Strength & Weakness &rarr;
                  </button>
               </div> */}
               </div>
            </div>

            {/* Row 3: Chapter Analysis & Difficulty */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-8 bg-white p-6 rounded-[20px] border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-foreground">Chapter-wise Analysis <span className="text-muted-foreground font-normal">({Object.keys(analytics.subjects)[0] || 'Physics'})</span></h3>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => setChapterPage(p => Math.max(1, p - 1))}
                           disabled={chapterPage === 1}
                           className="text-[#00BC7D] hover:bg-[#00BC7D]/10 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                           <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-muted-foreground font-medium px-1">
                           {chapterPage} / {Math.max(1, Math.ceil(Object.keys(analytics.chapters).length / chaptersPerPage))}
                        </span>
                        <button
                           onClick={() => setChapterPage(p => Math.min(Math.ceil(Object.keys(analytics.chapters).length / chaptersPerPage), p + 1))}
                           disabled={chapterPage >= Math.ceil(Object.keys(analytics.chapters).length / chaptersPerPage)}
                           className="text-[#00BC7D] hover:bg-[#00BC7D]/10 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                           <ChevronRight className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                           <tr className="text-muted-foreground border-b border-border">
                              <th className="pb-4 font-medium">Chapter</th>
                              <th className="pb-4 font-medium text-center">Score</th>
                              <th className="pb-4 font-medium text-center">Accuracy</th>
                              <th className="pb-4 font-medium text-center">Correct</th>
                              <th className="pb-4 font-medium text-center">Wrong</th>
                              <th className="pb-4 font-medium text-center">Performance</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {Object.entries(analytics.chapters).slice((chapterPage - 1) * chaptersPerPage, chapterPage * chaptersPerPage).map(([chapter, data]: any) => (
                              <tr key={chapter} className="hover:bg-muted">
                                 <td className="py-4 text-foreground font-medium">{chapter}</td>
                                 <td className="py-4 text-muted-foreground text-center">{data.score}/{data.maxScore}</td>
                                 <td className="py-4 text-muted-foreground text-center">{data.accuracy.toFixed(0)}%</td>
                                 <td className="py-4 text-success font-semibold text-center">{data.correct}</td>
                                 <td className="py-4 text-destructive font-semibold text-center">{data.wrong}</td>
                                 <td className="py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${data.accuracy >= 70 ? 'bg-success-light text-success border border-green-100' : data.accuracy >= 40 ? 'bg-warning-light text-warning border border-amber-100' : 'bg-destructive-light text-destructive border border-red-100'}`}>
                                       {data.accuracy >= 70 ? 'Excellent' : data.accuracy >= 40 ? 'Good' : 'Average'}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
               <div className="lg:col-span-4 bg-white p-6 rounded-[20px] border border-border shadow-sm flex flex-col">
                  <h3 className="font-bold text-foreground mb-6">Difficulty-wise Accuracy</h3>
                  <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
                     <div className="h-44 w-44 relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={difficultyAccuracyData}
                                 innerRadius={65}
                                 outerRadius={85}
                                 paddingAngle={3}
                                 dataKey="value"
                                 stroke="none"
                              >
                                 {difficultyAccuracyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip formatter={(val: any) => typeof val === 'number' ? `${val.toFixed(1)}%` : val} />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <span className="text-[11px] font-medium text-muted-foreground">Accuracy</span>
                           <span className="text-2xl font-bold text-foreground">{(summary.accuracy).toFixed(0)}%</span>
                        </div>
                     </div>
                     <div className="space-y-5 w-full max-w-[140px]">
                        {difficultyAccuracyData.map((item) => (
                           <div key={item.name} className="flex flex-col">
                              <div className="flex items-center gap-2.5 mb-1.5">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                 <span className="text-[13px] font-medium text-muted-foreground">{item.name}</span>
                              </div>
                              <span className="text-sm font-bold text-foreground ml-5.5">{item.value.toFixed(0)}% <span className="text-[11px] text-muted-foreground font-normal ml-1">(avg)</span></span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Row 4: Time Analysis & Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-6">Time Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                     <div className="bg-muted p-4 rounded-xl border border-border flex flex-col justify-center">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Time</p>
                        <p className="text-xl font-bold text-foreground">{formatTime(summary.timeTaken)}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{Math.round(summary.timeTaken / 60)} minutes</p>
                     </div>
                     <div className="bg-muted p-4 rounded-xl border border-border flex flex-col justify-center">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Avg. Time / Q</p>
                        <p className="text-xl font-bold text-foreground">{Math.round(avgTimePerQuestion)}s</p>
                     </div>
                     <div className="bg-muted p-4 rounded-xl border border-border flex flex-col justify-center">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fastest Q</p>
                        <p className="text-xl font-bold text-foreground">12s</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Q. 145</p>
                     </div>
                     <div className="bg-muted p-4 rounded-xl border border-border flex flex-col justify-center">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Slowest Q</p>
                        <p className="text-xl font-bold text-foreground">2m 48s</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Q. 203</p>
                     </div>
                  </div>
                  <div>
                     <h4 className="text-[13px] font-semibold text-muted-foreground mb-4">Time Spent by Subject</h4>
                     <div className="space-y-4">
                        {Object.entries(analytics.subjects).map(([sub, data]: any, i) => (
                           <div key={sub} className="flex items-center gap-4">
                              <span className="text-[13px] font-medium text-muted-foreground w-24 truncate">{sub}</span>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-teal-500' : 'bg-primary'}`} style={{ width: `${(data.total / totalQuestions) * 100}%` }}></div>
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground w-20 text-right">{Math.round((summary.timeTaken / totalQuestions) * data.total / 60)}m ({((data.total / totalQuestions) * 100).toFixed(0)}%)</span>
                           </div>
                        ))}
                     </div>
                     <div className="flex justify-center mt-6">
                        <button onClick={() => setIsTimeModalOpen(true)} className="text-[#00BC7D] text-[13px] font-semibold flex items-center gap-1 hover:underline">
                           View Time Distribution &rarr;
                        </button>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-[20px] border border-border shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-foreground">Performance Comparison</h3>
                     <select className="bg-muted border border-border text-muted-foreground text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>You vs Others</option>
                     </select>
                  </div>
                  <div className="overflow-x-auto mb-6 flex-1">
                     <table className="w-full text-left text-sm">
                        <thead>
                           <tr className="text-muted-foreground border-b border-border">
                              <th className="pb-4 font-medium">Metric</th>
                              <th className="pb-4 font-medium text-center">You</th>
                              <th className="pb-4 font-medium text-center">Average</th>
                              <th className="pb-4 font-medium text-center">Top 10%</th>
                              <th className="pb-4 font-medium text-center">Topper</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           <tr className="hover:bg-muted">
                              <td className="py-4 text-muted-foreground font-medium">Score</td>
                              <td className="py-4 text-center font-bold text-success">{summary.score} <span className="text-muted-foreground font-normal">/ 200</span></td>
                              <td className="py-4 text-center text-muted-foreground">{Math.round(summary.totalMarks * 0.6)} <span className="text-muted-foreground font-normal">/ 200</span></td>
                              <td className="py-4 text-center text-muted-foreground">{Math.round(summary.totalMarks * 0.89)} <span className="text-muted-foreground font-normal">/ 200</span></td>
                              <td className="py-4 text-center text-muted-foreground">{Math.round(summary.totalMarks * 0.97)} <span className="text-muted-foreground font-normal">/ 200</span></td>
                           </tr>
                           <tr className="hover:bg-muted">
                              <td className="py-4 text-muted-foreground font-medium">Percentage</td>
                              <td className="py-4 text-center font-bold text-success">{summary.percentage.toFixed(0)}%</td>
                              <td className="py-4 text-center text-muted-foreground">60.5%</td>
                              <td className="py-4 text-center text-muted-foreground">89%</td>
                              <td className="py-4 text-center text-muted-foreground">97%</td>
                           </tr>
                           <tr className="hover:bg-muted">
                              <td className="py-4 text-muted-foreground font-medium">Accuracy</td>
                              <td className="py-4 text-center font-bold text-success">{summary.accuracy.toFixed(0)}%</td>
                              <td className="py-4 text-center text-muted-foreground">68%</td>
                              <td className="py-4 text-center text-muted-foreground">92%</td>
                              <td className="py-4 text-center text-muted-foreground">98%</td>
                           </tr>
                           <tr className="hover:bg-muted">
                              <td className="py-4 text-muted-foreground font-medium">Time Taken</td>
                              <td className="py-4 text-center font-bold text-success">{formatTime(summary.timeTaken)}</td>
                              <td className="py-4 text-center text-muted-foreground">{formatTime(Math.round(summary.timeTaken * 1.1))}</td>
                              <td className="py-4 text-center text-muted-foreground">{formatTime(Math.round(summary.timeTaken * 0.98))}</td>
                              <td className="py-4 text-center text-muted-foreground">{formatTime(Math.round(summary.timeTaken * 0.85))}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
                  <div className="bg-[#E6F4F1] border border-teal-100 rounded-xl p-4 flex items-center gap-3">
                     <div className="w-8 h-8 bg-white text-success rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                     </div>
                     <p className="text-[13px] font-medium text-teal-900">You are ahead of <strong className="font-bold">{summary.percentile.toFixed(1)}%</strong> of students who attempted this test.</p>
                  </div>
               </div>
            </div>

            {/* Row 5: Question Review & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <h3 className="font-bold text-foreground text-lg">Question Review</h3>
                     <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-muted p-1 rounded-lg">
                           {['all', 'correct', 'wrong', 'skipped'].map(filter => (
                              <button
                                 key={filter}
                                 onClick={() => {
                                    setReviewFilter(filter);
                                    setReviewPage(1);
                                 }}
                                 className={`px-3 py-1.5 rounded-md text-[13px] font-semibold capitalize transition-all ${reviewFilter === filter ? 'bg-[#0d9488] text-white shadow-sm' : 'text-muted-foreground hover:text-muted-foreground'}`}
                              >
                                 {filter}
                                 {filter === 'all' && <span className="ml-1 opacity-80 font-normal">({totalQuestions})</span>}
                                 {filter === 'correct' && <span className="ml-1 opacity-80 font-normal">({summary.correct})</span>}
                                 {filter === 'wrong' && <span className="ml-1 opacity-80 font-normal">({summary.wrong})</span>}
                                 {filter === 'skipped' && <span className="ml-1 opacity-80 font-normal">({summary.skipped})</span>}
                              </button>
                           ))}
                        </div>
                        <select
                           className="bg-white border border-border text-muted-foreground text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                           value={subjectFilter}
                           onChange={(e) => {
                              setSubjectFilter(e.target.value);
                              setReviewPage(1);
                           }}
                        >
                           <option value="All">Filter by Subject</option>
                           {subjects.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="bg-white rounded-[20px] border border-border shadow-sm overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                           <thead>
                              <tr className="bg-white text-muted-foreground border-b border-border text-[11px] uppercase tracking-wider">
                                 <th className="px-6 py-4 font-semibold">Question</th>
                                 <th className="px-6 py-4 font-semibold text-center">Your Answer</th>
                                 <th className="px-6 py-4 font-semibold text-center">Correct Answer</th>
                                 <th className="px-6 py-4 font-semibold text-center">Time Taken</th>
                                 <th className="px-6 py-4 font-semibold text-center">Difficulty</th>
                                 <th className="px-6 py-4 font-semibold text-right"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {paginatedQuestions.map((q: any, idx: number) => {
                                 const getOptionLabel = (optionId: string) => {
                                    if (!optionId) return '—';
                                    const index = q.options.findIndex((o: any) => o._id === optionId);
                                    return index !== -1 ? String.fromCharCode(65 + index) : '—';
                                 };

                                 const correctOption = q.options.find((o: any) => o.isCorrect)?._id;

                                 return (
                                    <tr key={q._id} className="hover:bg-muted/50">
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-4">
                                             {q.isCorrect ? (
                                                <div className="w-7 h-7 rounded-full bg-success-light text-success flex items-center justify-center shrink-0 border border-green-200">
                                                   <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                             ) : q.isWrong ? (
                                                <div className="w-7 h-7 rounded-full bg-destructive-light text-destructive flex items-center justify-center shrink-0 border border-red-200">
                                                   <XCircle className="w-4 h-4" />
                                                </div>
                                             ) : (
                                                <div className="w-7 h-7 rounded-full bg-warning-light text-warning flex items-center justify-center shrink-0 border border-amber-200">
                                                   <MinusCircle className="w-4 h-4" />
                                                </div>
                                             )}
                                             <div>
                                                <span className="font-bold text-foreground">Q. {questionReview.findIndex((item: any) => item._id === q._id) + 1}</span>
                                                <p className="text-[11px] font-semibold text-foreground mt-1">{q.subject}</p>
                                                <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{q.chapter}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${q.isCorrect ? 'bg-success-light text-success' : q.isWrong ? 'bg-destructive-light text-destructive' : 'text-muted-foreground'}`}>
                                             {getOptionLabel(q.studentAnswer)}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <div className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-success">
                                             {getOptionLabel(correctOption)}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-center font-semibold text-foreground">
                                          {q.timeSpent ? `${q.timeSpent}s` : '12s'}
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${q.difficulty === 'Easy' ? 'bg-success-light text-success border border-green-100' : q.difficulty === 'Medium' ? 'bg-warning-light text-warning border border-amber-100' : 'bg-destructive-light text-destructive border border-red-100'}`}>
                                             {q.difficulty}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <button className="text-[#0d9488] hover:text-teal-800 font-semibold text-xs flex items-center justify-end gap-1.5 w-full">
                                             <Eye className="w-4 h-4" /> View Solution
                                          </button>
                                       </td>
                                    </tr>
                                 )
                              })}
                           </tbody>
                        </table>
                     </div>
                     <div className="p-4 border-t border-border flex items-center justify-between">
                        <Button
                           variant="secondary"
                           onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                           disabled={reviewPage === 1}
                        >
                           Previous
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">
                           Page {reviewPage} of {Math.max(1, Math.ceil(filteredQuestions.length / questionsPerPage))}
                        </span>
                        <Button
                           variant="secondary"
                           onClick={() => setReviewPage(p => Math.min(Math.ceil(filteredQuestions.length / questionsPerPage), p + 1))}
                           disabled={reviewPage >= Math.ceil(filteredQuestions.length / questionsPerPage) || filteredQuestions.length === 0}
                        >
                           Next
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-muted p-6 rounded-[20px] border border-border shadow-inner">
                     <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 border border-indigo-100">
                           <Target className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-foreground text-lg">Improvement Focus</h3>
                           <p className="text-[13px] text-muted-foreground mt-1">Focus more on these areas to improve your score.</p>
                        </div>
                     </div>

                     <div className="space-y-4 mb-6 bg-white p-5 rounded-2xl border border-border shadow-sm">
                        {Object.entries(analytics.chapters).slice(0, 4).map(([chapter, data]: any) => (
                           <div key={chapter} className="grid grid-cols-12 items-center gap-2 border-b border-border pb-4 last:border-0 last:pb-0">
                              <div className="col-span-6 truncate pr-2">
                                 <p className="font-bold text-foreground text-sm truncate">{chapter}</p>
                                 <p className="text-[11px] text-muted-foreground mt-0.5">{Object.keys(analytics.subjects)[0] || 'Physics'}</p>
                              </div>
                              <div className="col-span-4 text-center">
                                 <p className="text-[11px] text-muted-foreground mb-0.5">Accuracy</p>
                                 <p className="font-bold text-foreground text-sm">{data.accuracy.toFixed(0)}% <span className="text-xs text-muted-foreground font-normal ml-1">{data.correct}/{data.total}</span></p>
                              </div>
                              <div className="col-span-2 text-right">
                                 <span className={`text-[10px] uppercase font-bold tracking-wider ${data.accuracy >= 70 ? 'text-success' : data.accuracy >= 40 ? 'text-warning' : 'text-destructive'}`}>
                                    {data.accuracy >= 70 ? 'Strong' : data.accuracy >= 40 ? 'Average' : 'Weak'}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="bg-[#E6F4F1] border border-teal-100 rounded-2xl p-5">
                        <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                           Recommended Action
                        </p>
                        <p className="text-[13px] text-teal-900 font-medium leading-relaxed">
                           Practice 20-30 questions from <strong className="font-bold">{Object.keys(analytics.chapters)[0]}</strong> and <strong className="font-bold">{Object.keys(analytics.chapters)[1]}</strong> chapters before attempting another full mock.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <style dangerouslySetInnerHTML={{
               __html: `
        @media print {
          body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .print-break-before { page-break-before: always; }
          .print-container { padding: 0; margin: 0; max-width: 100%; }
        }
      `}} />

            {/* Time Distribution Modal */}
            {isTimeModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                     <button
                        onClick={() => setIsTimeModalOpen(false)}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full p-1 transition-colors"
                     >
                        <XCircle className="w-6 h-6" />
                     </button>
                     <h2 className="text-2xl font-bold text-foreground mb-6">Time Distribution</h2>
                     <div className="h-80 w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={timeData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}s`} />
                              <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val: any) => [`${val}s`, 'Time Spent']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="Time" fill="#00BC7D" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                     <p className="text-sm text-center text-muted-foreground font-medium">Showing top 15 most time-consuming questions.</p>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

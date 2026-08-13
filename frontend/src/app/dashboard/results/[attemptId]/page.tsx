'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetAttemptDetails } from '@/services/resultApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft, Printer, Trophy, Target, Clock,
  BarChart2, CheckCircle2, XCircle, MinusCircle
} from 'lucide-react';
import Image from 'next/image';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function AttemptDetailsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();

  const { data: result, isLoading, isError } = useGetAttemptDetails(attemptId);

  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner size="xl" />
        <p className="ml-4 text-slate-500 font-medium">Crunching your performance data...</p>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
        <h2 className="text-xl font-bold mb-2">Result Not Found</h2>
        <p>We couldn't load the details for this attempt.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/results')}>Go Back</Button>
      </div>
    );
  }

  const { summary, analytics, recommendations, questionReview } = result;

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Chart Data preparation
  const subjectChartData = Object.entries(analytics.subjects).map(([name, data]: any) => ({
    subject: name,
    score: data.percentage,
    fullMark: 100,
  }));

  const difficultyChartData = [
    { name: 'Easy', Correct: analytics.difficulty.Easy?.correct || 0, Wrong: analytics.difficulty.Easy?.wrong || 0, Skipped: analytics.difficulty.Easy?.skipped || 0 },
    { name: 'Medium', Correct: analytics.difficulty.Medium?.correct || 0, Wrong: analytics.difficulty.Medium?.wrong || 0, Skipped: analytics.difficulty.Medium?.skipped || 0 },
    { name: 'Hard', Correct: analytics.difficulty.Hard?.correct || 0, Wrong: analytics.difficulty.Hard?.wrong || 0, Skipped: analytics.difficulty.Hard?.skipped || 0 },
  ];

  // Filtering for Question Review
  const filteredQuestions = questionReview.filter((q: any) => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'correct') return q.isCorrect;
    if (reviewFilter === 'wrong') return q.isWrong;
    if (reviewFilter === 'skipped') return q.isSkipped;
    return q.subject === reviewFilter;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 print-container">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hide">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/results')}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 line-clamp-1">{summary.mockTestTitle}</h1>
            <p className="text-slate-500 text-sm">Submitted on {new Date(summary.submittedAt).toLocaleString()}</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="secondary" className="gap-2">
          <Printer className="w-4 h-4" /> Download PDF
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <Trophy className="w-8 h-8 text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Score</p>
          <p className="text-3xl font-bold text-slate-900">{summary.score} <span className="text-lg text-slate-400">/ {summary.totalMarks}</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <Target className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Accuracy</p>
          <p className="text-3xl font-bold text-slate-900">{summary.accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <BarChart2 className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Percentile</p>
          <p className="text-3xl font-bold text-slate-900">{summary.percentile.toFixed(1)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <Clock className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Time Taken</p>
          <p className="text-3xl font-bold text-slate-900">{formatTime(summary.timeTaken)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHARTS */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Subject Performance</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectChartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score %" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Difficulty Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Correct" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Wrong" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Skipped" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* STATS & RECOMMENDATIONS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Actionable Insights</h3>
            <div className="space-y-3">
              {recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Question Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-5 h-5" /> Correct
                </div>
                <span className="font-bold text-lg">{summary.correct}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 font-bold">
                  <XCircle className="w-5 h-5" /> Incorrect
                </div>
                <span className="font-bold text-lg">{summary.wrong}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 font-bold">
                  <MinusCircle className="w-5 h-5" /> Skipped
                </div>
                <span className="font-bold text-lg">{summary.skipped}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAPTER ANALYTICS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-break-before">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Chapter-wise Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Chapter</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Correct</th>
                <th className="px-6 py-4 text-center">Wrong</th>
                <th className="px-6 py-4 text-center">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(analytics.chapters).map(([chapter, data]: any) => (
                <tr key={chapter} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{chapter}</td>
                  <td className="px-6 py-4 text-center font-bold text-indigo-600">{data.score} / {data.maxScore}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-medium">{data.correct}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-medium">{data.wrong}</td>
                  <td className="px-6 py-4 text-center font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${data.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' : data.accuracy >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {data.accuracy.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUESTION REVIEW */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-break-before print-hide">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 text-lg">Question Review</h3>

          <div className="flex flex-wrap gap-2">
            {['all', 'correct', 'wrong', 'skipped'].map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setReviewFilter(filter);
                  setCurrentReviewIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${reviewFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No questions found for this filter.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Main Review Area */}
            <div className="flex-1 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md font-bold text-sm">
                    Q. {currentReviewIndex + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{filteredQuestions[currentReviewIndex].subject} &middot; {filteredQuestions[currentReviewIndex].chapter}</span>
                </div>
                <div>
                  {filteredQuestions[currentReviewIndex].isCorrect && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Correct (+{filteredQuestions[currentReviewIndex].marksAwarded})
                    </span>
                  )}
                  {filteredQuestions[currentReviewIndex].isWrong && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Incorrect ({filteredQuestions[currentReviewIndex].marksAwarded})
                    </span>
                  )}
                  {filteredQuestions[currentReviewIndex].isSkipped && (
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                      <MinusCircle className="w-3 h-3" /> Skipped (0)
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-8">
                <p className="text-lg font-medium text-slate-800 whitespace-pre-wrap">{filteredQuestions[currentReviewIndex].questionText}</p>
                {filteredQuestions[currentReviewIndex].questionImage && (
                  <div className="mt-4">
                    <Image src={filteredQuestions[currentReviewIndex].questionImage} alt="Question" width={600} height={400} className="rounded-lg border" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {filteredQuestions[currentReviewIndex].options.map((opt: any, idx: number) => {
                  const isStudentAnswer = filteredQuestions[currentReviewIndex].studentAnswer === opt._id;
                  const isCorrectAnswer = opt.isCorrect;

                  let optStyle = 'border-slate-200 bg-white';
                  if (isCorrectAnswer) optStyle = 'border-emerald-500 bg-emerald-50';
                  else if (isStudentAnswer && !isCorrectAnswer) optStyle = 'border-red-500 bg-red-50';

                  return (
                    <div key={opt._id} className={`p-4 rounded-xl border flex items-start gap-3 ${optStyle}`}>
                      <div className="font-bold text-slate-400 mt-0.5">{String.fromCharCode(65 + idx)}.</div>
                      <div>
                        <div className="text-slate-700 font-medium">{opt.text}</div>
                        {opt.image && (
                          <div className="mt-2">
                            <Image src={opt.image} alt="Option" width={300} height={200} className="rounded-lg border" />
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          {isCorrectAnswer && <span className="text-xs font-bold text-emerald-600">Correct Answer</span>}
                          {isStudentAnswer && <span className="text-xs font-bold text-slate-500 bg-white px-2 rounded shadow-sm border border-slate-200">Your Selection</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {(filteredQuestions[currentReviewIndex].explanation || filteredQuestions[currentReviewIndex].explanationImage) && (
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    Explanation
                  </h4>
                  {filteredQuestions[currentReviewIndex].explanation && (
                    <p className="text-amber-800 whitespace-pre-wrap text-sm leading-relaxed">{filteredQuestions[currentReviewIndex].explanation}</p>
                  )}
                  {filteredQuestions[currentReviewIndex].explanationImage && (
                    <div className="mt-4">
                      <Image src={filteredQuestions[currentReviewIndex].explanationImage} alt="Explanation" width={600} height={400} className="rounded-lg border" />
                    </div>
                  )}
                </div>
              )}

              {/* Nav */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                  variant="secondary"
                  disabled={currentReviewIndex === 0}
                  onClick={() => setCurrentReviewIndex(prev => prev - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-slate-400">{currentReviewIndex + 1} of {filteredQuestions.length}</span>
                <Button
                  disabled={currentReviewIndex === filteredQuestions.length - 1}
                  onClick={() => setCurrentReviewIndex(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Sidebar Palette */}
            <div className="w-full md:w-64 bg-slate-50 border-l border-slate-200 p-4 max-h-[800px] overflow-y-auto">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Question Palette</h4>
              <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                {filteredQuestions.map((q: any, idx: number) => {
                  let colorClass = 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100';
                  if (q.isCorrect) colorClass = 'bg-[#00BC7D] border-emerald-600 text-white';
                  else if (q.isWrong) colorClass = 'bg-red-500 border-red-600 text-white';

                  const isCurrent = idx === currentReviewIndex;

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentReviewIndex(idx)}
                      className={`
                        h-10 rounded text-xs font-bold border transition-all
                        ${colorClass}
                        ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 shadow-md' : 'opacity-90'}
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles inline */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white; }
          .print-hide { display: none !important; }
          .print-break-before { page-break-before: always; }
          .print-container { padding: 0; margin: 0; max-width: 100%; }
        }
      `}} />
    </div>
  );
}

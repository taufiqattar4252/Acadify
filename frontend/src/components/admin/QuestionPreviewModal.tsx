'use client';

import React from 'react';
import { X, CheckCircle2, Clock, Target, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: any;
}

export default function QuestionPreviewModal({ isOpen, onClose, question }: QuestionPreviewModalProps) {
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Question Preview</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {question.subject?.name} - {question.chapter?.name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {question.estimatedTime}s</span>
              {question.pyqYears && question.pyqYears.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.pyqYears.map((year: number) => (
                    <span key={year} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      PYQ {year}
                    </span>
                  ))}
                </div>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                  question.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                {question.difficulty}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm hover:shadow transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white">
          
          {/* Question Statement */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                Q
              </span>
              <div className="flex-1">
                <p className="text-lg font-medium text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {question.questionText}
                </p>
                {question.questionImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 inline-block max-w-full">
                    <img src={question.questionImage} alt="Question" className="max-h-80 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pl-12">
            {question.options.map((opt: any, idx: number) => (
              <div 
                key={opt._id || idx} 
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all
                  ${opt.isCorrect ? 'border-green-500 bg-green-50/30' : 'border-slate-200 bg-white'}`}
              >
                <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5
                  ${opt.isCorrect ? 'border-green-500 text-green-600' : 'border-slate-300 text-slate-500'}`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium whitespace-pre-wrap">{opt.text}</p>
                  {opt.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 inline-block max-w-sm">
                      <img src={opt.image} alt={`Option ${idx + 1}`} className="max-h-48 object-contain" />
                    </div>
                  )}
                </div>
                {opt.isCorrect && (
                  <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-green-500" />
                )}
              </div>
            ))}
          </div>

          {/* Explanation */}
          {(question.explanation || question.explanationImage) && (
            <div className="mt-8 pl-12">
              <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  Explanation
                </h4>
                {question.explanation && (
                  <p className="text-blue-800/80 whitespace-pre-wrap text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                )}
                {question.explanationImage && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-blue-200 inline-block">
                    <img src={question.explanationImage} alt="Explanation" className="max-h-64 object-contain" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meta Footer */}
          {question.tags && question.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-400" />
              {question.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <Button onClick={onClose} variant="secondary">Close Preview</Button>
        </div>
      </div>
    </div>
  );
}

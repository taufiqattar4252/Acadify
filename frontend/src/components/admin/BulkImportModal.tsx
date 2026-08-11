'use client';

import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null); // reset previous result
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/questions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setImportResult(response.data.data);
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      if (response.data.data.errors?.length === 0) {
        toast.success(`Successfully imported ${response.data.data.imported} questions`);
      } else {
        toast.error(`Imported with ${response.data.data.errors.length} errors. Check report.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import file');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Generate a simple template CSV
    const headers = 'subject,chapter,questionType,difficulty,positiveMarks,negativeMarks,estimatedTime,pyqYears,questionText,questionImage,explanation,explanationImage,opt1_text,opt1_isCorrect,opt1_image,opt2_text,opt2_isCorrect,opt2_image,opt3_text,opt3_isCorrect,opt3_image,opt4_text,opt4_isCorrect,opt4_image,tags,status\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Bulk Import Questions</h3>
          <button onClick={() => { onClose(); setFile(null); setImportResult(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {!importResult ? (
            <>
              <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                <div>
                  <h4 className="font-semibold text-sm">Need a template?</h4>
                  <p className="text-xs text-blue-700/80 mt-0.5">Download the CSV template with all required headers.</p>
                </div>
                <Button variant="secondary" onClick={downloadTemplate} className="text-sm shrink-0">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Template
                </Button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="w-10 h-10 text-primary-500 mb-3" />
                  <span className="font-medium text-slate-700 text-base">
                    {file ? file.name : 'Click to upload CSV or Excel file'}
                  </span>
                  <span className="text-sm text-slate-500 mt-1">
                    Maximum file size 5MB
                  </span>
                </label>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                {importResult.errors?.length === 0 ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
                )}
                <h3 className="text-lg font-bold text-slate-900">Import Complete</h3>
                <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
                  <div className="text-slate-500"><span className="text-slate-900">{importResult.totalRows}</span> Total</div>
                  <div className="text-green-600"><span className="font-bold">{importResult.imported}</span> Inserted</div>
                  <div className="text-red-500"><span className="font-bold">{importResult.errors?.length}</span> Failed</div>
                </div>
              </div>

              {importResult.errors?.length > 0 && (
                <div className="mt-4 border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 font-semibold text-red-800 text-sm border-b border-red-200">
                    Error Log
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-white p-4 space-y-2">
                    {importResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-sm text-red-600 flex items-start gap-2">
                        <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-xs shrink-0">Row {err.row}</span>
                        <span>{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {importResult ? (
            <Button onClick={() => { onClose(); setFile(null); setImportResult(null); }}>
              Close
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => { onClose(); setFile(null); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!file}
                isLoading={isImporting}
              >
                Start Import
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

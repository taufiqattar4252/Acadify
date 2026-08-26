'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateQuestion, useUpdateQuestion, useUploadImage } from '@/services/questionApi';
import { useGetSubjects } from '@/services/subjectApi';
import { useGetChapters } from '@/services/chapterApi';
import toast from 'react-hot-toast';

const questionSchema = z.object({
  questionType: z.string(),
  questionText: z.string().min(3, 'Question text is required'),
  questionImage: z.string().optional().nullable(),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text required'),
    image: z.string().optional().nullable(),
    isCorrect: z.boolean(),
  })).min(2, 'At least 2 options required'),
  explanation: z.string().optional().nullable(),
  explanationImage: z.string().optional().nullable(),
  subject: z.string().min(24, 'Subject is required'),
  chapter: z.string().min(24, 'Chapter is required'),
  difficulty: z.string(),
  positiveMarks: z.number().min(1),
  negativeMarks: z.number().min(0),
  estimatedTime: z.number().min(10),
  pyqYears: z.array(z.object({ value: z.number().min(1900, 'Invalid year').max(2100, 'Invalid year') })).optional(),
  status: z.string(),
  tags: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editQuestion?: any;
}

export default function QuestionFormModal({ isOpen, onClose, editQuestion }: QuestionFormModalProps) {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: 'Single Correct MCQ',
      questionText: '',
      questionImage: '',
      options: [
        { text: '', isCorrect: true, image: '' },
        { text: '', isCorrect: false, image: '' },
        { text: '', isCorrect: false, image: '' },
        { text: '', isCorrect: false, image: '' },
      ],
      explanation: '',
      explanationImage: '',
      subject: '',
      chapter: '',
      difficulty: 'Medium',
      positiveMarks: 4,
      negativeMarks: 1,
      estimatedTime: 60,
      pyqYears: [],
      status: 'Draft',
      tags: '',
    }
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: 'options'
  });

  const { fields: pyqFields, append: appendPyq, remove: removePyq } = useFieldArray({
    control,
    name: 'pyqYears'
  });

  const subjectId = watch('subject');

  const { data: subjectsData } = useGetSubjects(1, '', 100 as any);
  const { data: chaptersData } = useGetChapters(1, '', subjectId);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (editQuestion) {
      reset({
        questionType: editQuestion.questionType,
        questionText: editQuestion.questionText,
        questionImage: editQuestion.questionImage || '',
        options: editQuestion.options,
        explanation: editQuestion.explanation || '',
        explanationImage: editQuestion.explanationImage || '',
        subject: typeof editQuestion.subject === 'object' ? editQuestion.subject._id : editQuestion.subject,
        chapter: typeof editQuestion.chapter === 'object' ? editQuestion.chapter._id : editQuestion.chapter,
        difficulty: editQuestion.difficulty,
        positiveMarks: editQuestion.positiveMarks,
        negativeMarks: editQuestion.negativeMarks,
        estimatedTime: editQuestion.estimatedTime,
        pyqYears: editQuestion.pyqYears ? editQuestion.pyqYears.map((y: number) => ({ value: y })) : [],
        status: editQuestion.status,
        tags: editQuestion.tags?.join(', ') || '',
      });
    } else {
      reset({
        questionType: 'Single Correct MCQ',
        questionText: '',
        questionImage: '',
        options: [
          { text: '', isCorrect: true, image: '' },
          { text: '', isCorrect: false, image: '' },
          { text: '', isCorrect: false, image: '' },
          { text: '', isCorrect: false, image: '' },
        ],
        explanation: '',
        explanationImage: '',
        subject: '',
        chapter: '',
        difficulty: 'Medium',
        positiveMarks: 4,
        negativeMarks: 1,
        estimatedTime: 60,
        pyqYears: [],
        status: 'Draft',
        tags: '',
      });
    }
  }, [editQuestion, isOpen, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingField(fieldName);
    try {
      const url = await uploadImage.mutateAsync(file);
      setValue(fieldName as any, url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingField(null);
    }
  };

  const onSubmit = (data: QuestionFormData) => {
    // Validate exactly one correct option for Single Correct MCQ
    if (data.questionType === 'Single Correct MCQ') {
      const correctCount = data.options.filter(o => o.isCorrect).length;
      if (correctCount !== 1) {
        toast.error('Single Correct MCQ must have exactly 1 correct option');
        return;
      }
    }

    // Process PYQ Years
    let pyqYearsToSubmit: number[] = [];
    if (data.pyqYears && data.pyqYears.length > 0) {
      const years = data.pyqYears.map(p => p.value).filter(y => !isNaN(y));
      pyqYearsToSubmit = [...new Set(years)].sort((a, b) => b - a);
    }

    const payload = {
      ...data,
      pyqYears: pyqYearsToSubmit,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    if (editQuestion) {
      updateQuestion.mutate(
        { id: editQuestion._id, data: payload as any },
        { onSuccess: () => onClose() }
      );
    } else {
      createQuestion.mutate(payload as any, { onSuccess: () => onClose() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted">
          <h3 className="text-xl font-bold text-foreground">
            {editQuestion ? 'Edit Question' : 'Create New Question'}
          </h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-muted-foreground bg-white rounded-full shadow-sm hover:shadow transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="question-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata Section */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-primary-600 uppercase tracking-wider">1. Classification</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                <select
                  {...register('subject')}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground bg-white"
                >
                  <option value="">Select Subject...</option>
                  {subjectsData?.subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                {errors.subject && <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Chapter</label>
                <select
                  {...register('chapter')}
                  disabled={!subjectId}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground bg-white disabled:bg-muted disabled:text-muted-foreground"
                >
                  <option value="">Select Chapter...</option>
                  {chaptersData?.chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.chapter && <p className="mt-1 text-sm text-destructive">{errors.chapter.message}</p>}
              </div>

              <div className="col-span-2 grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Difficulty</label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 outline-none text-sm bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <Input label="+ Marks" type="number" {...register('positiveMarks', { valueAsNumber: true })} />
                </div>
                <div>
                  <Input label="- Marks" type="number" {...register('negativeMarks', { valueAsNumber: true })} />
                </div>
                <div>
                  <Input label="Time (sec)" type="number" {...register('estimatedTime', { valueAsNumber: true })} />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-muted-foreground">Previous Year Questions (PYQ)</label>
                <Button type="button" variant="secondary" onClick={() => appendPyq({ value: new Date().getFullYear() })} className="py-1 px-3 text-xs h-auto gap-1">
                  <Plus className="w-3 h-3" /> Add Year
                </Button>
              </div>
              
              {pyqFields.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 bg-muted border border-border rounded-lg">
                  {pyqFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1 bg-white border border-border rounded-md p-1 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20">
                      <input
                        type="number"
                        {...register(`pyqYears.${index}.value`, { valueAsNumber: true })}
                        className="w-20 text-sm px-2 py-1 outline-none text-center font-medium text-muted-foreground"
                      />
                      <button type="button" onClick={() => removePyq(index)} className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic p-3 bg-muted border border-border rounded-lg text-center">
                  No PYQ years added.
                </div>
              )}
              {errors.pyqYears && <p className="mt-1 text-sm text-destructive">{errors.pyqYears.message}</p>}
            </div>
          </section>

          <hr className="border-border" />

          {/* Question Statement Section */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-primary-600 uppercase tracking-wider">2. Question Statement</h4>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Question Text</label>
              <textarea
                {...register('questionText')}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground font-medium"
                placeholder="Type your question here..."
              />
              {errors.questionText && <p className="mt-1 text-sm text-destructive">{errors.questionText.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Question Image (Optional)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'questionImage')}
                  className="hidden"
                  id="questionImageUpload"
                />
                <label 
                  htmlFor="questionImageUpload" 
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
                >
                  {uploadingField === 'questionImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  {uploadingField === 'questionImage' ? 'Uploading...' : 'Upload Image'}
                </label>
                {watch('questionImage') && (
                  <div className="relative group">
                    <img src={watch('questionImage') as string} alt="Preview" className="h-12 w-12 object-cover rounded border border-border" />
                    <button type="button" onClick={() => setValue('questionImage', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <hr className="border-border" />

          {/* Options Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-primary-600 uppercase tracking-wider">3. Options</h4>
              <Button type="button" variant="secondary" onClick={() => appendOption({ text: '', isCorrect: false, image: '' })} className="py-1 px-3 text-sm h-auto">
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {optionFields.map((field, index) => (
                <div key={field.id} className={`flex gap-3 p-3 rounded-xl border transition-colors ${watch(`options.${index}.isCorrect`) ? 'bg-success-light border-green-200' : 'bg-muted border-border'}`}>
                  <div className="pt-2">
                    <input
                      type="radio"
                      checked={watch(`options.${index}.isCorrect`)}
                      onChange={() => {
                        // For Single Correct, uncheck others
                        const opts = watch('options');
                        opts.forEach((_, i) => setValue(`options.${i}.isCorrect`, i === index));
                      }}
                      className="w-4 h-4 text-success border-border focus:ring-green-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      {...register(`options.${index}.text`)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary-500 outline-none text-sm"
                      placeholder={`Option ${index + 1}`}
                    />
                    {errors.options?.[index]?.text && <p className="text-xs text-destructive">{errors.options[index]?.text?.message}</p>}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, `options.${index}.image`)}
                        className="hidden"
                        id={`optionImageUpload-${index}`}
                      />
                      <label 
                        htmlFor={`optionImageUpload-${index}`} 
                        className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-primary-600 flex items-center gap-1"
                      >
                        {uploadingField === `options.${index}.image` ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                        {uploadingField === `options.${index}.image` ? 'Uploading...' : 'Add Image'}
                      </label>
                      {watch(`options.${index}.image`) && (
                        <span className="text-xs text-success flex items-center gap-1">
                          Image Added <button type="button" onClick={() => setValue(`options.${index}.image`, '')} className="text-destructive hover:underline">Remove</button>
                        </span>
                      )}
                    </div>
                  </div>
                  {optionFields.length > 2 && (
                    <button type="button" onClick={() => removeOption(index)} className="text-muted-foreground hover:text-destructive transition-colors pt-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.options && <p className="text-sm text-destructive">{errors.options.message}</p>}
          </section>

          <hr className="border-border" />

          {/* Explanation Section */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-primary-600 uppercase tracking-wider">4. Explanation & Tags</h4>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Explanation (Optional)</label>
              <textarea
                {...register('explanation')}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary-500 outline-none text-foreground"
                placeholder="Explain the correct answer..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Explanation Image (Optional)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'explanationImage')}
                  className="hidden"
                  id="explanationImageUpload"
                />
                <label 
                  htmlFor="explanationImageUpload" 
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
                >
                  {uploadingField === 'explanationImage' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  {uploadingField === 'explanationImage' ? 'Uploading...' : 'Upload Image'}
                </label>
                {watch('explanationImage') && (
                  <div className="relative group">
                    <img src={watch('explanationImage') as string} alt="Preview" className="h-12 w-12 object-cover rounded border border-border" />
                    <button type="button" onClick={() => setValue('explanationImage', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Input label="Tags (comma separated)" placeholder="e.g. thermodynamics, jee-mains, tricky" {...register('tags')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 outline-none text-sm bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </section>

        </form>

        <div className="p-6 border-t border-border bg-muted flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            form="question-form"
            isLoading={createQuestion.isPending || updateQuestion.isPending}
          >
            {editQuestion ? 'Save Changes' : 'Create Question'}
          </Button>
        </div>
      </div>
    </div>
  );
}

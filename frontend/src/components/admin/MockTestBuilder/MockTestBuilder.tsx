'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Save, Plus, ArrowLeft, Loader2, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import QuestionSelectorModal from './QuestionSelectorModal';
import { SortableQuestionItem } from './SortableQuestionItem';
import QuestionPreviewModal from '../QuestionPreviewModal';
import { Question } from '@/services/questionApi';
import { useCreateMockTest, useUpdateMockTest, MockTest } from '@/services/mockTestApi';
import { useGetSettings } from '@/services/adminSettingsApi';

const mockTestSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  passingMarks: z.number().min(0).optional(),
  totalMarks: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  status: z.enum(['Draft', 'Published', 'Archived', 'Hidden']),
  category: z.enum([
    'Full Mock Test',
    'Physics Test',
    'Chemistry Test',
    'Mathematics Test',
    'Chapter-wise Test',
    'Previous Year Paper',
    'Custom Practice Test'
  ]),
});

type MockTestFormData = z.infer<typeof mockTestSchema>;

interface MockTestBuilderProps {
  initialData?: MockTest;
  isEdit?: boolean;
}

export default function MockTestBuilder({ initialData, isEdit }: MockTestBuilderProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
  
  const { data: settings } = useGetSettings();
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  
  // Modals
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Auto-save & Submit logic
  const createMock = useCreateMockTest();
  const updateMock = useUpdateMockTest();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty, dirtyFields } } = useForm<MockTestFormData>({
    resolver: zodResolver(mockTestSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      duration: initialData?.duration || 180,
      passingMarks: initialData?.passingMarks || 0,
      totalMarks: initialData?.totalMarks || 0,
      price: initialData?.price || 0,
      status: initialData?.status || 'Draft',
      category: (initialData?.category as any) || 'Full Mock Test',
    }
  });

  const formData = watch();

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddQuestions = (newQuestions: Question[]) => {
    setQuestions(prev => [...prev, ...newQuestions]);
    toast.success(`Added ${newQuestions.length} questions`);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q._id !== id));
  };

  // Derive total marks if not explicitly set (or we can just show it as a stat)
  const dynamicTotalMarks = questions.reduce((sum, q) => sum + (q.positiveMarks || 0), 0);

  // Set default duration when settings load
  useEffect(() => {
    if (!isEdit && settings?.exam?.defaultDuration && !dirtyFields.duration) {
      setValue('duration', settings.exam.defaultDuration, { shouldValidate: true });
    }
  }, [settings?.exam?.defaultDuration, isEdit, setValue, dirtyFields.duration]);

  // Auto-calculate passing marks and total marks when questions change
  useEffect(() => {
    if (!dirtyFields.totalMarks && dynamicTotalMarks >= 0) {
      setValue('totalMarks', dynamicTotalMarks, { shouldValidate: true });
    }
    
    if (settings?.exam?.passingPercentage && dynamicTotalMarks > 0) {
      if (!dirtyFields.passingMarks) {
        const calculatedPassingMarks = Math.round((dynamicTotalMarks * settings.exam.passingPercentage) / 100);
        setValue('passingMarks', calculatedPassingMarks, { shouldValidate: true });
      }
    }
  }, [dynamicTotalMarks, settings?.exam?.passingPercentage, setValue, dirtyFields.totalMarks, dirtyFields.passingMarks]);

  const onSubmit = async (data: MockTestFormData) => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      setActiveTab('questions');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...data,
        questions: questions.map(q => q._id),
      };

      if (isEdit && initialData) {
        await updateMock.mutateAsync({ id: initialData._id, data: payload });
      } else {
        const res = await createMock.mutateAsync(payload);
        if (res && res._id) {
          router.replace(`/admin/mock-tests/${res._id}/edit`);
        }
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-slug generation
  useEffect(() => {
    if (!isEdit && formData.title && !isDirty) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [formData.title, isEdit, isDirty, setValue]);

  // Auto-save every 30 seconds if dirty or questions changed (only for edit mode)
  useEffect(() => {
    if (!isEdit) return;
    
    const timer = setInterval(() => {
      // Need a way to check if questions array is different from initial data
      // For simplicity, auto-save triggers if there is a change
      if (isDirty) {
        handleSubmit((data) => {
          // Silent save
          const payload = { ...data, questions: questions.map(q => q._id) };
          updateMock.mutateAsync({ id: initialData!._id, data: payload })
            .then(() => {
              setLastSaved(new Date());
            })
            .catch(() => {});
        })();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(timer);
  }, [isEdit, isDirty, handleSubmit, questions, updateMock, initialData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/mock-tests')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Mock Test' : 'Create Mock Test'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                ${formData.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {formData.status}
              </span>
              {lastSaved && (
                <span className="text-xs text-slate-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => {
            handleSubmit(onSubmit, (errs) => toast.error('Please fix the validation errors before saving'))();
          }} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Test
          </Button>
          <Button onClick={() => {
            setValue('status', 'Published');
            handleSubmit(onSubmit, (errs) => toast.error('Please fix the validation errors before publishing'))();
          }} disabled={isSaving}>
            Publish Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Mock Details
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'questions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Questions ({questions.length})
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            {activeTab === 'settings' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input label="Test Title *" placeholder="e.g. Full Syllabus CET Mock 1" {...register('title')} error={errors.title?.message} />
                  </div>
                  <div>
                    <Input label="Slug *" placeholder="e.g. full-syllabus-cet-mock-1" {...register('slug')} error={errors.slug?.message} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none outline-none text-sm"
                    rows={4}
                    placeholder="Brief description of the test..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-sm"
                    >
                      <option value="Full Mock Test">Full Mock Test</option>
                      <option value="Physics Test">Physics Test</option>
                      <option value="Chemistry Test">Chemistry Test</option>
                      <option value="Mathematics Test">Mathematics Test</option>
                      <option value="Chapter-wise Test">Chapter-wise Test</option>
                      <option value="Previous Year Paper">Previous Year Paper</option>
                      <option value="Custom Practice Test">Custom Practice Test</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-sm"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Archived">Archived</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Input label="Duration (mins) *" type="number" {...register('duration', { valueAsNumber: true })} error={errors.duration?.message} />
                  </div>
                  <div>
                    <Input label="Total Marks" type="number" {...register('totalMarks', { valueAsNumber: true })} />
                    <p className="text-xs text-slate-500 mt-1">Calculated: {dynamicTotalMarks}</p>
                  </div>
                  <div>
                    <Input label="Passing Marks" type="number" {...register('passingMarks', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Input label="Price (₹)" type="number" {...register('price', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">Question List</h3>
                  <Button onClick={() => setIsSelectorOpen(true)} className="py-1.5 h-auto text-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Questions
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Plus className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="text-slate-900 font-medium">No questions added</h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Click the button above to open the Question Bank and select questions for this mock test.</p>
                  </div>
                ) : (
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={questions.map(q => q._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {questions.map((q, index) => (
                          <SortableQuestionItem
                            key={q._id}
                            id={q._id}
                            question={q}
                            index={index}
                            onRemove={handleRemoveQuestion}
                            onPreview={setPreviewQuestion}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Live Summary</h3>
                <p className="text-xs text-white/60">Test Statistics</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-sm text-white/70">Total Questions</span>
                <span className="font-bold text-lg">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-sm text-white/70">Derived Marks</span>
                <span className="font-bold text-lg">{dynamicTotalMarks}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-sm text-white/70">Duration</span>
                <span className="font-bold text-lg">{formData.duration}m</span>
              </div>
              
              <div className="pt-2">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-3">Subject Distribution</span>
                <div className="space-y-2">
                  {Object.entries(
                    questions.reduce((acc, q) => {
                      const subjectName = q.subject?.name || 'Unknown';
                      acc[subjectName] = (acc[subjectName] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([subject, count]) => (
                    <div key={subject} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{subject}</span>
                      <span className="font-medium bg-white/10 px-2 py-0.5 rounded text-xs">{count}</span>
                    </div>
                  ))}
                  {questions.length === 0 && <span className="text-sm text-white/40 italic">No questions added yet</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuestionSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAddQuestions}
        selectedIds={questions.map(q => q._id)}
      />

      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
      />
    </div>
  );
}

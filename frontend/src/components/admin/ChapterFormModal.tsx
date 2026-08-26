'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateChapter, useUpdateChapter } from '@/services/chapterApi';
import { useGetSubjects } from '@/services/subjectApi';

const chapterSchema = z.object({
  name: z.string().min(2, 'Chapter name must be at least 2 characters'),
  code: z.string().min(2, 'Chapter code must be at least 2 characters').toUpperCase(),
  subject: z.string().min(24, 'Please select a valid subject'),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface ChapterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editChapter?: any;
}

export default function ChapterFormModal({ isOpen, onClose, editChapter }: ChapterFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: '',
      code: '',
      subject: '',
      description: '',
      displayOrder: 0,
      isActive: true,
    }
  });

  const { data: subjectsData } = useGetSubjects(1, ''); // Fetch first page of subjects for the dropdown
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();

  useEffect(() => {
    if (editChapter) {
      reset({
        name: editChapter.name,
        code: editChapter.code,
        subject: typeof editChapter.subject === 'object' ? editChapter.subject._id : editChapter.subject,
        description: editChapter.description || '',
        displayOrder: editChapter.displayOrder || 0,
        isActive: editChapter.isActive,
      });
    } else {
      reset({
        name: '',
        code: '',
        subject: '',
        description: '',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [editChapter, isOpen, reset]);

  const onSubmit = (data: ChapterFormData) => {
    if (editChapter) {
      updateChapter.mutate(
        { id: editChapter._id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      createChapter.mutate(data, { onSuccess: () => onClose() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">
            {editChapter ? 'Edit Chapter' : 'Add New Chapter'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
            <select
              {...register('subject')}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground"
            >
              <option value="">Select a Subject...</option>
              {subjectsData?.subjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            {errors.subject && <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>}
          </div>

          <Input
            label="Chapter Name"
            {...register('name')}
            error={errors.name?.message}
          />
          
          <Input
            label="Chapter Code"
            {...register('code')}
            error={errors.code?.message}
          />
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground"
            />
          </div>

          <Input
            label="Display Order"
            type="number"
            {...register('displayOrder', { valueAsNumber: true })}
            error={errors.displayOrder?.message}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-muted-foreground">
              Chapter is Active
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={createChapter.isPending || updateChapter.isPending}
            >
              {editChapter ? 'Save Changes' : 'Create Chapter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

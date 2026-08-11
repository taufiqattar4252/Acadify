'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateSubject, useUpdateSubject } from '@/services/subjectApi';

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().min(2, 'Subject code must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSubject?: any;
}

export default function SubjectFormModal({ isOpen, onClose, editSubject }: SubjectFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      displayOrder: 0,
      isActive: true,
    }
  });

  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  useEffect(() => {
    if (editSubject) {
      reset({
        name: editSubject.name,
        code: editSubject.code,
        description: editSubject.description || '',
        icon: editSubject.icon || '',
        color: editSubject.color || '#3B82F6',
        displayOrder: editSubject.displayOrder || 0,
        isActive: editSubject.isActive,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [editSubject, isOpen, reset]);

  const onSubmit = (data: SubjectFormData) => {
    if (editSubject) {
      updateSubject.mutate(
        { id: editSubject._id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      createSubject.mutate(data, { onSuccess: () => onClose() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {editSubject ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <Input
            label="Subject Name"
            {...register('name')}
            error={errors.name?.message}
          />
          
          <Input
            label="Subject Code"
            {...register('code')}
            error={errors.code?.message}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
              <input
                type="color"
                {...register('color')}
                className="w-full h-10 px-1 py-1 rounded border border-slate-300 focus:ring-primary-500"
              />
            </div>
            <Input
              label="Display Order"
              type="number"
              {...register('displayOrder', { valueAsNumber: true })}
              error={errors.displayOrder?.message}
            />
          </div>

          <Input
            label="Icon (optional class or URL)"
            {...register('icon')}
            error={errors.icon?.message}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Subject is Active
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={createSubject.isPending || updateSubject.isPending}
            >
              {editSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

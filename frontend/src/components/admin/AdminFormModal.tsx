'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateAdmin, useUpdateAdmin } from '@/services/adminManagementApi';

const adminSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  role: z.enum(['Super Admin', 'Content Admin', 'Support Admin']),
  isActive: z.boolean(),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAdmin?: any;
}

export default function AdminFormModal({ isOpen, onClose, editAdmin }: AdminFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'Content Admin',
      isActive: true,
    }
  });

  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();

  useEffect(() => {
    if (editAdmin) {
      reset({
        fullName: editAdmin.fullName,
        email: editAdmin.email,
        password: '',
        role: editAdmin.role,
        isActive: editAdmin.isActive,
      });
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        role: 'Content Admin',
        isActive: true,
      });
    }
  }, [editAdmin, isOpen, reset]);

  const onSubmit = (data: AdminFormData) => {
    // Remove password if empty (for edits)
    if (!data.password) {
      delete data.password;
    }

    if (editAdmin) {
      updateAdmin.mutate(
        { id: editAdmin._id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      // For create, password is required
      if (!data.password) {
        return; // Alternatively, add strict check to schema for creation mode
      }
      createAdmin.mutate(data, { onSuccess: () => onClose() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">
            {editAdmin ? 'Edit Administrator' : 'Add New Administrator'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="Full Name"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          
          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Input
            label={editAdmin ? "New Password (leave blank to keep current)" : "Password"}
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
            <select
              {...register('role')}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-foreground"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Content Admin">Content Admin</option>
              <option value="Support Admin">Support Admin</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-muted-foreground">
              Account is Active
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={createAdmin.isPending || updateAdmin.isPending}
            >
              {editAdmin ? 'Save Changes' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

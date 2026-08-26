'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useGetAdmins, useDeleteAdmin } from '@/services/adminManagementApi';
import { Button } from '@/components/ui/Button';
import AdminFormModal from '@/components/admin/AdminFormModal';


export default function AdminsPage() {
  const { data: admins, isLoading } = useGetAdmins();
  const deleteAdmin = useDeleteAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  const handleEdit = (admin: any) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
      deleteAdmin.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administrator Management</h2>
          <p className="text-muted-foreground mt-1">Add, edit, or remove platform administrators.</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Admin
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading administrators...
                  </td>
                </tr>
              ) : admins?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                admins?.map((admin: any) => (
                  <tr key={admin._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{admin.fullName}</div>
                      <div className="text-muted-foreground">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'Super Admin' ? 'bg-primary-light text-primary' : 
                        admin.role === 'Content Admin' ? 'bg-primary-light text-primary' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {admin.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00BC7D]"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive-light text-destructive">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(admin)}
                        className="p-1.5 text-muted-foreground hover:text-primary-600 transition-colors bg-white hover:bg-muted rounded"
                        title="Edit Admin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(admin._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors bg-white hover:bg-muted rounded"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editAdmin={selectedAdmin} 
      />
    </div>
  );
}

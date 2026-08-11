'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPartners, createPartner, updatePartnerStatus, deletePartner } from '@/services/adminPartnersApi';
import { Briefcase, CheckCircle, Banknote, Search, Plus, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/currency';

export default function PartnersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    commissionType: 'percentage',
    commissionValue: 15,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['adminPartners'],
    queryFn: getPartners,
  });

  const createMutation = useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
      setIsCreateModalOpen(false);
      toast.success('Partner created successfully');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        commissionType: 'percentage',
        commissionValue: 15,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create partner');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => updatePartnerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartners'] });
      toast.success('Partner deleted');
    },
    onError: () => toast.error('Failed to delete partner'),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const partners = data?.partners || [];
  const stats = data?.stats || {};

  const filteredPartners = partners.filter((p: any) => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Partner Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Partners</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalPartners || 0}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Briefcase size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.totalRevenue || 0)}</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Banknote size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Commission</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.pendingCommission || 0)}</h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
              <Banknote size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid Commission</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.paidCommission || 0)}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Partners</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Commission</th>
                <th className="p-4 font-medium">Referrals</th>
                <th className="p-4 font-medium">Revenue</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No partners found.</td>
                </tr>
              ) : (
                filteredPartners.map((partner: any) => (
                  <tr key={partner._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{partner.fullName}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {partner.commissionType === 'percentage' ? `${partner.commissionValue}%` : formatCurrency(partner.commissionValue)}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{partner.studentsReferred}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(partner.revenueGenerated)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => statusMutation.mutate({ id: partner._id, status: !partner.status })}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${partner.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {partner.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/admin/partners/${partner._id}`} className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this partner?')) {
                            deleteMutation.mutate(partner._id);
                          }
                        }}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Partner">
        <form onSubmit={handleCreateSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 text-black dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 text-black dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 text-black dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 text-black dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Type</label>
              <select value={formData.commissionType} onChange={(e) => setFormData({...formData, commissionType: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 text-black dark:text-white">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Value</label>
              <input required type="number" min="0" max={formData.commissionType === 'percentage' ? 100 : undefined} value={formData.commissionValue} onChange={(e) => setFormData({...formData, commissionValue: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 text-black dark:text-white" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              {createMutation.isPending ? 'Creating...' : 'Create Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

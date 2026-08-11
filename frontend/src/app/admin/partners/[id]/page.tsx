'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPartnerById, 
  generatePartnerCoupon, 
  changePartnerCommission, 
  getPartnerCommissions,
  getPartnerPurchases,
  payCommission 
} from '@/services/adminPartnersApi';
import { Ticket, Banknote, UserPen, CheckCircle, ShoppingCart, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';

export default function PartnerDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  
  const [couponData, setCouponData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 0,
    expiryDate: '',
  });

  const [commissionData, setCommissionData] = useState({
    commissionType: 'percentage',
    commissionValue: 15,
  });

  const { data: partnerData, isLoading: isLoadingPartner } = useQuery({
    queryKey: ['adminPartner', id],
    queryFn: () => getPartnerById(id as string),
  });

  const { data: commissionsData, isLoading: isLoadingCommissions } = useQuery({
    queryKey: ['adminPartnerCommissions', id],
    queryFn: () => getPartnerCommissions(id as string),
    enabled: activeTab === 'commissions'
  });

  const { data: purchasesData, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['adminPartnerPurchases', id],
    queryFn: () => getPartnerPurchases(id as string),
    enabled: activeTab === 'purchases'
  });

  const generateCouponMutation = useMutation({
    mutationFn: (data: any) => generatePartnerCoupon(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartner', id] });
      setIsCouponModalOpen(false);
      toast.success('Coupon generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate coupon');
    }
  });

  const changeCommissionMutation = useMutation({
    mutationFn: (data: any) => changePartnerCommission(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartner', id] });
      setIsCommissionModalOpen(false);
      toast.success('Commission updated successfully');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update commission'),
  });

  const payCommissionMutation = useMutation({
    mutationFn: payCommission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPartnerCommissions', id] });
      queryClient.invalidateQueries({ queryKey: ['adminPartner', id] });
      toast.success('Commission marked as paid');
    },
    onError: () => toast.error('Failed to pay commission'),
  });

  if (isLoadingPartner) return <div className="p-8 text-center text-gray-500">Loading Partner Details...</div>;

  const partner = partnerData?.partner;
  const coupons = partnerData?.coupons || [];

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {partner?.fullName?.charAt(0) || <Briefcase />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{partner?.fullName}</h1>
            <p className="text-gray-500 dark:text-gray-400">{partner?.email} | {partner?.phone}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${partner?.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {partner?.status ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-sm text-gray-500">Current Commission Rate</p>
          <div className="flex items-center gap-2 justify-end">
             <span className="text-xl font-bold text-indigo-600">
               {partner?.commissionType === 'percentage' ? `${partner?.commissionValue}%` : formatCurrency(partner?.commissionValue)}
             </span>
             <button onClick={() => {
               setCommissionData({ commissionType: partner?.commissionType, commissionValue: partner?.commissionValue });
               setIsCommissionModalOpen(true);
             }} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg">
               <UserPen />
             </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'purchases', 'commissions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Total Referrals</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{partner?.studentsReferred}</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Revenue Generated</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(partner?.revenueGenerated)}</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Total Earned</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(partner?.commissionEarned)}</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500">Pending Payout</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(partner?.commissionEarned - partner?.commissionPaid)}</h3>
              </div>
            </div>

            {/* Coupons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Assigned Coupons</h2>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  <Ticket /> Generate Coupon
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="p-4 font-medium">Code</th>
                    <th className="p-4 font-medium">Discount</th>
                    <th className="p-4 font-medium">Expiry Date</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No coupons assigned.</td>
                    </tr>
                  ) : coupons.map((c: any) => (
                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 font-bold text-indigo-600">{c.code}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{format(new Date(c.expiryDate), 'dd MMM yyyy')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Student</th>
                    <th className="p-4 font-medium">Mock Test</th>
                    <th className="p-4 font-medium">Coupon Used</th>
                    <th className="p-4 font-medium text-right">Sale Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoadingPurchases ? (
                     <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                  ) : purchasesData?.purchases?.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center">No purchases recorded.</td></tr>
                  ) : (
                    purchasesData?.purchases?.map((p: any) => (
                      <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
                        <td className="p-4 text-gray-600 dark:text-gray-300">{format(new Date(p.date), 'dd MMM yyyy HH:mm')}</td>
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{p.student?.fullName || p.studentName}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{p.mockTest?.title || p.mockPurchased}</td>
                        <td className="p-4 text-indigo-600 font-medium">{p.couponUsed}</td>
                        <td className="p-4 text-right font-bold text-gray-800 dark:text-gray-200">{formatCurrency(p.purchaseAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="p-4 font-medium">Date Generated</th>
                    <th className="p-4 font-medium">Source (Student - Test)</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoadingCommissions ? (
                     <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                  ) : commissionsData?.commissions?.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center">No commissions recorded.</td></tr>
                  ) : (
                    commissionsData?.commissions?.map((c: any) => (
                      <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
                        <td className="p-4 text-gray-600 dark:text-gray-300">{format(new Date(c.createdAt), 'dd MMM yyyy')}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{c.student?.fullName} - {c.mockTest?.title}</td>
                        <td className="p-4 font-bold text-green-600">{formatCurrency(c.commissionAmount)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            c.status === 'Paid' ? 'bg-green-100 text-green-700' :
                            c.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {c.status === 'Pending' && (
                             <button 
                               onClick={() => payCommissionMutation.mutate(c._id)}
                               disabled={payCommissionMutation.isPending}
                               className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition"
                             >
                               Mark Paid
                             </button>
                          )}
                          {c.status === 'Paid' && (
                             <span className="text-xs text-gray-400">Paid on {format(new Date(c.paidAt), 'dd/MM/yy')}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} title="Generate Coupon for Partner">
        <form onSubmit={(e) => { e.preventDefault(); generateCouponMutation.mutate(couponData); }} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
            <input required type="text" value={couponData.code} onChange={(e) => setCouponData({...couponData, code: e.target.value.toUpperCase()})} placeholder="e.g. PARTNER20" className="w-full border p-2 rounded-lg uppercase dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
              <select value={couponData.discountType} onChange={(e) => setCouponData({...couponData, discountType: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value</label>
              <input required type="number" min="1" value={couponData.discountValue} onChange={(e) => setCouponData({...couponData, discountValue: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Value (₹)</label>
              <input required type="number" min="0" value={couponData.minOrderValue} onChange={(e) => setCouponData({...couponData, minOrderValue: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
              <input required type="date" value={couponData.expiryDate} onChange={(e) => setCouponData({...couponData, expiryDate: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsCouponModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={generateCouponMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              {generateCouponMutation.isPending ? 'Generating...' : 'Generate Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCommissionModalOpen} onClose={() => setIsCommissionModalOpen(false)} title="Change Commission Rate">
        <form onSubmit={(e) => { e.preventDefault(); changeCommissionMutation.mutate(commissionData); }} className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Type</label>
              <select value={commissionData.commissionType} onChange={(e) => setCommissionData({...commissionData, commissionType: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission Value</label>
              <input required type="number" min="1" max={commissionData.commissionType === 'percentage' ? 100 : undefined} value={commissionData.commissionValue} onChange={(e) => setCommissionData({...commissionData, commissionValue: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsCommissionModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={changeCommissionMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

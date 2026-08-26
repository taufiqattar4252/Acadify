'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetStudentPurchases } from '@/services/studentApi';
import { ShoppingBag, FileText, IndianRupee, Clock, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PurchasesPage() {
  const router = useRouter();
  const { data, isLoading } = useGetStudentPurchases();

  const purchases = data?.purchases || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Purchase History</h1>
        <p className="text-sm text-muted-foreground mt-1">View your purchased mock tests and payment records.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl shadow-lumina border-transparent overflow-hidden">
          <div className="p-6 border-b border-border">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-transparent shadow-lumina">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No purchases found</h3>
          <p className="text-muted-foreground mt-1">You haven't purchased any mock tests yet.</p>
          <Button variant="secondary" className="mt-6 mx-auto rounded-full px-6" onClick={() => router.push('/dashboard/mock-tests')}>
            Explore Mock Store
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lumina border-transparent overflow-hidden relative">
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mock Test</th>
                  <th className="px-6 py-4 font-semibold">Purchase Date</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground text-base">{purchase.mockTest?.title || 'Unknown Test'}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {purchase.mockTest?.category || 'Mock Test'} • {purchase.mockTest?.duration || 0} mins
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-muted-foreground">
                      {new Date(purchase.purchaseDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5 font-bold text-foreground flex items-center h-full mt-2">
                      <IndianRupee className="w-4 h-4 mr-0.5" /> {purchase.amountPaid}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border
                        ${purchase.status === 'completed' ? 'bg-success-light text-success border-emerald-100' : 
                          purchase.status === 'pending' ? 'bg-warning-light text-warning border-amber-100' :
                          'bg-destructive-light text-destructive border-red-100'}`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        {purchase.status === 'completed' && (
                          <>
                            <Button 
                              className="px-4 py-2 text-xs rounded-full" 
                              variant="secondary"
                              onClick={() => router.push(`/dashboard/purchases/${purchase.payment}/invoice`)}
                            >
                              <FileText className="w-4 h-4 mr-1.5 text-muted-foreground" /> Invoice
                            </Button>
                            <Button 
                              className="px-4 py-2 text-xs rounded-full" 
                              variant="secondary"
                              onClick={() => router.push(`/dashboard/mock-tests/${purchase.mockTest?.slug}`)}
                            >
                              View Test
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

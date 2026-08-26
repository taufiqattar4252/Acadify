'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetPurchaseDetails } from '@/services/adminPurchaseApi';
import { ArrowLeft, Printer, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: purchase, isLoading, isError } = useGetPurchaseDetails(id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !purchase) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-border">
        <h3 className="text-lg font-bold text-foreground">Purchase Not Found</h3>
        <p className="text-muted-foreground mt-1">We couldn't find the requested purchase details.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/admin/purchases')}>
          Back to Purchases
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const payment = purchase.payment || {};

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back</span>
        </button>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-border pb-8 mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">INVOICE</h1>
            <p className="text-muted-foreground mt-1">Receipt for student purchase</p>
          </div>
          <div className="text-right">
            {purchase.status === 'completed' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-success-light text-success rounded-full text-sm font-medium mb-3">
                <CheckCircle2 className="w-4 h-4" /> Paid & Active
              </div>
            ) : purchase.status === 'refunded' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning-light text-warning rounded-full text-sm font-medium mb-3">
                <XCircle className="w-4 h-4" /> Refunded
              </div>
            ) : purchase.status === 'revoked' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive-light text-destructive rounded-full text-sm font-medium mb-3">
                <XCircle className="w-4 h-4" /> Revoked
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium mb-3">
                <CheckCircle2 className="w-4 h-4" /> {purchase.status}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-bold text-foreground">{payment.orderId || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-2">Billed To:</p>
            <h3 className="font-bold text-foreground">{purchase.user?.fullName || 'N/A'}</h3>
            <p className="text-muted-foreground">{purchase.user?.email || 'N/A'}</p>
            {purchase.user?.phone && <p className="text-muted-foreground">{purchase.user.phone}</p>}
          </div>
          <div className="md:text-right">
            <p className="text-sm text-muted-foreground font-medium mb-2">Payment Details:</p>
            <div className="space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Date:</span> {new Date(purchase.purchaseDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><span className="font-medium text-foreground">Gateway:</span> {payment.paymentGateway || 'N/A'}</p>
              <p><span className="font-medium text-foreground">Transaction ID:</span> {payment.paymentId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Item Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-4">
                  <span className="font-bold text-foreground block mb-1">{purchase.mockTest?.title || 'Unknown Test'}</span>
                  <span className="text-xs text-muted-foreground">{purchase.mockTest?.category || 'General'}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  ₹{Number(purchase.amountPaid?.$numberDecimal || purchase.amountPaid || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-muted border-t border-border">
              <tr>
                <td className="px-6 py-4 font-bold text-foreground text-right">Total Paid</td>
                <td className="px-6 py-4 text-right font-bold text-foreground text-lg">
                  ₹{Number(purchase.amountPaid?.$numberDecimal || purchase.amountPaid || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center text-muted-foreground text-sm mt-12 pt-8 border-t border-border">
          <p>Acadify Administrator Invoice View</p>
        </div>
      </div>
    </div>
  );
}

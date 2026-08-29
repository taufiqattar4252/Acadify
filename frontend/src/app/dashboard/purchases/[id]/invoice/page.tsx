'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetPaymentDetails } from '@/services/paymentApi';
import { ArrowLeft, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError } = useGetPaymentDetails(id);
  const payment = data?.payment;
  const purchases = data?.purchases || [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-border">
        <h3 className="text-lg font-bold text-foreground">Invoice Not Found</h3>
        <p className="text-muted-foreground mt-1">We couldn't find the requested payment details.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard/purchases')}>
          Back to Purchases
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

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
            <p className="text-muted-foreground mt-1">Receipt for your purchase</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-success-light text-success rounded-full text-sm font-medium mb-3">
              <CheckCircle2 className="w-4 h-4" /> Paid
            </div>
            <p className="text-sm text-muted-foreground">Invoice Number</p>
            <p className="font-bold text-foreground">{payment.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-2">Billed To:</p>
            <h3 className="font-bold text-foreground">{payment.user.fullName}</h3>
            <p className="text-muted-foreground">{payment.user.email}</p>
            {payment.user.phone && <p className="text-muted-foreground">{payment.user.phone}</p>}
          </div>
          <div className="md:text-right">
            <p className="text-sm text-muted-foreground font-medium mb-2">Payment Details:</p>
            <div className="space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Date:</span> {new Date(payment.transactionDate || payment.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><span className="font-medium text-foreground">Gateway:</span> Razorpay</p>
              <p><span className="font-medium text-foreground">Transaction ID:</span> {payment.paymentId}</p>
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
              {purchases.map((purchase: any) => (
                <tr key={purchase._id}>
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground block mb-1">{purchase.mockTest?.title || 'Unknown Test'}</span>
                    <span className="text-xs text-muted-foreground">{purchase.mockTest?.category || 'Mock Test'}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    ₹{purchase.amountPaid?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted border-t border-border">
              <tr>
                <td className="px-6 py-4 font-bold text-foreground text-right">Total Paid</td>
                <td className="px-6 py-4 text-right font-bold text-foreground text-lg">
                  ₹{payment.amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center text-muted-foreground text-sm mt-12 pt-8 border-t border-border">
          <p>Thank you for your purchase!</p>
          <p className="mt-1">If you have any questions about this invoice, please contact support.</p>
        </div>
      </div>
    </div>
  );
}

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

  const { data: payment, isLoading, isError } = useGetPaymentDetails(id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Invoice Not Found</h3>
        <p className="text-slate-500 mt-1">We couldn't find the requested payment details.</p>
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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
            <p className="text-slate-500 mt-1">Receipt for your purchase</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-3">
              <CheckCircle2 className="w-4 h-4" /> Paid
            </div>
            <p className="text-sm text-slate-500">Invoice Number</p>
            <p className="font-bold text-slate-900">{payment.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-2">Billed To:</p>
            <h3 className="font-bold text-slate-900">{payment.user.fullName}</h3>
            <p className="text-slate-600">{payment.user.email}</p>
            {payment.user.phone && <p className="text-slate-600">{payment.user.phone}</p>}
          </div>
          <div className="md:text-right">
            <p className="text-sm text-slate-500 font-medium mb-2">Payment Details:</p>
            <div className="space-y-1 text-slate-600">
              <p><span className="font-medium text-slate-900">Date:</span> {new Date(payment.transactionDate || payment.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><span className="font-medium text-slate-900">Gateway:</span> Razorpay</p>
              <p><span className="font-medium text-slate-900">Transaction ID:</span> {payment.paymentId}</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Item Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900 block mb-1">{payment.mockTest.title}</span>
                  <span className="text-xs text-slate-500">{payment.mockTest.category}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  ₹{payment.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td className="px-6 py-4 font-bold text-slate-900 text-right">Total Paid</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">
                  ₹{payment.amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center text-slate-500 text-sm mt-12 pt-8 border-t border-slate-100">
          <p>Thank you for your purchase!</p>
          <p className="mt-1">If you have any questions about this invoice, please contact support.</p>
        </div>
      </div>
    </div>
  );
}

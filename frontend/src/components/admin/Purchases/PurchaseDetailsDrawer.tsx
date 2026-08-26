'use client';

import React from 'react';
import { X, ExternalLink, RefreshCw, Mail, CheckCircle2, XCircle, Trash2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import clsx from 'clsx';
import { useGetPurchaseDetails } from '@/services/adminPurchaseApi';

interface PurchaseDetailsDrawerProps {
  purchaseId: string | null;
  onClose: () => void;
  onGrantAccess: (id: string) => void;
  onRevokeAccess: (id: string) => void;
  onRefund: (id: string) => void;
  onResendEmail: (id: string) => void;
  onDelete: (id: string) => void;
  onViewInvoice: (id: string) => void;
  isSuperAdmin: boolean;
  isActionLoading: boolean;
}

export function PurchaseDetailsDrawer({
  purchaseId,
  onClose,
  onGrantAccess,
  onRevokeAccess,
  onRefund,
  onResendEmail,
  onDelete,
  onViewInvoice,
  isSuperAdmin,
  isActionLoading
}: PurchaseDetailsDrawerProps) {
  
  const { data: purchase, isLoading, isError } = useGetPurchaseDetails(purchaseId);

  if (!purchaseId) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Purchase Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Spinner size="xl" />
            </div>
          ) : isError || !purchase ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load purchase details.</p>
            </div>
          ) : (
            <>
              {/* Student Info */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Student Information</h3>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                    {purchase.user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{purchase.user?.fullName || 'N/A'}</h4>
                    <p className="text-sm text-muted-foreground">{purchase.user?.email || 'N/A'}</p>
                    {purchase.user?.phone && <p className="text-sm text-muted-foreground">{purchase.user.phone}</p>}
                  </div>
                </div>
              </section>

              {/* Purchase Info */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Purchase Information</h3>
                <div className="space-y-3 p-4 rounded-xl border border-border">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mock Test</span>
                    <span className="text-sm font-medium text-foreground">{purchase.mockTest?.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium text-foreground">{purchase.mockTest?.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Paid</span>
                    <span className="text-sm font-bold text-success">₹{purchase.amountPaid?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Purchase Date</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(purchase.purchaseDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </section>

              {/* Payment Info */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Payment Information</h3>
                <div className="space-y-3 p-4 rounded-xl border border-border">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="text-sm font-medium text-foreground font-mono text-xs">{purchase.payment?.orderId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment ID</span>
                    <span className="text-sm font-medium text-foreground font-mono text-xs">{purchase.payment?.paymentId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <span className="text-sm font-medium text-foreground capitalize">{purchase.payment?.paymentGateway || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={clsx(
                      "text-xs font-bold px-2 py-0.5 rounded-md",
                      purchase.payment?.status === 'success' ? "bg-success-light text-success" :
                      purchase.payment?.status === 'refunded' ? "bg-warning-light text-warning" :
                      purchase.payment?.status === 'failed' ? "bg-destructive-light text-destructive" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {(purchase.payment?.status || 'N/A').toUpperCase()}
                    </span>
                  </div>
                </div>
              </section>
              
              {/* Access Info */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Access Information</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50">
                  <div>
                    <span className="block text-sm text-muted-foreground mb-1">Access Status</span>
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-md",
                      purchase.status === 'completed' ? "bg-success-light text-success" :
                      purchase.status === 'revoked' ? "bg-destructive-light text-destructive" :
                      "bg-muted-hover text-muted-foreground"
                    )}>
                      {purchase.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {purchase.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && purchase && (
          <div className="p-6 border-t border-border bg-muted/50 flex flex-wrap gap-3">
            <Button 
              variant="secondary" 
              className="flex-1 min-w-[140px] gap-2"
              onClick={() => onViewInvoice(purchase._id)}
            >
              <Printer className="w-4 h-4" /> Invoice
            </Button>
            
            <Button 
              variant="secondary" 
              className="flex-1 min-w-[140px] gap-2"
              onClick={() => onResendEmail(purchase._id)}
              disabled={isActionLoading}
            >
              <Mail className="w-4 h-4" /> Resend Email
            </Button>

            {purchase.status !== 'revoked' && purchase.status !== 'refunded' && (
              <Button 
                variant="secondary" 
                className="flex-1 min-w-[140px] gap-2 text-warning hover:text-warning hover:bg-warning-light"
                onClick={() => onRevokeAccess(purchase._id)}
                disabled={isActionLoading}
              >
                <XCircle className="w-4 h-4" /> Revoke Access
              </Button>
            )}

            {purchase.status === 'revoked' && (
              <Button 
                variant="secondary" 
                className="flex-1 min-w-[140px] gap-2 text-success hover:text-success hover:bg-success-light"
                onClick={() => onGrantAccess(purchase._id)}
                disabled={isActionLoading}
              >
                <CheckCircle2 className="w-4 h-4" /> Grant Access
              </Button>
            )}

            {purchase.status !== 'refunded' && purchase.payment?.status === 'success' && (
              <Button 
                variant="secondary" 
                className="flex-1 min-w-[140px] gap-2 text-warning hover:text-warning hover:bg-warning-light"
                onClick={() => onRefund(purchase._id)}
                disabled={isActionLoading}
              >
                <RefreshCw className="w-4 h-4" /> Refund Payment
              </Button>
            )}

            {isSuperAdmin && (
              <Button 
                variant="danger" 
                className="w-full mt-2 gap-2"
                onClick={() => onDelete(purchase._id)}
                disabled={isActionLoading}
              >
                <Trash2 className="w-4 h-4" /> Delete Purchase
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

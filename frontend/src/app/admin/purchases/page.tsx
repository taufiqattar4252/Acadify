'use client';

import React, { useState, useMemo } from 'react';
import { useUser } from '@/services/authApi';
import { 
  useGetPurchases, 
  useGrantAccess, 
  useRevokeAccess, 
  useRefundPurchase, 
  useResendEmail, 
  useDeletePurchase 
} from '@/services/adminPurchaseApi';
import { PurchasesTable } from '@/components/admin/Purchases/PurchasesTable';
import { PurchaseDetailsDrawer } from '@/components/admin/Purchases/PurchaseDetailsDrawer';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { Download, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function PurchasesPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isFinanceAdmin = user?.role === 'Finance Admin';
  const isSupportAdmin = user?.role === 'Support Admin';

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'purchaseDate', desc: true }]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filters
  const [category, setCategory] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  // Mutations
  const grantAccess = useGrantAccess();
  const revokeAccess = useRevokeAccess();
  const refundPurchase = useRefundPurchase();
  const resendEmail = useResendEmail();
  const deletePurchase = useDeletePurchase();

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useGetPurchases({
    page: pageIndex + 1,
    limit: pageSize,
    search: debouncedSearch,
    category,
    paymentStatus,
    sortBy: sorting.length > 0 ? sorting[0].id : 'purchaseDate',
    sortOrder: sorting.length > 0 && sorting[0].desc ? 'desc' : 'asc'
  });

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (category) params.append('category', category);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      params.append('format', format);
      
      window.location.href = `/api/admin/purchases/export?${params.toString()}`;
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: 'srNo',
      header: 'Sr No',
      cell: info => <span className="text-muted-foreground">{pageIndex * pageSize + info.row.index + 1}</span>,
      enableSorting: false,
    },
    {
      accessorKey: '_id',
      header: 'Purchase ID',
      cell: info => <span className="font-mono text-xs text-muted-foreground">{info.getValue().toString().slice(-8)}</span>,
      enableSorting: false,
    },
    {
      accessorFn: row => row.user?.fullName,
      id: 'studentName',
      header: 'Student Name',
      cell: info => <span className="font-medium text-foreground">{info.getValue() || 'N/A'}</span>,
    },
    {
      accessorFn: row => row.mockTest?.title,
      id: 'mockTest',
      header: 'Mock Test',
      cell: info => (
        <div>
          <span className="font-medium text-foreground block">{info.getValue() || 'N/A'}</span>
          <span className="text-xs text-muted-foreground">{info.row.original.mockTest?.category || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amountPaid',
      header: 'Amount',
      cell: info => <span className="font-bold text-success">₹{Number(info.getValue() || 0).toFixed(2)}</span>,
    },
    {
      accessorFn: row => row.payment?.status,
      id: 'paymentStatus',
      header: 'Payment',
      cell: info => {
        const status = info.getValue() || 'N/A';
        return (
          <span className={clsx(
            "text-xs font-bold px-2 py-0.5 rounded-md uppercase",
            status === 'success' ? "bg-success-light text-success" :
            status === 'refunded' ? "bg-warning-light text-warning" :
            status === 'failed' ? "bg-destructive-light text-destructive" :
            "bg-muted text-muted-foreground"
          )}>
            {status}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Access',
      cell: info => {
        const status = info.getValue();
        return (
          <span className={clsx(
            "text-xs font-bold px-2 py-0.5 rounded-md uppercase",
            status === 'completed' ? "bg-success-light text-success" :
            status === 'revoked' ? "bg-destructive-light text-destructive" :
            "bg-muted-hover text-muted-foreground"
          )}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'purchaseDate',
      header: 'Date',
      cell: info => <span className="text-sm text-muted-foreground">{info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A'}</span>,
    }
  ], [pageIndex, pageSize]);

  const handleAction = async (action: any, id: string, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    
    try {
      await action.mutateAsync(id);
      toast.success('Action completed successfully');
      if (action === deletePurchase) setSelectedPurchaseId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const isActionLoading = grantAccess.isPending || revokeAccess.isPending || refundPurchase.isPending || resendEmail.isPending || deletePurchase.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Purchases</h1>
          <p className="text-muted-foreground mt-1">Manage and inspect all student purchases.</p>
        </div>
        
        {(isSuperAdmin || isFinanceAdmin) && (
          <div className="flex gap-2">
            <Button variant="secondary" className="gap-2" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, name, email, mock test..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className={clsx(showFilters && "bg-muted")}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPageIndex(0); }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPageIndex(0); }}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Categories</option>
              <option value="Full Mock Test">Full Mock Test</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Chapter Test">Chapter Test</option>
            </select>
          </div>
          <div className="flex items-end md:col-span-2 justify-end">
            <Button variant="secondary" onClick={() => { setPaymentStatus(''); setCategory(''); setSearch(''); setPageIndex(0); }} className="text-muted-foreground">
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <PurchasesTable
        data={data?.purchases || []}
        columns={columns}
        pageCount={data?.pagination?.pages || 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedPurchaseId(row._id)}
      />

      <PurchaseDetailsDrawer
        purchaseId={selectedPurchaseId}
        onClose={() => setSelectedPurchaseId(null)}
        isSuperAdmin={isSuperAdmin}
        isActionLoading={isActionLoading}
        onGrantAccess={(id) => handleAction(grantAccess, id, 'Are you sure you want to grant access?')}
        onRevokeAccess={(id) => handleAction(revokeAccess, id, 'Are you sure you want to revoke access?')}
        onRefund={(id) => handleAction(refundPurchase, id, 'Are you sure you want to refund this purchase?')}
        onResendEmail={(id) => handleAction(resendEmail, id)}
        onDelete={(id) => handleAction(deletePurchase, id, 'Are you sure you want to permanently delete this purchase? This cannot be undone.')}
        onViewInvoice={(id) => router.push(`/admin/purchases/${id}/invoice`)}
      />
    </div>
  );
}

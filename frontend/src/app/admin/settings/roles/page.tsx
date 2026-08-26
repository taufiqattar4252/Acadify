'use client';

import React from 'react';
import { Shield, Check, X, AlertCircle } from 'lucide-react';
import { useUser } from '@/services/authApi';

const rolesData = [
  {
    name: 'Super Admin',
    description: 'Full access to all system modules, including payments and security.',
    permissions: [
      { name: 'User Management', allowed: true },
      { name: 'Exam Engine', allowed: true },
      { name: 'Notifications', allowed: true },
      { name: 'Payments', allowed: true },
      { name: 'Security & Settings', allowed: true },
    ]
  },
  {
    name: 'Content Admin',
    description: 'Can manage exams, questions, subjects, and basic settings.',
    permissions: [
      { name: 'User Management', allowed: true },
      { name: 'Exam Engine', allowed: true },
      { name: 'Notifications', allowed: true },
      { name: 'Payments', allowed: false },
      { name: 'Security & Settings', allowed: false },
    ]
  },
  {
    name: 'Support Admin',
    description: 'Can view user issues and respond to queries. Read-only access to most modules.',
    permissions: [
      { name: 'User Management', allowed: true },
      { name: 'Exam Engine', allowed: false },
      { name: 'Notifications', allowed: false },
      { name: 'Payments', allowed: false },
      { name: 'Security & Settings', allowed: false },
    ]
  }
];

export default function RolesSettingsPage() {
  const { data: user } = useUser();
  const isSuperAdmin = user?.role === 'Super Admin';

  return (
    <div className="p-8">
      <div className="flex justify-between items-center border-b border-border pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground mt-1">Review the access levels for different administrative roles.</p>
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="mb-8 p-4 bg-destructive-light border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Read Only</h4>
            <p className="text-xs text-destructive mt-1">You can view these permissions but cannot modify them.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {rolesData.map((role) => (
          <div key={role.name} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{role.name}</h3>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {role.permissions.map((perm) => (
                  <div key={perm.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground">{perm.name}</span>
                    {perm.allowed ? (
                      <div className="w-6 h-6 rounded-full bg-success-light flex items-center justify-center text-success">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <X className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

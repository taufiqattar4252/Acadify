'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { RevenueData } from '@/services/adminApi';

interface RevenueChartProps {
  data: RevenueData[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const padding = maxRevenue * 0.15; // 15% headroom
    const totalHeight = maxRevenue + padding || 100;
    
    return data.map(d => ({
      ...d,
      remaining: totalHeight - d.revenue
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barCategoryGap="15%"
        >
          <defs>
            <pattern id="diagonalHatchAdmin" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#1D293D" fillOpacity="0.1" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#1D293D" strokeWidth="2" strokeOpacity="0.2" />
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
            dx={-10}
          />
          <RechartsTooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
            formatter={(value: any, name: any) => {
              if (name === 'remaining') return [];
              return [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Completed'];
            }}
          />
          <Bar dataKey="revenue" stackId="a" fill="#1D293D" radius={[0, 0, 8, 8]} />
          <Bar dataKey="remaining" stackId="a" fill="url(#diagonalHatchAdmin)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

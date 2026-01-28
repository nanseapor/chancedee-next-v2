"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyView } from '@/types/jobsmarket/job-detail.types';

interface JobViewsChartProps {
  dailyViews: DailyView[];
}

export function JobViewsChart({ dailyViews }: JobViewsChartProps) {
  // Format data for chart
  const chartData = dailyViews.map((item) => ({
    date: new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    views: item.views,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-medium tracking-wide leading-normal">
          การเข้าชม 30 วันล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            ยังไม่มีข้อมูลการเข้าชม
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#111827' }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

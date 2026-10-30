import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#6366f1', '#f97316', '#10b981', '#ec4899', '#3b82f6', '#eab308', '#14b8a6', '#8b5cf6', '#ef4444', '#64748b'];

/** data: [{ category: 'Food', total: 1200 }, ...] */
const CategoryPieChart = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.category),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
          borderWidth: 3,
          borderColor: dark ? '#0b0b0c' : '#ffffff',
          hoverOffset: 6,
        },
      ],
    }),
    [data, dark]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14, color: dark ? 'rgba(255,255,255,.7)' : '#4b5563', font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.raw;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${ctx.label}: ₹${value.toLocaleString('en-IN')} (${pct}%)`;
            },
          },
        },
      },
    }),
    [dark]
  );

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Expenses by Category</h2>
      <div className="h-72 sm:h-80">
        {data.length === 0 ? (
          <p className="pt-24 text-center text-sm text-gray-400 dark:text-white/40">No expense data yet.</p>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default CategoryPieChart;

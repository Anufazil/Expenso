import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatMonthLabel = (ym) => {
  const [year, month] = ym.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

/** data: [{ month: '2025-01', income: 5000, expense: 3200 }, ...] */
const MonthlyBarChart = ({ data, onSelectMonth }) => {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const tick = dark ? 'rgba(255,255,255,.55)' : '#6b7280';

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => formatMonthLabel(d.month)),
      datasets: [
        { label: 'Income', data: data.map((d) => d.income), backgroundColor: '#10b981', borderRadius: 8, borderSkipped: false },
        { label: 'Expense', data: data.map((d) => d.expense), backgroundColor: '#ff2a85', borderRadius: 8, borderSkipped: false },
      ],
    }),
    [data]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_evt, elements) => {
        if (onSelectMonth && elements.length) onSelectMonth(data[elements[0].index].month);
      },
      onHover: (evt, elements) => {
        if (onSelectMonth && evt.native?.target) evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, color: dark ? 'rgba(255,255,255,.7)' : '#4b5563', font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tick } },
        y: {
          beginAtZero: true,
          grid: { color: dark ? 'rgba(255,255,255,.08)' : '#f3f4f6' },
          border: { display: false },
          ticks: { color: tick, callback: (value) => `₹${value}` },
        },
      },
    }),
    [dark, tick, data, onSelectMonth]
  );

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Monthly Income vs Expense</h2>
      <p className="mb-4 mt-0.5 text-xs text-gray-500 dark:text-white/40">
        {onSelectMonth ? 'Tip: click a bar to open that month\'s full report' : ' '}
      </p>
      <div className="h-72 sm:h-80">
        {data.length === 0 ? (
          <p className="pt-24 text-center text-sm text-gray-400 dark:text-white/40">No transaction data yet.</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default MonthlyBarChart;

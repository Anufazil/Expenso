import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatMonthLabel = (ym) => {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

/**
 * data: [{ month: '2025-01', income: 5000, expense: 3200 }, ...]
 */
const MonthlyBarChart = ({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => formatMonthLabel(d.month)),
      datasets: [
        {
          label: 'Income',
          data: data.map((d) => d.income),
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
        {
          label: 'Expense',
          data: data.map((d) => d.expense),
          backgroundColor: '#ef4444',
          borderRadius: 6,
        },
      ],
    }),
    [data]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `₹${value}` },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Income vs Expense</h2>
      <div className="h-72">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center pt-24">No transaction data yet.</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default MonthlyBarChart;

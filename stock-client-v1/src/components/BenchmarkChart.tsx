import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


interface BenchmarkChartProps {
  chartData: any;
  benchmark: string;
  loading: boolean;
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ chartData, benchmark, loading }) => (
  <>
    {loading ? (
      <div
        style={{
          height: 400,
          width: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <p style={{ fontSize: '1.5rem', color: '#888' }}>Loading chart...</p>
      </div>
    ) : chartData ? (
      <Line
        data={chartData}
        height={400}
        width={1200}
        options={{
          responsive: true,
          plugins: { legend: { display: true } },
          scales: {
            x: { display: true, title: { display: true, text: 'Date' } },
            y: {
              display: true,
              title: { display: true, text: 'Returns (%)' },
              ticks: {
                callback: (value: number | string) => `${(Number(value) * 100).toFixed(1)}%`,
              },
            },
          },
        }}
      />
    ) : null}
  </>
);

export default BenchmarkChart;
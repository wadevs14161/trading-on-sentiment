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
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e9ecef',
        }}
      >
        <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>Loading chart...</p>
      </div>
    ) : chartData ? (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef',
        padding: '20px',
        margin: '0 auto'
      }}>
        <Line
          data={chartData}
          height={400}
          width={1200}
          options={{
            responsive: true,
            plugins: { 
              legend: { 
                display: true,
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  color: '#495057'
                }
              } 
            },
            scales: {
              x: { 
                display: true, 
                title: { 
                  display: true, 
                  text: 'Date',
                  color: '#6c757d'
                },
                ticks: {
                  color: '#6c757d'
                },
                grid: {
                  color: '#e9ecef'
                }
              },
              y: {
                display: true,
                title: { 
                  display: true, 
                  text: 'Returns (%)',
                  color: '#6c757d'
                },
                ticks: {
                  callback: (value: number | string) => `${(Number(value) * 100).toFixed(1)}%`,
                  color: '#6c757d'
                },
                grid: {
                  color: '#e9ecef'
                }
              },
            },
          }}
        />
      </div>
    ) : null}
  </>
);

export default BenchmarkChart;
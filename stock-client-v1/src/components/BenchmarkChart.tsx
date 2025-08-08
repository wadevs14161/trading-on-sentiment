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
        boxShadow: 'none',
        border: '1px solid #e9ecef',
        padding: '24px',
        margin: '0 auto'
      }}>
        <Line
          data={chartData}
          height={350}
          width={1200}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: { 
              legend: { 
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 24,
                  color: '#495057',
                  font: {
                    size: 13,
                    weight: 500
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#e9ecef',
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(2)}%`;
                  }
                }
              }
            },
            scales: {
              x: { 
                display: true, 
                title: { 
                  display: true, 
                  text: 'Date',
                  color: '#6c757d',
                  font: {
                    size: 12,
                    weight: 500
                  }
                },
                ticks: {
                  color: '#6c757d',
                  font: {
                    size: 11
                  },
                  maxTicksLimit: 8, // Limit to max 8 date labels
                  maxRotation: 45, // Rotate labels for better fit
                  minRotation: 0
                },
                grid: {
                  display: false // Remove vertical grid lines for cleaner look
                }
              },
              y: {
                display: true,
                title: { 
                  display: true, 
                  text: 'Cumulative Returns (%)',
                  color: '#6c757d',
                  font: {
                    size: 12,
                    weight: 500
                  }
                },
                ticks: {
                  callback: (value: number | string) => `${(Number(value) * 100).toFixed(1)}%`,
                  color: '#6c757d',
                  font: {
                    size: 11
                  },
                  maxTicksLimit: 8 // Limit y-axis ticks too
                },
                grid: {
                  color: '#f8f9fa', // Very light gray for horizontal grid
                  lineWidth: 1
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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StockData {
    date: string;
    ticker: string;
    open_price: string;
    close_price: string;
    high_price: string;
    low_price: string;
    volume: number;
}

const StockChart: React.FC = () => {
const [stockData, setStockData] = useState<StockData[]>([]);
const [loading, setLoading] = useState<boolean>(true);

// Adjust the URL to your backend endpoint as needed.
useEffect(() => {
    axios.get<StockData[]>('http://localhost:8000/api_v1/stock-price-history/?ticker=QQQ&start_date=2021-01-01&end_date=2022-01-01') // use your actual endpoint URL here
    .then(response => {
    setStockData(response.data);
    setLoading(false);
})
.catch(error => {
    console.error('Error fetching stock data:', error);
    setLoading(false);
});
}, []);

// Prepare data for Chart.js
const chartData = {
    labels: stockData.map(data => data.date),  // x-axis: dates
    datasets: [
        {
            label: 'Close Price',
            data: stockData.map(data => parseFloat(data.close_price)),  // y-axis: parsed close_price values
            fill: false,
            borderColor: 'rgb(77, 75, 192)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            tension: 0.1,
            pointRadius: 0,
        },
    ],
};

const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
    legend: {
        position: 'top',
    },
    title: {
        display: true,
        text: 'Stock Close Price Over Time',
    },
    },
    scales: {
        x: {
            title: { display: true, text: 'Date' },
        },
        y: {
            title: { display: true, text: 'Close Price' },
        },
    },
};

if (loading) return <div>Loading...</div>;

return (
    <div>
        <Line data={chartData} options={options} />
    </div>
);
};

export default StockChart;
import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  CssBaseline,
  Box,
  Toolbar,
  Typography
} from '@mui/material';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import BenchmarkChart from './components/BenchmarkChart';
import TickersByDateTable from './components/TickersTable';

// Import the components for routing
import About from './components/About';

// Import the API function to fetch portfolio returns
import { portfolioReturns } from './api/PortfolioBenchMark';


const drawerWidth = 240; // Width of the sidebar drawer

// Define a mapping from indicator value to label at the top of your file or inside the component
const indicatorLabels: Record<string, string> = {
  engagement_ratio: 'Engagement Ratio',
  total_sentiment: 'Sentiment',
  comms_num: 'Most Comments in Posts',
  score: 'Top Score in Posts'
};

const marketIndexLabels: Record<string, string> = {
  QQQ: 'S&P 500',
};

function App() {
  const [chartData, setChartData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: '2021-03-01', end: '2021-08-31' });
  const [indicator, setIndicator] = useState('total_sentiment'); // Use value, not label
  const [benchmark, setBenchmark] = useState('QQQ');
  const [loading, setLoading] = useState(false);
  const [tickersByDate, setTickersByDate] = useState<any[]>([]);
  
  // State for highest return and its date
  const [highestReturn, setHighestReturn] = useState<number | null>(null);
  const [highestReturnDate, setHighestReturnDate] = useState<string | null>(null);

  // State for percentage of days with return greater than market index
  const [percentageDaysGreaterThanMarket, setPercentageDaysGreaterThanMarket] = useState<number | null>(null);

  // Loading state for metrics
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Loading state for tickers table
  const [tickersLoading, setTickersLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMetricsLoading(true);
    setTickersLoading(true);
    portfolioReturns({
      start_date: dateRange.start,
      end_date: dateRange.end,
      market_index: benchmark,
      indicator: indicator,
    }).then(data => {
      // console.log('Portfolio returns data:', data);
      // Expecting: { portfolio_returns: Array, ... }
      let array: any[] = [];
      if (Array.isArray(data.portfolio_returns)) {
        array = data.portfolio_returns;
        // console.log('First 5 items from portfolio returns:', array.slice(0, 5));
      } else {
        console.error('API did not return an array:', data);
        return;
      }

      // Use 'index' as the date label
      const labels = array.map((item: any) => item.index);
      const portfolioReturnsArr = array.map((item: any) => item.portfolio_return);
      const marketIndexReturns = array.map((item: any) => item[benchmark]);

      // Find the highest return value in the portfolio returns and its corresponding date
      const highestReturnValue = Math.max(...portfolioReturnsArr);
      const highestReturnIndex = portfolioReturnsArr.indexOf(highestReturnValue);
      const highestReturnDateValue = labels[highestReturnIndex];

      // Calculate the percentage of days with return greater than market index
      const daysGreaterThanMarket = portfolioReturnsArr.filter((returnValue, index) => returnValue > marketIndexReturns[index]).length;
      const totalDays = portfolioReturnsArr.length;
      const percentageDays = totalDays > 0 ? (daysGreaterThanMarket / totalDays) * 100 : 0;
      setPercentageDaysGreaterThanMarket(percentageDays);

      setHighestReturn(highestReturnValue);
      setHighestReturnDate(highestReturnDateValue);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Portfolio Return',
            data: portfolioReturnsArr,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.1,
          },
          {
            label: benchmark,
            data: marketIndexReturns,
            borderColor: 'rgba(255,99,132,1)',
            backgroundColor: 'rgba(255,99,132,0.2)',
            tension: 0.1,
          },
        ],
      });
      setTickersByDate(data.tickers_by_date || []);
      setLoading(false);
      setMetricsLoading(false);
      setTickersLoading(false);
    }).catch(error => {
      console.error('Error fetching portfolio returns:', error);
      setLoading(false);
      setMetricsLoading(false);
      setTickersLoading(false);
    });
  }, [dateRange, indicator, benchmark]);

  return (
    <Router>
      <NavBar />
      <Toolbar /> {/* Spacer for fixed AppBar */}
      <Routes>
        <Route path="/" element={
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Sidebar
              dateRange={dateRange}
              setDateRange={setDateRange}
              indicator={indicator}
              setIndicator={setIndicator}
              benchmark={benchmark}
              setBenchmark={setBenchmark}
            /> {/* Pass variant to Sidebar */}
            <Box sx={{
                flex: 1,
                p: 3,
                ml: `${drawerWidth}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
              }}>
              <Box sx={{ 
                textAlign: 'center', 
                width: '100%', 
                mb: 3,
                mt: 2,
                p: 3,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  mb: 1
                }}>
                  Portfolio vs. {marketIndexLabels[benchmark]}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#6c757d',
                  fontSize: '1rem'
                }}>
                  ({indicatorLabels[indicator] || indicator})
                </Typography>
              </Box>
              <BenchmarkChart chartData={chartData} benchmark={benchmark} loading={loading} />
              <Box sx={{ 
                textAlign: 'center', 
                width: '100%', 
                mt: 4,
                mb: 2,
                p: 3,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  mb: 2
                }}>
                  KEY METRICS
                </Typography>
                {/* CHANGED: Use metricsLoading instead of checking for data */}
                {metricsLoading ? (
                  <Typography sx={{ color: '#6c757d', mt: 3 }}>Loading metrics...</Typography>
                ) : (
                  <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
                    <Typography sx={{ mb: 2, color: '#495057' }}>
                      Highest return happened on <strong style={{ color: '#28a745' }}>{highestReturnDate}</strong> with a return of <strong style={{ color: '#28a745' }}>{highestReturn !== null ? (highestReturn * 100).toFixed(2) : '--'}%</strong>
                    </Typography>
                    <Typography sx={{ color: '#495057' }}>
                      Days outperforming {benchmark}: <strong style={{ color: '#28a745' }}>
                        {percentageDaysGreaterThanMarket !== null ? percentageDaysGreaterThanMarket.toFixed(2) : '--'}%
                      </strong>
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ 
                textAlign: 'center', 
                width: '100%', 
                mt: 2,
                mb: 2,
                p: 3,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  mb: 2
                }}>
                  TICKERS BY DATE
                </Typography>
                {/* CHANGED: Use tickersLoading instead of checking for data */}
                {tickersLoading ? (
                  <Typography sx={{ color: '#6c757d', mt: 3 }}>Loading portfolio...</Typography>
                ) : (
                  <TickersByDateTable tickersByDate={tickersByDate} />
                )}
              </Box>
            </Box>
          </Box>
        }/>
        <Route path="/about" element={
          <About />
        }/>
      </Routes>
    </Router>
  );
}

export default App;
import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  CssBaseline,
  Box,
  Toolbar
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
  comms_num: 'Most Comments on Posts',
  score: 'Total Posts Score'
};

const marketIndexLabels: Record<string, string> = {
  QQQ: 'S&P 500',
};

function App() {
  const [chartData, setChartData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: '2021-01-30', end: '2021-09-30' });
  const [indicator, setIndicator] = useState('engagement_ratio'); // Use value, not label
  const [benchmark, setBenchmark] = useState('QQQ');
  const [loading, setLoading] = useState(false);
  const [tickersByDate, setTickersByDate] = useState<any[]>([]);
  
  // State for highest return and its date
  const [highestReturn, setHighestReturn] = useState<number | null>(null);
  const [highestReturnDate, setHighestReturnDate] = useState<string | null>(null);

  // State for percentage of days with return greater than market index
  const [percentageDaysGreaterThanMarket, setPercentageDaysGreaterThanMarket] = useState<number | null>(null);


  useEffect(() => {
    setLoading(true);
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
    }).catch(error => {
      console.error('Error fetching portfolio returns:', error);
      setLoading(false);
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
              }}>
              <h2 style={{ textAlign: 'center', width: '100%', margin: '20px 0' }}>
                <strong>Portfolio vs. {marketIndexLabels[benchmark]}</strong><br></br>
                <label style={{ fontSize: 'medium'}}> ({indicatorLabels[indicator] || indicator})</label>
              </h2>
              <BenchmarkChart chartData={chartData} benchmark={benchmark} loading={loading} />
              <h2 style={{ textAlign: 'center', width: '100%', margin: '20px 0' }}>
                KEY METRICS
              </h2>
              <ul>
                <li>
                  {highestReturnDate && highestReturn !== null
                    ? <>Highest return happened on <strong>{highestReturnDate}</strong> with a return of <strong style={{ color: '#50C878' }}>{(highestReturn * 100).toFixed(2)}%</strong></>
                    : <p style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Loading points...</p>
                  }
                </li>
                <li>
                  {percentageDaysGreaterThanMarket !== null
                    ? <>Days outperforming {benchmark}: <strong style={{ color: '#50C878' }}>{percentageDaysGreaterThanMarket.toFixed(2)}%</strong></>
                    : <p style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Loading points...</p>
                  }
                </li>
              </ul>
              <h2 style={{ textAlign: 'center', width: '100%', margin: '20px 0' }}>
                TICKERS BY DATE
              </h2>
              {
                tickersByDate && tickersByDate.length > 0
                  ? <TickersByDateTable tickersByDate={tickersByDate} />
                  : <p style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Loading portfolio...</p>
              }
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
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
      console.log(`🔍 DATA STRUCTURE DEBUG for ${indicator}:`, {
        totalItems: data.portfolio_returns?.length || 0,
        firstItem: data.portfolio_returns ? data.portfolio_returns[0] : null,
        dataKeys: data.portfolio_returns && data.portfolio_returns[0] ? Object.keys(data.portfolio_returns[0]) : []
      });
      
      // console.log('Portfolio returns data:', data);
      // Expecting: { portfolio_returns: Array, ... }
      let array: any[] = [];
      if (Array.isArray(data.portfolio_returns)) {
        array = data.portfolio_returns;
        // console.log('First 5 items from portfolio returns:', array.slice(0, 5));
        
        console.log(`🔍 ARRAY STRUCTURE DEBUG for ${indicator}:`, {
          totalItems: array.length,
          hasIndex: array[0]?.index !== undefined,
          hasDate: array[0]?.Date !== undefined,
          dateField: array[0]?.Date || array[0]?.date || array[0]?.index || 'none'
        });
      } else {
        console.error('API did not return an array:', data);
        return;
      }

      // Use 'Date' field as the date label (note: uppercase D in the data)
      const labels = array.map((item: any) => item.Date || item.date || item.index);
      const portfolioReturnsArr = array.map((item: any) => item.portfolio_return);
      const marketIndexReturns = array.map((item: any) => item[benchmark]);

      console.log(`📊 CHART DATA DEBUG for ${indicator}:`, {
        labelsLength: labels.length,
        portfolioReturnsLength: portfolioReturnsArr.length,
        marketIndexReturnsLength: marketIndexReturns.length,
        hasNullPortfolio: portfolioReturnsArr.some(v => v === null || v === undefined),
        hasNaNPortfolio: portfolioReturnsArr.some(v => isNaN(v)),
        hasNullMarket: marketIndexReturns.some(v => v === null || v === undefined),
        hasNaNMarket: marketIndexReturns.some(v => isNaN(v)),
        sampleLabels: labels.slice(0, 3),
        samplePortfolio: portfolioReturnsArr.slice(0, 3),
        sampleMarket: marketIndexReturns.slice(0, 3)
      });

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

      // Clean the data arrays to ensure no invalid values
      const cleanPortfolioReturns = portfolioReturnsArr.map(val => 
        (val === null || val === undefined || isNaN(val)) ? 0 : Number(val)
      );
      const cleanMarketReturns = marketIndexReturns.map(val => 
        (val === null || val === undefined || isNaN(val)) ? 0 : Number(val)
      );

      console.log(`🧹 CLEANED DATA for ${indicator}:`, {
        originalPortfolioHadBadValues: portfolioReturnsArr.length !== cleanPortfolioReturns.filter(v => v === portfolioReturnsArr[cleanPortfolioReturns.indexOf(v)]).length,
        originalMarketHadBadValues: marketIndexReturns.length !== cleanMarketReturns.filter(v => v === marketIndexReturns[cleanMarketReturns.indexOf(v)]).length,
        cleanPortfolioSample: cleanPortfolioReturns.slice(0, 3),
        cleanMarketSample: cleanMarketReturns.slice(0, 3)
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Portfolio Return',
            data: cleanPortfolioReturns,
            borderColor: '#20c997', // Teal color for portfolio
            backgroundColor: 'rgba(32, 201, 151, 0.1)',
            borderWidth: 3,
            tension: 0.2,
            pointRadius: 0, // Hide individual points for cleaner look
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#20c997',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2
          },
          {
            label: benchmark,
            data: cleanMarketReturns,
            borderColor: '#6f42c1', // Purple color for benchmark
            backgroundColor: 'rgba(111, 66, 193, 0.1)',
            borderWidth: 3,
            tension: 0.2,
            pointRadius: 0, // Hide individual points for cleaner look
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#6f42c1',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2
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
              {/* Portfolio Performance Section */}
              <Box sx={{ 
                width: '100%', 
                mb: 4,
                p: 4,
                backgroundColor: '#ffffff',
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#2c3e50',
                    mb: 1
                  }}>
                    Portfolio Performance Analysis
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#6c757d',
                    fontWeight: 400
                  }}>
                    {indicatorLabels[indicator] || indicator} Strategy vs {marketIndexLabels[benchmark]}
                  </Typography>
                </Box>

                {/* Chart */}
                <Box sx={{ mb: 4 }}>
                  <BenchmarkChart 
                    key={`${indicator}-${benchmark}-${dateRange.start}-${dateRange.end}`}
                    chartData={chartData} 
                    benchmark={benchmark} 
                    loading={loading} 
                  />
                </Box>

                {/* Integrated Key Metrics */}
                <Box sx={{ 
                  mt: 3,
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#2c3e50',
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Performance Summary
                  </Typography>
                  {metricsLoading ? (
                    <Typography sx={{ color: '#6c757d', textAlign: 'center' }}>Calculating metrics...</Typography>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-around',
                      flexWrap: 'wrap',
                      gap: 3
                    }}>
                      {/* Peak Performance Metric */}
                      <Box sx={{ textAlign: 'center', minWidth: '250px' }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#6c757d',
                          fontWeight: 500,
                          mb: 1
                        }}>
                          Peak Return
                        </Typography>
                        <Typography variant="h5" sx={{ 
                          color: '#28a745',
                          fontWeight: 700,
                          mb: 0.5
                        }}>
                          {highestReturn !== null ? (highestReturn * 100).toFixed(2) : '--'}%
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#495057'
                        }}>
                          on {highestReturnDate}
                        </Typography>
                      </Box>

                      {/* Outperformance Metric */}
                      <Box sx={{ textAlign: 'center', minWidth: '250px' }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#6c757d',
                          fontWeight: 500,
                          mb: 1
                        }}>
                          Days Outperforming {benchmark}
                        </Typography>
                        <Typography variant="h5" sx={{ 
                          color: '#28a745',
                          fontWeight: 700
                        }}>
                          {percentageDaysGreaterThanMarket !== null ? percentageDaysGreaterThanMarket.toFixed(1) : '--'}%
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Portfolio Holdings Section */}
              <Box sx={{ 
                width: '100%', 
                p: 4,
                backgroundColor: '#ffffff',
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  mb: 1,
                  textAlign: 'center'
                }}>
                  Portfolio Holdings Timeline
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#6c757d',
                  textAlign: 'center',
                  mb: 3
                }}>
                  Monthly <b>Top 5</b> stock selections based on sentiment analysis
                </Typography>
                {tickersLoading ? (
                  <Typography sx={{ color: '#6c757d', textAlign: 'center', py: 4 }}>Loading portfolio composition...</Typography>
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
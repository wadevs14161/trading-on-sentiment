import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  Box,
  IconButton,
  Collapse,
  Typography
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import NewsDisplay from './NewsDisplay';
import { getStockNews, NewsArticle } from '../api/NewsApi';

interface TickersByDateTableProps {
  tickersByDate: { date: string; tickers: string[] }[];
}

const TickersByDateTable: React.FC<TickersByDateTableProps> = ({ tickersByDate }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [newsData, setNewsData] = useState<Record<string, { articles: NewsArticle[], loading: boolean, error: string | null }>>({});

  const toggleRow = async (date: string, tickers: string[]) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (expandedRows.has(date)) {
      // Collapse row
      newExpandedRows.delete(date);
    } else {
      // Expand row and fetch news if not already loaded
      newExpandedRows.add(date);
      
      if (!newsData[date]) {
        // Set loading state
        setNewsData(prev => ({
          ...prev,
          [date]: { articles: [], loading: true, error: null }
        }));
        
        try {
          const response = await getStockNews(tickers);
          setNewsData(prev => ({
            ...prev,
            [date]: { 
              articles: response.articles, 
              loading: false, 
              error: null 
            }
          }));
        } catch (error) {
          setNewsData(prev => ({
            ...prev,
            [date]: { 
              articles: [], 
              loading: false, 
              error: 'Failed to fetch news. Please try again.' 
            }
          }));
        }
      }
    }
    
    setExpandedRows(newExpandedRows);
  };
  if (!tickersByDate || tickersByDate.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 6, 
        color: '#6c757d',
        fontStyle: 'italic'
      }}>
        No portfolio data available for the selected period
      </Box>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2, 
        maxWidth: '100%',
        boxShadow: 'none',
        border: '1px solid #e9ecef',
        borderRadius: 2
      }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
            <TableCell sx={{ 
              fontWeight: 600,
              color: '#495057',
              borderBottom: '2px solid #dee2e6',
              width: '60px'
            }}>
              News
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 600,
              color: '#495057',
              borderBottom: '2px solid #dee2e6'
            }}>
              Rebalancing Date
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 600,
              color: '#495057',
              borderBottom: '2px solid #dee2e6'
            }}>
              Selected Stocks
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickersByDate.map((row, index) => (
            <React.Fragment key={row.date}>
              <TableRow 
                sx={{ 
                  '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                  '&:hover': { backgroundColor: '#e9ecef' }
                }}
              >
                <TableCell sx={{ borderBottom: '1px solid #dee2e6', padding: '8px' }}>
                  <IconButton
                    size="small"
                    onClick={() => toggleRow(row.date, row.tickers)}
                    sx={{
                      color: '#495057',
                      '&:hover': {
                        backgroundColor: '#e9ecef'
                      }
                    }}
                  >
                    {expandedRows.has(row.date) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 500,
                  color: '#2c3e50',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  {new Date(row.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #dee2e6' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {row.tickers.map((ticker) => (
                      <Chip
                        key={ticker}
                        label={ticker}
                        size="small"
                        sx={{
                          backgroundColor: '#495057',
                          color: '#ffffff',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: '#343a40'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
              
              {/* News collapse row */}
              <TableRow>
                <TableCell 
                  colSpan={3} 
                  sx={{ 
                    paddingTop: 0, 
                    paddingBottom: 0,
                    borderBottom: expandedRows.has(row.date) ? '1px solid #dee2e6' : 'none'
                  }}
                >
                  <Collapse in={expandedRows.has(row.date)} timeout="auto" unmountOnExit>
                    <Box sx={{ py: 2, px: 2, backgroundColor: '#f8f9fa' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                        Recent News
                      </Typography>
                      <NewsDisplay
                        articles={newsData[row.date]?.articles || []}
                        loading={newsData[row.date]?.loading || false}
                        error={newsData[row.date]?.error || null}
                        tickers={row.tickers}
                      />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TickersByDateTable;
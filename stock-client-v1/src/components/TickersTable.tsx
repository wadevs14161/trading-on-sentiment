import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box } from '@mui/material';

interface TickersByDateTableProps {
  tickersByDate: { date: string; tickers: string[] }[];
}

const TickersByDateTable: React.FC<TickersByDateTableProps> = ({ tickersByDate }) => {
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
            <TableRow 
              key={row.date}
              sx={{ 
                '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' },
                '&:hover': { backgroundColor: '#e9ecef' }
              }}
            >
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TickersByDateTable;
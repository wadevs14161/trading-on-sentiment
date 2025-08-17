import React, { useState, useEffect } from 'react';
import { Drawer, TextField, MenuItem, Box, Button, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface SidebarProps {
  variant?: string;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  indicator: string;
  setIndicator: (value: string) => void;
  benchmark: string;
  setBenchmark: (value: string) => void;
}

const Sidebar = ({
  dateRange,
  setDateRange,
  indicator,
  setIndicator,
  benchmark,
  setBenchmark,
}: SidebarProps) => {
  // --- CHANGED: Add local state for all three controls ---
  const [pendingDate, setPendingDate] = useState(dateRange);
  const [pendingIndicator, setPendingIndicator] = useState(indicator);
  const [pendingBenchmark, setPendingBenchmark] = useState(benchmark);

  // --- CHANGED: Sync local state with parent props ---
  useEffect(() => { setPendingDate(dateRange); }, [dateRange]);
  useEffect(() => { setPendingIndicator(indicator); }, [indicator]);
  useEffect(() => { setPendingBenchmark(benchmark); }, [benchmark]);

  // --- CHANGED: Apply all changes at once ---
  const handleApply = () => {
    setDateRange(pendingDate);
    setIndicator(pendingIndicator);
    setBenchmark(pendingBenchmark);
  };

  // --- CHANGED: Only enable Apply if something changed ---
  const changed =
    pendingDate.start !== dateRange.start ||
    pendingDate.end !== dateRange.end ||
    pendingIndicator !== indicator ||
    pendingBenchmark !== benchmark;

  return (
    <Drawer
      anchor="left"
      open={true}
      variant="permanent"
      sx={{
        '& .MuiDrawer-paper': {
          width: '240px',
          top: '64px', // CHANGED: offset by AppBar height (default AppBar is 64px tall)
          height: 'calc(100% - 64px)', // CHANGED: fill remaining height
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e9ecef',
          boxShadow: 'none'
        },
      }}
    >
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: '#6c757d' }} />
          <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Portfolio Filter
          </Typography>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.75rem', 
            display: 'block', 
            color: '#495057' 
          }}>
            Date Range
          </Typography>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* CHANGED: Use pendingDate and setPendingDate */}
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={pendingDate.start}
              onChange={(e) => setPendingDate({ ...pendingDate, start: e.target.value })}
              sx={{ 
                width: '50%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#dee2e6',
                  },
                  '&:hover fieldset': {
                    borderColor: '#495057',
                  },
                }
              }}
            />
            <TextField
              type="date"
              variant="outlined"
              size="small"
              value={pendingDate.end}
              onChange={(e) => setPendingDate({ ...pendingDate, end: e.target.value })}
              sx={{ 
                width: '50%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#dee2e6',
                  },
                  '&:hover fieldset': {
                    borderColor: '#495057',
                  },
                }
              }}
            />
          </div>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.75rem', 
            display: 'block', 
            color: '#495057' 
          }}>
            Indicator
          </Typography>
          <TextField
            select
            variant="outlined"
            size="small"
            value={pendingIndicator}
            onChange={(e) => setPendingIndicator(e.target.value)}
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: '#dee2e6',
                },
                '&:hover fieldset': {
                  borderColor: '#495057',
                },
              }
            }}
          >
            <MenuItem value="total_sentiment">Total Sentiment</MenuItem>
            <MenuItem value="score">Score of Posts</MenuItem>
            <MenuItem value="comms_num">Number of Comments of Posts</MenuItem>
            <MenuItem value="engagement_ratio">Engagement Ratio</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.75rem', 
            display: 'block', 
            color: '#495057' 
          }}>
            Market Index
          </Typography>
          <TextField
            select
            variant="outlined"
            size="small"
            value={pendingBenchmark}
            onChange={(e) => setPendingBenchmark(e.target.value)}
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: '#dee2e6',
                },
                '&:hover fieldset': {
                  borderColor: '#495057',
                },
              }
            }}
          >
            <MenuItem value="QQQ">QQQ</MenuItem>
            <MenuItem value="AAPL">Apple</MenuItem>
          </TextField>
        </Box>
        {/* CHANGED: Add Apply button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          disabled={!changed}
          sx={{
            mt: 1,
            py: 1.5,
            backgroundColor: changed ? '#495057' : '#e9ecef',
            color: changed ? '#ffffff' : '#6c757d',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: changed ? '0 2px 8px rgba(73, 80, 87, 0.2)' : 'none',
            '&:hover': {
              backgroundColor: changed ? '#343a40' : '#e9ecef',
              boxShadow: changed ? '0 4px 12px rgba(73, 80, 87, 0.3)' : 'none',
            },
            '&:disabled': {
              backgroundColor: '#e9ecef',
              color: '#6c757d',
            }
          }}
        >
          Apply
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;


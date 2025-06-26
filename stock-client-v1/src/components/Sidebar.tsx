import React, { useState, useEffect } from 'react';
import { Drawer, TextField, MenuItem, Box, Button } from '@mui/material';
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
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <h2 style={{
          fontSize: '1 rem',
          fontWeight: 700,
          textAlign: 'center',
          margin: 0,
          marginBottom: '1.5rem',
          letterSpacing: '0.03em',
          color: '#1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FilterListIcon sx={{ fontSize: '1.6rem', marginRight: '0.5rem' }} />
          Portfolio Filter
        </h2>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>Date</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* CHANGED: Use pendingDate and setPendingDate */}
            <TextField
              type="date"
              variant="outlined"
              value={pendingDate.start}
              onChange={(e) => setPendingDate({ ...pendingDate, start: e.target.value })}
              sx={{ input: { color: 'black', backgroundColor: 'white' }, width: '50%' }}
            />
            <TextField
              type="date"
              variant="outlined"
              value={pendingDate.end}
              onChange={(e) => setPendingDate({ ...pendingDate, end: e.target.value })}
              sx={{ input: { color: 'black', backgroundColor: 'white' }, width: '50%' }}
            />
          </div>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>Indicator</label>
          <TextField
            select
            variant="outlined"
            value={pendingIndicator}
            onChange={(e) => setPendingIndicator(e.target.value)}
            sx={{ input: { color: 'black', backgroundColor: 'white' }, width: '100%' }}
          >
            <MenuItem value="engagement_ratio">Engagement Ratio</MenuItem>
            <MenuItem value="total_sentiment">Sentiment</MenuItem>
            <MenuItem value="score">Score of Posts</MenuItem>
            <MenuItem value="comms_num">Number of Comments of Posts</MenuItem>
          </TextField>
        </Box>
        <Box>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>Market Index</label>
          <TextField
            select
            variant="outlined"
            value={pendingBenchmark}
            onChange={(e) => setPendingBenchmark(e.target.value)}
            sx={{ input: { color: 'black', backgroundColor: 'white' }, width: '100%' }}
          >
            <MenuItem value="QQQ">QQQ</MenuItem>
            <MenuItem value="AAPL">Apple</MenuItem>
          </TextField>
        </Box>
        {/* CHANGED: Add Apply button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleApply}
          disabled={!changed}
          sx={{
            mt: 2,
            backgroundColor: changed ? '#1976d2' : '#C0C0C0 !important', // much lighter grey when disabled
            color: changed ? '#fff' : '#bdbdbd',
            cursor: changed ? 'pointer' : 'not-allowed',
            boxShadow: changed ? 3 : 0,
            '&:hover': {
              backgroundColor: changed ? '#115293' : '#e0e0e0',
              color: changed ? '#fff' : '#888',
              cursor: changed ? 'pointer' : 'not-allowed',
            },
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
        >
          Apply
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;


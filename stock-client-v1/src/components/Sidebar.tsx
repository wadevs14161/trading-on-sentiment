import React, { useState, useEffect } from 'react';
import { Drawer, TextField, MenuItem, Box, Button } from '@mui/material';

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
            <MenuItem value="score">Total Score of Posts</MenuItem>
            <MenuItem value="comms_num">Total Number of Comments</MenuItem>
          </TextField>
        </Box>
        <Box>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>Benchmark</label>
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
          sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#115293' } }}
        >
          Apply
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;


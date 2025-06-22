import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface TickersByDateTableProps {
  tickersByDate: { date: string; tickers: string[] }[];
}

const TickersByDateTable: React.FC<TickersByDateTableProps> = ({ tickersByDate }) => {
  if (!tickersByDate || tickersByDate.length === 0) return null;

  return (
    <TableContainer component={Paper} sx={{ mt: 4, maxWidth: 800 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Stocks Bought</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickersByDate.map((row) => (
            <TableRow key={row.date}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.tickers.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TickersByDateTable;
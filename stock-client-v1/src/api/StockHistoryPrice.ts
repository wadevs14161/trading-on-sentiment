import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api_v1/stock-price-history/';

interface StockPriceHistoryParams {
  ticker: string;
  start_date: string; // Format: 'YYYY-MM-DD'
  end_date: string;   // Format: 'YYYY-MM-DD'
}

export const fetchStockPriceHistory = async (params: StockPriceHistoryParams) => {
  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data; // Return the data from the API response
  } catch (error) {
    console.error('Error fetching stock price history:', error);
    throw error; // Re-throw the error for further handling
  }
};
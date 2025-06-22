import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api_v1/portfolio-returns/';

interface PortfolioReturnsParams {
  start_date: string; // Format: 'YYYY-MM-DD'
  end_date: string;   // Format: 'YYYY-MM-DD'
  market_index: string; // e.g., 'S&P 500', 'NASDAQ', etc.
  indicator: string; // e.g. "Engagement Ratio", "Sentiment Score"
}

export const portfolioReturns = async (params: PortfolioReturnsParams) => {
  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data; // Return the data from the API response
  } catch (error) {
    console.error('Error showing benchmark of portfolio', error);
    throw error; // Re-throw the error for further handling
  }
};
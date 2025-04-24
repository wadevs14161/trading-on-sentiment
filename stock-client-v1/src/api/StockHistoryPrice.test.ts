import axios from 'axios';
import { fetchStockPriceHistory } from './StockHistoryPrice';
// Mock the axios module
jest.mock('axios'); // Mock Axios

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchStockPriceHistory', () => {
  it('should fetch stock price history successfully', async () => {
    // Mock API response
    const mockResponse = {
      data: [
        { date: '2025-01-01', ticker: 'QQQ', open_price: '150', close_price: '155',
          high_price: '157', low_price: '149', volume: 1000000
         },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    // Call the function
    const params = {
      ticker: 'QQQ',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
    };
    const data = await fetchStockPriceHistory(params);

    // Assertions
    expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8000/api_v1/stock-price-history/', { params });
    expect(data).toEqual(mockResponse.data);
  });

  it('should handle API errors', async () => {
    // Mock API error
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    const params = {
      ticker: 'QQQ',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
    };

    // Assertions
    await expect(fetchStockPriceHistory(params)).rejects.toThrow('Network Error');
    expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8000/api_v1/stock-price-history/', { params });
  });
});
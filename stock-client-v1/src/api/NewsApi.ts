export interface NewsArticle {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  description: string;
  urlToImage: string;
}

export interface NewsResponse {
  status: string;
  articles: NewsArticle[];
  totalResults: number;
  tickers: string[];
  message?: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api_v1';

export const getStockNews = async (tickers: string[]): Promise<NewsResponse> => {
  try {
    const tickersParam = tickers.join(',');
    const response = await fetch(`${API_BASE_URL}/news/?tickers=${tickersParam}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

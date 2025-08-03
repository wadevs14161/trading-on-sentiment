import pandas as pd
import numpy as np

class RedditSentimentData:
    def __init__(self, file_path: str):
        """
        Initialize the RedditSentimentData class with the path to the sentiment data file.
        """
        self.file_path = file_path
        self.df_sentiment = self.load_sentiment_data()
        self.portfolio = []

    def load_sentiment_data(self) -> pd.DataFrame:
        """
        Load sentiment data from csv file with title, score, comms_num, body, date, stock, sentiment scores for title and body
        , and return a dataframe with total sentiment and engagement ratio
        """
        # Read sentiment data from csv file
        df = pd.read_csv(self.file_path)

        # Convert 'date' column to datetime format
        df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
        # # Set multiple index for date and stock
        # df = df.set_index(['date', 'stock'])
        # # Add up sentiment score of title and body
        # df['total_sentiment'] = df['title_sentiment'] + df['body_sentiment']
        # df = df.groupby(['date', 'stock']).agg('sum')
        # # Set score to 1 if it is less than 1
        # df['score'] = np.where(df['score'] < 1, 1, df['score'])
        # # Add column engagement_ratio
        # df['engagement_ratio'] = df['comms_num'] / df['score']
        # # Convert date string to datetime format
        # df = df.reset_index()
        df = df.set_index(['date', 'stock'])

        return df

    def filter_strategies(self, indicator: str) -> pd.DataFrame:
        """
        Aggregate Monthly and calculate average sentiment for the month
        Filter data using the specified indicator
        - Top 5 "Sentiment" stocks
        - Top 5 "Engagement ratio" stocks
        """
        df_filtered = pd.DataFrame()
        # --- Refactored to reduce duplication ---
        agg_map = {
            'engagement_ratio': 'mean',
            'total_sentiment': 'mean',
            'comms_num': 'mean',
            'score': 'mean'
        }
        if indicator in agg_map:
            agg_func = agg_map[indicator]
            # Aggregate monthly by indicator
            df_agg = (
                self.df_sentiment.reset_index('stock')
                .groupby([pd.Grouper(freq='ME'), 'stock'])[[indicator]]
                .agg(agg_func)
            )
            # Rank based on specific indicator
            df_agg['rank'] = (
                df_agg.groupby(level=0)[indicator]
                .transform(lambda x: x.rank(ascending=False).astype(int))
            )
            # Filter out top N ranking
            df_filtered = df_agg[df_agg['rank'] <= 5].copy()
            # Adjust date to be the first day of the month
            df_filtered = df_filtered.reset_index('stock')
            df_filtered.index = df_filtered.index + pd.DateOffset(1)
            df_filtered = df_filtered.reset_index().set_index(['date', 'stock'])       
        return df_filtered
    
    def extract_portfolios(self, df_filtered: pd.DataFrame) -> dict:
        """
        Extract the stocks to form portfolios with at the start of each new month
        Create a dictionary containing start of month and corresponded selected stocks
        """
        # Get all dates from each date index
        dates = df_filtered.index.get_level_values('date').unique().to_list()
        # List all stocks for each date
        tickers_by_date = {}
        for date in dates:
            tickers_by_date[date.strftime('%Y-%m-%d')] = df_filtered.xs(date, level=0).index.tolist()
        
        self.portfolio = tickers_by_date
        return tickers_by_date
    

    def load_historical_data(self, dir_path: str, stock_list: list, fixed_dates: dict, start: str, end: str) -> pd.DataFrame:
        '''
        Extract the stocks to form portfolios with at the start of each new month
        Create a dictionary containing start of month and corresponded selected stocks.
        Read historical prices of the stocks from csv files in stock_historical_prices_2019-2024
        '''
        # Check if start and end date are weekends, if so, set to the next Monday
        start = pd.to_datetime(start)
        if start.weekday() == 5:
            start = start + pd.DateOffset(2)
        elif start.weekday() == 6:
            start = start + pd.DateOffset(1)
        end = pd.to_datetime(end)
        if end.weekday() == 5:
            end = end + pd.DateOffset(2)
        elif end.weekday() == 6:
            end = end + pd.DateOffset(1)
        start = start.strftime('%Y-%m-%d')
        end = end.strftime('%Y-%m-%d')

        # Read historical prices of the stocks from csv files in stock_historical_prices_2019-2024
        df_all = pd.DataFrame()
        df_temp = pd.DataFrame()
        for ticker in stock_list:
            try:
                # file_path = f'data/stock_historical_prices_2019-2024/{ticker}.csv'
                file_path = f'{dir_path}/{ticker}.csv'
                df_temp = pd.read_csv(file_path).set_index('Price')[start:end]['Close'].to_frame(ticker)
                # print(f'df_temp: {df_temp}')
            except:
                print(f'Prices of {ticker} might not exist, let it be NaN')
                # If df_temp cannot be read, let the ticker be NaN
                df_temp = pd.DataFrame(index=pd.date_range(start, end), columns=[ticker])
                df_temp[ticker] = np.nan
            df_all = pd.concat([df_all, df_temp], axis=1)
        # Calculate log return of each stocks
        df_return = np.log(df_all.astype('float64')).diff().dropna(how='all')
        # print(f'df_return: {df_return}')
        # Calculate portfolio return based on the fixed dates and stock list
        df_portfolio = pd.DataFrame()
        for start_date in fixed_dates.keys():
            # Find next month end as end date
            end_date = (pd.to_datetime(start_date) + pd.offsets.MonthEnd()).strftime('%Y-%m-%d')
            # print(start_date, end_date)
            tickers = fixed_dates[start_date]
            # print(tickers)
            df_temp = df_return[start_date:end_date][tickers].mean(axis=1).to_frame('portfolio_return')
            df_portfolio = df_portfolio.add(df_temp, fill_value=0)
        # Convert index to datetime format
        df_portfolio.index = pd.to_datetime(df_portfolio.index)

        # print(df_portfolio)
        
        return df_portfolio
    
    def get_portfolio_returns(self,
                              file_path: str,
                              df_portfolio: pd.DataFrame,
                              market_index: str,
                              start_date: str,
                              end_date: str) -> pd.DataFrame:
        # Load prices of market index and calculate returns to compare to our strategy
        # file_path = f'data/market_indexes_2019-2024/{market_index}.csv'
        benchmark_index = pd.read_csv(file_path).set_index('Price')[2:][start_date:end_date]
        # Set index name to 'index'
        benchmark_index.index.name = 'index'
        benchmark_index = benchmark_index.astype('float64')
        benchmark_index.index = pd.to_datetime(benchmark_index.index)
        return_benchmark_index = np.log(benchmark_index['Close']).diff().dropna()
        return_benchmark_index.name = market_index

        # Merge portfolio return with market index return
        df_return_portfolio = df_portfolio.merge(return_benchmark_index,
                                        left_index=True,
                                        right_index=True)
        
        # Calculate cumulative return
        portfolio_cumulative_return = np.exp(np.log1p(df_return_portfolio).cumsum()).sub(1)

        return portfolio_cumulative_return
    
    def plot_portfolio_returns(self, df_portfolio: pd.DataFrame) -> None:
        """
        Plot the portfolio returns.
        """
        plt.figure(figsize=(10, 6))
        for col in df_portfolio.columns:
            plt.plot(df_portfolio.index, df_portfolio[col], label=col)
        plt.xlabel('Date')
        plt.ylabel('Cumulative Return')
        plt.title('Portfolio vs Benchmark Cumulative Return')
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        plt.show()


if __name__ == "__main__":
    # Example usage
    sentiment_data = RedditSentimentData('/Users/wenshinluo/Documents/Projects/sentiment-investment/stock_server_v1/data/reddit_sentiment_data.csv')
    df_filtered = sentiment_data.filter_strategies('engagement_ratio')
    fixed_dates = sentiment_data.extract_portfolios(df_filtered)
    
    # Define stock list and date range
    stock_list = df_filtered.index.get_level_values('stock').unique().tolist()
    start_date = '2021-01-28'
    end_date = '2021-08-02'
    file_path = '/Users/wenshinluo/Documents/Projects/sentiment-investment/stock_server_v1/data/stock_historical_prices_2019-2024'
    df_portfolio = sentiment_data.load_historical_data(file_path, stock_list, fixed_dates, start_date, end_date)
    
    market_index = 'QQQ'
    file_path_index = f'/Users/wenshinluo/Documents/Projects/sentiment-investment/stock_server_v1/data/market_indexes_2019-2024/{market_index}.csv'
    portfolio_returns = sentiment_data.get_portfolio_returns(file_path_index, df_portfolio, market_index, start_date, end_date)
    
    sentiment_data.plot_portfolio_returns(portfolio_returns)
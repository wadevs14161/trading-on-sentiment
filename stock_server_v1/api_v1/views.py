from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import StockPriceHistory
from .Serializers import StockPriceHistorySerializer
from django.shortcuts import render
from .RedditSentimentData import RedditSentimentData
from django.conf import settings
import os
import numpy as np
import pandas as pd
from pprint import pprint

class StockPriceHistoryViewSet(viewsets.ViewSet):
    def list(self, request):
        ticker = request.query_params.get('ticker')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        print(ticker, start_date, end_date)

        if not all([ticker, start_date, end_date]):
            return Response({"error": "Please provide ticker, start_date, and end_date."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Assuming your StockPriceHistory model has 'ticker', 'date' (or a similar date field), and other data fields
            queryset = StockPriceHistory.objects.filter(
                Q(ticker=ticker) &
                Q(date__gte=start_date) &
                Q(date__lte=end_date)
            ).order_by('date')  # Order by date for consistency

            serializer = StockPriceHistorySerializer(queryset, many=True)  # Serialize multiple objects
            return Response(serializer.data)

        except Exception as e:
            return Response({"error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioReturnsViewSet(viewsets.ViewSet):
    def list(self, request):
        start_date = request.query_params.get('start_date', '2021-01-28')
        end_date = request.query_params.get('end_date', '2021-08-02')
        market_index = request.query_params.get('market_index', 'QQQ')
        indicator = request.query_params.get('indicator', 'engagement_ratio')

        # Enforce date range limits - do not exceed the available data range
        max_start_date = '2021-01-28'
        max_end_date = '2021-08-02'
        
        # Clamp the dates to the available range
        if start_date < max_start_date:
            start_date = max_start_date
        if end_date > max_end_date:
            end_date = max_end_date

        try:
            # file = "reddit_sentiment_data2.csv"
            file = "reddit_sentiment_gemini_v3.csv"
            sentiment_data_path = os.path.join(settings.BASE_DIR, 'data', file)
            print(f"Loading sentiment data from: {sentiment_data_path}")
            sentiment_data = RedditSentimentData(sentiment_data_path)
            df_filtered = sentiment_data.filter_strategies(indicator)
            tickers_by_date = sentiment_data.extract_portfolios(df_filtered)
            stock_list = df_filtered.index.get_level_values('stock').unique().tolist()
            historical_data_path = os.path.join(settings.BASE_DIR, 'data', 'stock_historical_prices_2019-2024')
            df_portfolio = sentiment_data.load_historical_data(historical_data_path, stock_list, tickers_by_date, start_date, end_date)
            file_path_index = os.path.join(settings.BASE_DIR, 'data', 'market_indexes_2019-2024', f'{market_index}.csv')
            portfolio_returns = sentiment_data.get_portfolio_returns(file_path_index, df_portfolio, market_index, start_date, end_date)
            # Convert portfolio index (date) to string
            portfolio_returns.index = portfolio_returns.index.strftime('%Y-%m-%d')
            # print(portfolio_returns.head())
            # Reset index to turn the date index into a column
            portfolio_returns_reset = portfolio_returns.reset_index()
            pprint(portfolio_returns_reset)
            # Replace NaN with None for JSON serialization
            portfolio_returns_reset = portfolio_returns_reset.replace({np.nan: None})
            # Convert DataFrame to list of dicts
            portfolio_returns_list = portfolio_returns_reset.to_dict(orient='records')
            # pprint(portfolio_returns_list)

            # Also return tickers_by_date which is a dict of dates and their corresponding stock tickers {'date': ['AAPL', 'GOOGL'], ...}
            # Filter tickers_by_date to only include dates within the selected date range
            start_date_dt = pd.to_datetime(start_date)
            end_date_dt = pd.to_datetime(end_date)
            
            filtered_tickers_by_date = {}
            for date_str, tickers in tickers_by_date.items():
                date_dt = pd.to_datetime(date_str)
                # Include portfolio rebalancing dates that fall within or before the selected period
                # (since a portfolio selected on date X is held until the next rebalancing)
                if start_date_dt <= date_dt <= end_date_dt:
                    filtered_tickers_by_date[date_str] = tickers
            
            # Convert filtered tickers_by_date to a list of dicts for JSON serialization
            tickers_by_date_list = [{'date': date, 'tickers': tickers} for date, tickers in filtered_tickers_by_date.items()]


            return Response({
                'portfolio_returns': portfolio_returns_list,
                'start_date': start_date,
                'end_date': end_date,
                'market_index': market_index,
                'indicator': indicator,
                'tickers_by_date': tickers_by_date_list
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def index(request):
    csv_path = os.path.join(settings.BASE_DIR, 'data', 'reddit_sentiment_data.csv')
    sentiment_data = RedditSentimentData(csv_path)
    df_filtered = sentiment_data.filter_strategies('engagement_ratio')
    fixed_dates = sentiment_data.extract_portfolios(df_filtered)
    
    # Define stock list and date range
    stock_list = df_filtered.index.get_level_values('stock').unique().tolist()
    start_date = '2021-01-28'
    end_date = '2021-07-25'
    historical_data_path = os.path.join(settings.BASE_DIR, 'data', 'stock_historical_prices_2019-2024')
    df_portfolio = sentiment_data.load_historical_data(historical_data_path, stock_list, fixed_dates, start_date, end_date)
    print(df_portfolio)
    market_index = 'QQQ'
    file_path_index = os.path.join(settings.BASE_DIR, 'data', 'market_indexes_2019-2024', f'{market_index}.csv')
    portfolio_returns = sentiment_data.get_portfolio_returns(file_path_index, df_portfolio, market_index, start_date, end_date)
    # Convert the portfolio returns DataFrame to a dictionary for rendering in the template
    portfolio_returns_dict = portfolio_returns.to_dict(orient='index')
    context = {
        'portfolio_returns': portfolio_returns_dict,
        'start_date': start_date,
        'end_date': end_date,
        'market_index': market_index
    }

    return render(request, template_name='api_v1/index.html', context=context)


class NewsViewSet(viewsets.ViewSet):
    def list(self, request):
        """
        Get recent news for a list of stock tickers
        """
        tickers = request.query_params.get('tickers', '')
        
        if not tickers:
            return Response({"error": "Please provide tickers parameter."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Import NewsApiClient here to avoid import errors if not installed
            from newsapi import NewsApiClient
            import json
            
            # Load API key from configuration file
            config_path = os.path.join(settings.BASE_DIR, '..', '.api_keys.json')
            try:
                with open(config_path, 'r') as config_file:
                    config = json.load(config_file)
                api_key = config['news_api_key']
            except FileNotFoundError:
                return Response({"error": "API keys configuration file not found."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except KeyError:
                return Response({"error": "News API key not found in configuration."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Initialize NewsApiClient
            newsapi = NewsApiClient(api_key=api_key)
            
            # Parse tickers (comma-separated)
            ticker_list = [ticker.strip().upper() for ticker in tickers.split(',')]
            
            # Create search query from all tickers
            search_query = ' OR '.join(ticker_list)
            
            # Get recent news
            all_articles = newsapi.get_everything(
                q=search_query,
                language='en',
                sort_by='publishedAt',
                page_size=5,
                page=1
            )
            
            if all_articles['status'] == 'ok' and all_articles['totalResults'] > 0:
                # Format articles for response
                articles = []
                for article in all_articles['articles']:
                    articles.append({
                        'title': article['title'],
                        'source': article['source']['name'],
                        'publishedAt': article['publishedAt'],
                        'url': article['url'],
                        'description': article['description'],
                        'urlToImage': article.get('urlToImage', '')
                    })
                
                return Response({
                    'status': 'success',
                    'articles': articles,
                    'totalResults': all_articles['totalResults'],
                    'tickers': ticker_list
                })
            else:
                return Response({
                    'status': 'no_results',
                    'message': 'No recent news found for the specified tickers.',
                    'tickers': ticker_list
                })
                
        except ImportError:
            return Response({"error": "NewsAPI library not installed."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": f"Error fetching news: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import StockPriceHistory, NewsCache, NewsArticle, MonthlyIndicatorCache, MonthlyIndicatorScore
from .Serializers import StockPriceHistorySerializer
from django.shortcuts import render
from .RedditSentimentData import RedditSentimentData
from django.conf import settings
from django.utils import timezone
import os
import numpy as np
import pandas as pd
from pprint import pprint
import hashlib
import json
from datetime import timedelta
import logging

# Set up logger
logger = logging.getLogger(__name__)

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
    def get_cached_monthly_indicators(self, indicator, start_date, end_date):
        """
        Get cached monthly indicator scores for the date range.
        Returns (cached_data, missing_months) where:
        - cached_data: dict of {month_str: [(ticker, score, rank), ...]}
        - missing_months: list of datetime objects for months that need calculation
        """
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
        
        # Generate all months in the range
        months_needed = []
        current_month = start_dt.replace(day=1)  # First day of start month
        while current_month <= end_dt:
            months_needed.append(current_month)
            current_month = (current_month + pd.offsets.MonthEnd(1) + pd.DateOffset(days=1))
        
        cached_data = {}
        missing_months = []
        now = timezone.now()
        
        print(f"🔍 MONTHLY CACHE CHECK: {indicator} | {len(months_needed)} months needed ({start_date} to {end_date})")
        
        for month_dt in months_needed:
            month_str = month_dt.strftime('%Y-%m-%d')
            
            # Check for cached monthly data
            cached_month = MonthlyIndicatorCache.objects.filter(
                month_year=month_dt.date(),
                indicator=indicator,
                expires_at__gt=now
            ).first()
            
            if cached_month:
                # Get cached scores for this month
                scores = cached_month.scores.filter(rank__lte=5).order_by('rank')
                cached_data[month_str] = [(score.ticker, score.score_value, score.rank) for score in scores]
                print(f"📋 MONTHLY CACHE HIT: {month_str} | {len(cached_data[month_str])} stocks")
            else:
                missing_months.append(month_dt)
                print(f"❌ MONTHLY CACHE MISS: {month_str}")
        
        return cached_data, missing_months
    
    def cache_monthly_indicators(self, indicator, month_dt, stocks_data):
        """
        Cache monthly indicator scores for a specific month.
        stocks_data: list of (ticker, score, rank) tuples
        """
        month_str = month_dt.strftime('%Y-%m-%d')
        now = timezone.now()
        
        # Clean up any existing cache for this month/indicator
        MonthlyIndicatorCache.objects.filter(
            month_year=month_dt.date(),
            indicator=indicator
        ).delete()
        
        # Create new cache entry (expires in 7 days - monthly data is relatively stable)
        expires_at = now + timedelta(days=7)
        monthly_cache = MonthlyIndicatorCache.objects.create(
            month_year=month_dt.date(),
            indicator=indicator,
            expires_at=expires_at
        )
        
        # Save stock scores
        for ticker, score_value, rank in stocks_data:
            MonthlyIndicatorScore.objects.create(
                cache=monthly_cache,
                ticker=ticker,
                score_value=score_value,
                rank=rank
            )
        
        print(f"💾 MONTHLY CACHED: {month_str} | {len(stocks_data)} stocks | expires in 7 days")
    
    def calculate_missing_monthly_indicators(self, indicator, missing_months):
        """
        Calculate indicator scores for missing months using RedditSentimentData logic.
        Returns dict of {month_str: [(ticker, score, rank), ...]}
        """
        if not missing_months:
            return {}
        
        print(f"🔄 CALCULATING MISSING MONTHS: {len(missing_months)} months for {indicator}")
        
        # Load sentiment data
        file = "reddit_sentiment_gemini_v3.csv"
        sentiment_data_path = os.path.join(settings.BASE_DIR, 'data', file)
        sentiment_data = RedditSentimentData(sentiment_data_path)
        
        # Get the raw sentiment dataframe
        df_sentiment = sentiment_data.df_sentiment
        
        calculated_data = {}
        
        for month_dt in missing_months:
            month_str = month_dt.strftime('%Y-%m-%d')
            
            # Calculate for this specific month using RedditSentimentData logic
            month_start = month_dt
            month_end = month_dt + pd.offsets.MonthEnd()
            
            # Filter data for this month
            month_data = df_sentiment.loc[
                (df_sentiment.index.get_level_values('date') >= month_start) & 
                (df_sentiment.index.get_level_values('date') <= month_end)
            ]
            
            if month_data.empty:
                print(f"⚠️  No data available for {month_str}")
                calculated_data[month_str] = []
                continue
            
            # Aggregate by stock for this month (same logic as filter_strategies)
            agg_map = {
                'engagement_ratio': 'mean',
                'total_sentiment': 'mean', 
                'comms_num': 'mean',
                'score': 'mean'
            }
            
            if indicator not in agg_map:
                print(f"⚠️  Unknown indicator: {indicator}")
                calculated_data[month_str] = []
                continue
            
            agg_func = agg_map[indicator]
            
            # Group by stock and aggregate
            month_agg = (
                month_data.reset_index('stock')
                .groupby('stock')[[indicator]]
                .agg(agg_func)
                .dropna()
            )
            
            if month_agg.empty:
                print(f"⚠️  No valid data after aggregation for {month_str}")
                calculated_data[month_str] = []
                continue
            
            # Rank stocks (descending order - higher is better)
            month_agg['rank'] = month_agg[indicator].rank(ascending=False, method='first').astype(int)
            
            # Get top 5 stocks
            top_stocks = month_agg[month_agg['rank'] <= 5].sort_values('rank')
            
            # Convert to list of tuples
            stocks_data = [
                (ticker, float(row[indicator]), int(row['rank'])) 
                for ticker, row in top_stocks.iterrows()
            ]
            
            calculated_data[month_str] = stocks_data
            
            # Cache this month's data
            self.cache_monthly_indicators(indicator, month_dt, stocks_data)
            
            print(f"✅ CALCULATED: {month_str} | {len(stocks_data)} stocks")
        
        return calculated_data

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
            print(f"🚀 PORTFOLIO REQUEST: {indicator} | {start_date} to {end_date} | {market_index}")
            
            # 1. Check for cached monthly indicators
            cached_monthly_data, missing_months = self.get_cached_monthly_indicators(
                indicator, start_date, end_date
            )
            
            # 2. Calculate missing monthly data if needed
            if missing_months:
                calculated_monthly_data = self.calculate_missing_monthly_indicators(
                    indicator, missing_months
                )
                # Merge calculated data with cached data
                cached_monthly_data.update(calculated_monthly_data)
            
            # 3. Build filtered dataframe from cached/calculated monthly data
            print(f"📊 BUILDING PORTFOLIO: {len(cached_monthly_data)} months of data")
            
            # Convert monthly data to the format expected by portfolio calculations
            tickers_by_date = {}
            for month_str, stocks_data in cached_monthly_data.items():
                # Extract just the tickers (top 5)
                tickers = [ticker for ticker, score, rank in stocks_data]
                tickers_by_date[month_str] = tickers
            
            # 4. Proceed with existing portfolio calculation logic
            if not tickers_by_date:
                return Response({"error": "No portfolio data available for the specified date range."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Load sentiment data for stock list extraction
            file = "reddit_sentiment_gemini_v3.csv"
            sentiment_data_path = os.path.join(settings.BASE_DIR, 'data', file)
            sentiment_data = RedditSentimentData(sentiment_data_path)
            
            # Get all unique stocks from monthly selections
            all_stocks = set()
            for stocks in tickers_by_date.values():
                all_stocks.update(stocks)
            stock_list = list(all_stocks)
            
            print(f"📈 LOADING HISTORICAL DATA: {len(stock_list)} unique stocks")
            
            # Load historical price data
            historical_data_path = os.path.join(settings.BASE_DIR, 'data', 'stock_historical_prices_2019-2024')
            df_portfolio = sentiment_data.load_historical_data(
                historical_data_path, stock_list, tickers_by_date, start_date, end_date
            )
            
            # Calculate portfolio returns
            file_path_index = os.path.join(settings.BASE_DIR, 'data', 'market_indexes_2019-2024', f'{market_index}.csv')
            portfolio_returns = sentiment_data.get_portfolio_returns(
                file_path_index, df_portfolio, market_index, start_date, end_date
            )
            
            # Convert portfolio index (date) to string
            portfolio_returns.index = portfolio_returns.index.strftime('%Y-%m-%d')
            # Reset index to turn the date index into a column
            portfolio_returns_reset = portfolio_returns.reset_index()
            # Replace NaN with None for JSON serialization
            portfolio_returns_reset = portfolio_returns_reset.replace({np.nan: None})
            # Convert DataFrame to list of dicts
            portfolio_returns_list = portfolio_returns_reset.to_dict(orient='records')

            # Filter tickers_by_date to only include dates within the selected date range
            start_date_dt = pd.to_datetime(start_date)
            end_date_dt = pd.to_datetime(end_date)
            
            filtered_tickers_by_date = {}
            for date_str, tickers in tickers_by_date.items():
                date_dt = pd.to_datetime(date_str)
                if start_date_dt <= date_dt <= end_date_dt:
                    filtered_tickers_by_date[date_str] = tickers
            
            # Convert filtered tickers_by_date to a list of dicts for JSON serialization
            tickers_by_date_list = [{'date': date, 'tickers': tickers} 
                                   for date, tickers in filtered_tickers_by_date.items()]
            
            print(f"✅ PORTFOLIO COMPLETE: {len(portfolio_returns_list)} return points | {len(tickers_by_date_list)} portfolio dates")

            return Response({
                'portfolio_returns': portfolio_returns_list,
                'start_date': start_date,
                'end_date': end_date,
                'market_index': market_index,
                'indicator': indicator,
                'tickers_by_date': tickers_by_date_list,
                'cached': len(missing_months) == 0,  # True if all months were cached
                'cache_info': {
                    'total_months': len(cached_monthly_data),
                    'cached_months': len(cached_monthly_data) - len(missing_months),
                    'calculated_months': len(missing_months)
                }
            })
            
        except Exception as e:
            print(f"❌ PORTFOLIO ERROR: {str(e)}")
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
        Get recent news for a list of stock tickers with SQLite caching
        """
        tickers = request.query_params.get('tickers', '')
        
        if not tickers:
            return Response({"error": "Please provide tickers parameter."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Normalize tickers for consistent caching
            ticker_list = sorted([ticker.strip().upper() for ticker in tickers.split(',')])
            normalized_tickers = ','.join(ticker_list)
            
            # Create cache key from tickers
            cache_key = hashlib.md5(normalized_tickers.encode()).hexdigest()
            
            # Check for existing valid cache
            now = timezone.now()
            cached_news = NewsCache.objects.filter(
                cache_key=cache_key,
                expires_at__gt=now
            ).first()
            
            if cached_news:
                print(f"📰 NEWS CACHE HIT: {normalized_tickers} | {cached_news.total_results} articles | Cached at: {cached_news.created_at}")
                
                # Return cached articles
                articles = []
                for article in cached_news.articles.all().order_by('article_order'):
                    articles.append({
                        'title': article.title,
                        'source': article.source,
                        'publishedAt': article.published_at.isoformat(),
                        'url': article.url,
                        'description': article.description,
                        'urlToImage': article.url_to_image
                    })
                
                return Response({
                    'status': 'success',
                    'articles': articles,
                    'totalResults': cached_news.total_results,
                    'tickers': ticker_list,
                    'cached': True,
                    'cached_at': cached_news.created_at.isoformat()
                })
            
            # No valid cache found - fetch from API
            print(f"🌐 NEWS FETCHING: {normalized_tickers} | Calling NewsAPI...")
            
            from newsapi import NewsApiClient
            
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
            
            # Create search query from all tickers
            search_query = ' OR '.join(ticker_list)
            
            # Get recent news from US sources
            all_articles = newsapi.get_everything(
                q=search_query,
                language='en',
                sort_by='publishedAt',
                page_size=10,  # Get more articles to filter down to 5 US ones
                page=1,
                domains='wsj.com,bloomberg.com,reuters.com,cnbc.com,marketwatch.com,yahoo.com,forbes.com,cnn.com,foxbusiness.com,barrons.com,thestreet.com,seekingalpha.com,fool.com,benzinga.com,investorplace.com'
            )
            
            if all_articles['status'] == 'ok' and all_articles['totalResults'] > 0:
                # Clean up any expired cache entries for this key
                NewsCache.objects.filter(cache_key=cache_key).delete()
                
                # Create new cache entry (expires in 1 hour)
                expires_at = now + timedelta(hours=1)
                news_cache = NewsCache.objects.create(
                    cache_key=cache_key,
                    tickers=normalized_tickers,
                    expires_at=expires_at,
                    total_results=0  # Will be updated after processing articles
                )
                
                # Format articles for response and save to cache
                articles = []
                for idx, article in enumerate(all_articles['articles'][:5]):  # Limit to top 5 articles
                    # Only include articles that have proper content
                    if article['title'] and article['description']:
                        # Save to cache
                        NewsArticle.objects.create(
                            cache=news_cache,
                            title=article['title'],
                            source=article['source']['name'],
                            published_at=article['publishedAt'],
                            url=article['url'],
                            description=article['description'],
                            url_to_image=article.get('urlToImage', ''),
                            article_order=idx + 1
                        )
                        
                        # Add to response
                        articles.append({
                            'title': article['title'],
                            'source': article['source']['name'],
                            'publishedAt': article['publishedAt'],
                            'url': article['url'],
                            'description': article['description'],
                            'urlToImage': article.get('urlToImage', '')
                        })
                
                # Update total results in cache
                news_cache.total_results = len(articles)
                news_cache.save()
                
                print(f"💾 NEWS CACHED: {normalized_tickers} | Saved {len(articles)} articles | Expires: {expires_at}")
                
                return Response({
                    'status': 'success',
                    'articles': articles,
                    'totalResults': len(articles),
                    'tickers': ticker_list,
                    'cached': False,
                    'cache_expires_at': expires_at.isoformat()
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
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import StockPriceHistory, NewsCache, NewsArticle, PortfolioCache, PortfolioReturn, PortfolioTicker
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
            # Create cache key from parameters
            cache_params = f"{start_date}_{end_date}_{market_index}_{indicator}"
            cache_key = hashlib.md5(cache_params.encode()).hexdigest()
            
            # Check for existing valid cache
            now = timezone.now()
            cached_portfolio = PortfolioCache.objects.filter(
                cache_key=cache_key,
                expires_at__gt=now
            ).first()
            
            if cached_portfolio:
                # Return cached portfolio data
                portfolio_returns_list = []
                for return_data in cached_portfolio.returns.all().order_by('date'):
                    portfolio_returns_list.append({
                        'index': return_data.date.strftime('%Y-%m-%d'),
                        'portfolio_return': return_data.portfolio_return,
                        cached_portfolio.market_index: return_data.benchmark_return,
                    })
                
                # Get tickers by date
                tickers_by_date_dict = {}
                for ticker_data in cached_portfolio.tickers.all().order_by('date', 'ticker'):
                    date_str = ticker_data.date.strftime('%Y-%m-%d')
                    if date_str not in tickers_by_date_dict:
                        tickers_by_date_dict[date_str] = []
                    tickers_by_date_dict[date_str].append(ticker_data.ticker)
                
                tickers_by_date_list = [{'date': date, 'tickers': tickers} 
                                       for date, tickers in tickers_by_date_dict.items()]
                
                return Response({
                    'portfolio_returns': portfolio_returns_list,
                    'start_date': cached_portfolio.start_date.strftime('%Y-%m-%d'),
                    'end_date': cached_portfolio.end_date.strftime('%Y-%m-%d'),
                    'market_index': cached_portfolio.market_index,
                    'indicator': cached_portfolio.indicator,
                    'tickers_by_date': tickers_by_date_list,
                    'cached': True,
                    'cached_at': cached_portfolio.created_at.isoformat()
                })
            
            # No valid cache found - perform calculation
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
            # Reset index to turn the date index into a column
            portfolio_returns_reset = portfolio_returns.reset_index()
            pprint(portfolio_returns_reset)
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
            
            # Clean up any expired cache entries for this key
            PortfolioCache.objects.filter(cache_key=cache_key).delete()
            
            # Create new cache entry (expires in 24 hours since portfolio calculation is expensive)
            expires_at = now + timedelta(hours=24)
            portfolio_cache = PortfolioCache.objects.create(
                cache_key=cache_key,
                start_date=pd.to_datetime(start_date).date(),
                end_date=pd.to_datetime(end_date).date(),
                market_index=market_index,
                indicator=indicator,
                expires_at=expires_at
            )
            
            # Cache portfolio returns data
            for return_data in portfolio_returns_list:
                if return_data.get('index'):  # Ensure date is not None
                    date_value = pd.to_datetime(return_data['index']).date()
                    portfolio_ret = return_data.get('portfolio_return')
                    benchmark_ret = return_data.get(market_index)  # Use dynamic market index name
                    
                    PortfolioReturn.objects.create(
                        cache=portfolio_cache,
                        date=date_value,
                        portfolio_return=portfolio_ret,
                        benchmark_return=benchmark_ret,
                        cumulative_portfolio_return=portfolio_ret,  # These are already cumulative
                        cumulative_benchmark_return=benchmark_ret   # These are already cumulative
                    )
            
            # Cache tickers by date data
            for ticker_date_data in tickers_by_date_list:
                date = pd.to_datetime(ticker_date_data['date']).date()
                for ticker in ticker_date_data['tickers']:
                    PortfolioTicker.objects.create(
                        cache=portfolio_cache,
                        date=date,
                        ticker=ticker
                    )

            return Response({
                'portfolio_returns': portfolio_returns_list,
                'start_date': start_date,
                'end_date': end_date,
                'market_index': market_index,
                'indicator': indicator,
                'tickers_by_date': tickers_by_date_list,
                'cached': False,
                'cache_expires_at': expires_at.isoformat()
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
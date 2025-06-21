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
from django.db import models

class StockPriceHistory(models.Model):
    date = models.DateField(primary_key=True)
    ticker = models.CharField(max_length=10)
    open_price = models.DecimalField(max_digits=12, decimal_places=6)
    close_price = models.DecimalField(max_digits=12, decimal_places=6)
    high_price = models.DecimalField(max_digits=12, decimal_places=6)
    low_price = models.DecimalField(max_digits=12, decimal_places=6)
    volume = models.IntegerField()

    class Meta:
        unique_together = ('ticker', 'date')
        ordering = ['-date']


# Build the database table with columns: 'title', 'score', 'comms_num', 'body', 'date', 'stock', 'title_unstemmed_sentiment', 'body_unstemmed_sentiment'
# title and body are the text of the post which need to handle emojis
class reddit_wsb(models.Model):
    title = models.TextField()
    score = models.IntegerField()
    comms_num = models.IntegerField()
    body = models.TextField()
    date = models.TextField()
    stock = models.CharField(max_length=10)
    title_unstemmed_sentiment = models.FloatField()
    body_unstemmed_sentiment = models.FloatField()

    class Meta:
        unique_together = ('title', 'date')
        ordering = ['-date']


class NewsCache(models.Model):
    """
    Cache for news articles fetched from NewsAPI
    """
    cache_key = models.CharField(max_length=255, unique=True)  # Hash of tickers combination
    tickers = models.CharField(max_length=255)  # Comma-separated list of tickers
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # Cache expiration time
    total_results = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['cache_key']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"NewsCache({self.tickers}) - {self.created_at}"


class NewsArticle(models.Model):
    """
    Individual news articles stored in cache
    """
    cache = models.ForeignKey(NewsCache, on_delete=models.CASCADE, related_name='articles')
    title = models.TextField()
    source = models.CharField(max_length=100)
    published_at = models.DateTimeField()
    url = models.URLField(max_length=500)
    description = models.TextField(blank=True, null=True)
    url_to_image = models.URLField(max_length=500, blank=True, null=True)
    article_order = models.PositiveIntegerField()  # Order in the results (1-5)
    
    class Meta:
        ordering = ['cache', 'article_order']
        unique_together = ('cache', 'url')  # Prevent duplicate articles in same cache
        indexes = [
            models.Index(fields=['cache', 'article_order']),
            models.Index(fields=['published_at']),
        ]

    def __str__(self):
        return f"{self.title[:50]}... - {self.source}"


class PortfolioCache(models.Model):
    """
    Cache for portfolio returns calculations
    """
    cache_key = models.CharField(max_length=255, unique=True)  # Hash of parameters
    start_date = models.DateField()
    end_date = models.DateField()
    market_index = models.CharField(max_length=10)
    indicator = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # Cache expiration time
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['cache_key']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['indicator']),
        ]

    def __str__(self):
        return f"PortfolioCache({self.start_date} to {self.end_date}, {self.indicator}, {self.market_index})"


class PortfolioReturn(models.Model):
    """
    Individual portfolio return data points
    """
    cache = models.ForeignKey(PortfolioCache, on_delete=models.CASCADE, related_name='returns')
    date = models.DateField()
    portfolio_return = models.FloatField(null=True, blank=True)
    benchmark_return = models.FloatField(null=True, blank=True)
    cumulative_portfolio_return = models.FloatField(null=True, blank=True)
    cumulative_benchmark_return = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['cache', 'date']
        unique_together = ('cache', 'date')
        indexes = [
            models.Index(fields=['cache', 'date']),
        ]

    def __str__(self):
        return f"PortfolioReturn({self.date}): Portfolio={self.cumulative_portfolio_return:.2%}, Benchmark={self.cumulative_benchmark_return:.2%}"


class PortfolioTicker(models.Model):
    """
    Tickers selected for portfolio on specific dates
    """
    cache = models.ForeignKey(PortfolioCache, on_delete=models.CASCADE, related_name='tickers')
    date = models.DateField()
    ticker = models.CharField(max_length=10)
    
    class Meta:
        ordering = ['cache', 'date', 'ticker']
        unique_together = ('cache', 'date', 'ticker')
        indexes = [
            models.Index(fields=['cache', 'date']),
        ]

    def __str__(self):
        return f"PortfolioTicker({self.date}): {self.ticker}"
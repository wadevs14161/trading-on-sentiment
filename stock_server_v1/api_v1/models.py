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


class MonthlyIndicatorCache(models.Model):
    """
    Cache for monthly indicator scores (engagement_ratio, total_sentiment, etc.)
    This allows incremental building of portfolio calculations
    """
    month_year = models.DateField()  # First day of the month (e.g., 2021-04-01)
    indicator = models.CharField(max_length=50)  # engagement_ratio, total_sentiment, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # Cache expiration time (longer than portfolio cache)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('month_year', 'indicator')
        indexes = [
            models.Index(fields=['month_year', 'indicator']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"MonthlyIndicatorCache({self.month_year.strftime('%Y-%m')}, {self.indicator})"


class MonthlyIndicatorScore(models.Model):
    """
    Individual stock scores for a specific month and indicator
    """
    cache = models.ForeignKey(MonthlyIndicatorCache, on_delete=models.CASCADE, related_name='scores')
    ticker = models.CharField(max_length=10)
    score_value = models.FloatField()  # Aggregated monthly score for the indicator
    rank = models.PositiveIntegerField()  # Rank within the month (1=best, 2=second, etc.)
    
    class Meta:
        ordering = ['cache', 'rank']
        unique_together = ('cache', 'ticker')
        indexes = [
            models.Index(fields=['cache', 'rank']),
            models.Index(fields=['ticker']),
        ]

    def __str__(self):
        return f"MonthlyIndicatorScore({self.cache.month_year.strftime('%Y-%m')}, {self.ticker}): {self.score_value:.4f} (rank {self.rank})"
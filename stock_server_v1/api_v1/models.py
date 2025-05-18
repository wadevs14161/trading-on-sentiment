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
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
from django.contrib import admin
from .models import StockPriceHistory, reddit_wsb

# Register your models here.
admin.site.register(StockPriceHistory)
admin.site.register(reddit_wsb)
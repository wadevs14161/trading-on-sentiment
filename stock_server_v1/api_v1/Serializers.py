from rest_framework import serializers
from .models import StockPriceHistory

class StockPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPriceHistory
        fields = '__all__'
        read_only_fields = ['stock', 'date', 'open_price', 'close_price', 'high_price', 'low_price', 'volume']
        
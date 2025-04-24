from django.urls import path, include
from rest_framework import routers
from .views import StockPriceHistoryViewSet

router = routers.DefaultRouter()
router.register(r'stock-price-history', StockPriceHistoryViewSet, basename='stock-price-history')

urlpatterns = [
    path('', include(router.urls)),
]



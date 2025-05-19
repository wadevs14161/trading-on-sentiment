from django.urls import path, include
from rest_framework import routers
from .views import StockPriceHistoryViewSet, index

router = routers.DefaultRouter()
router.register(r'stock-price-history', StockPriceHistoryViewSet, basename='stock-price-history')

urlpatterns = [
    # path('', include(router.urls)),
    path('', index, name='index'),
]



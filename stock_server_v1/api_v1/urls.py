from django.urls import path, include
from rest_framework import routers
from .views import StockPriceHistoryViewSet
from .views import PortfolioReturnsViewSet

router = routers.DefaultRouter()
router.register(r'stock-price-history', StockPriceHistoryViewSet, basename='stock-price-history')
router.register(r'portfolio-returns', PortfolioReturnsViewSet, basename='portfolio-returns')

urlpatterns = [
    # path('', include(router.urls)),
    # path('', index, name='index'),
    path('', include(router.urls)),
]



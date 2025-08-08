from django.core.management.base import BaseCommand
from django.utils import timezone
from api_v1.models import NewsCache, PortfolioCache
from datetime import timedelta


class Command(BaseCommand):
    help = 'Clean up expired cache entries (news and portfolio) from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Delete cache entries older than this many days (default: 7)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--cache-type',
            type=str,
            choices=['news', 'portfolio', 'all'],
            default='all',
            help='Type of cache to clean up (default: all)',
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        cache_type = options['cache_type']
        
        # Find expired cache entries
        cutoff_date = timezone.now() - timedelta(days=days)
        
        if cache_type in ['news', 'all']:
            self._handle_news_cache(cutoff_date, dry_run)
        
        if cache_type in ['portfolio', 'all']:
            self._handle_portfolio_cache(cutoff_date, dry_run)
    
    def _handle_news_cache(self, cutoff_date, dry_run):
        expired_news_caches = NewsCache.objects.filter(expires_at__lt=cutoff_date)
        count = expired_news_caches.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No expired news cache entries found')
            )
        else:
            if dry_run:
                self.stdout.write(f'Would delete {count} expired news cache entries:')
                for cache in expired_news_caches:
                    article_count = cache.articles.count()
                    self.stdout.write(
                        f'  - {cache.tickers} (expired: {cache.expires_at}, {article_count} articles)'
                    )
            else:
                expired_news_caches.delete()
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully deleted {count} expired news cache entries')
                )
    
    def _handle_portfolio_cache(self, cutoff_date, dry_run):
        expired_portfolio_caches = PortfolioCache.objects.filter(expires_at__lt=cutoff_date)
        count = expired_portfolio_caches.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No expired portfolio cache entries found')
            )
        else:
            if dry_run:
                self.stdout.write(f'Would delete {count} expired portfolio cache entries:')
                for cache in expired_portfolio_caches:
                    returns_count = cache.returns.count()
                    tickers_count = cache.tickers.count()
                    self.stdout.write(
                        f'  - {cache.start_date} to {cache.end_date}, {cache.indicator}, {cache.market_index}'
                    )
                    self.stdout.write(
                        f'    (expired: {cache.expires_at}, {returns_count} returns, {tickers_count} ticker entries)'
                    )
            else:
                expired_portfolio_caches.delete()
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully deleted {count} expired portfolio cache entries')
                )

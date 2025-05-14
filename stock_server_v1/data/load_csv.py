import csv
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_server_v1.settings')
django.setup()

from api_v1.models import StockPriceHistory

# Path to your CSV file
CSV_FILE_PATH = 'stock_data_QQQ.csv'

def load_csv_to_db():
    with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        rows = list(reader)

        # Extract the ticker from the second row
        ticker = rows[1][1]  # Assuming the ticker is in the second row, second column (e.g., "QQQ")

        # Process the data rows (starting from the 4th row, where the actual data begins)
        for row in rows[3:]:
            date, close, high, low, open_price, volume = row

            # Create a StockPriceHistory entry for each row
            StockPriceHistory.objects.create(
                ticker=ticker,
                date=date,
                open_price=float(open_price),
                close_price=float(close),
                high_price=float(high),
                low_price=float(low),
                volume=int(volume),
            )

if __name__ == '__main__':
    load_csv_to_db()
    print("CSV data loaded successfully!")
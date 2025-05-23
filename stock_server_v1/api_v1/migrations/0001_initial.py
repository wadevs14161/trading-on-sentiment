# Generated by Django 5.2 on 2025-04-24 09:51

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='StockPriceHistory',
            fields=[
                ('date', models.DateField(primary_key=True, serialize=False)),
                ('ticker', models.CharField(max_length=10)),
                ('open_price', models.DecimalField(decimal_places=6, max_digits=12)),
                ('close_price', models.DecimalField(decimal_places=6, max_digits=12)),
                ('high_price', models.DecimalField(decimal_places=6, max_digits=12)),
                ('low_price', models.DecimalField(decimal_places=6, max_digits=12)),
                ('volume', models.IntegerField()),
            ],
            options={
                'ordering': ['-date'],
                'unique_together': {('ticker', 'date')},
            },
        ),
    ]

from newsapi import NewsApiClient
import json
import os

# Load API key from configuration file
config_path = os.path.join(os.path.dirname(__file__), '..', '..', '.api_keys.json')
try:
    with open(config_path, 'r') as config_file:
        config = json.load(config_file)
    api_key = config['news_api_key']
except FileNotFoundError:
    print("Error: .api_keys.json file not found. Please create it using .api_keys.json.template")
    exit(1)
except KeyError:
    print("Error: 'news_api_key' not found in .api_keys.json")
    exit(1)

# Init
newsapi = NewsApiClient(api_key=api_key)

# Get top 5 newest news about PLTR (Palantir)
all_articles = newsapi.get_everything(
    q='PLTR',  # Search for both ticker and company name
    language='en',
    sort_by='publishedAt',  # Sort by newest first
    page_size=5,  # Limit to top 5 results
    page=1
)

# Check if articles were found
if all_articles['status'] == 'ok' and all_articles['totalResults'] > 0:
    print(f"Found {len(all_articles['articles'])} articles about PLTR/Palantir:\n")
    
    for i, article in enumerate(all_articles['articles'], 1):
        print(f"{i}. {article['title']}")
        print(f"   Source: {article['source']['name']}")
        print(f"   Published: {article['publishedAt']}")
        print(f"   URL: {article['url']}")
        if article['description']:
            print(f"   Description: {article['description'][:100]}...")
        print("-" * 80)
else:
    print("No articles found or API error occurred")
    print(f"Status: {all_articles.get('status', 'unknown')}")
    if 'message' in all_articles:
        print(f"Message: {all_articles['message']}")
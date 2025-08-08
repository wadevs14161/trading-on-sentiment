from newsapi import NewsApiClient

# Init
newsapi = NewsApiClient(api_key='5b85be58f5544f198fb70475e43acf81')

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
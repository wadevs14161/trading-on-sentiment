# API Keys Setup

This project uses external APIs that require authentication. Follow these steps to set up your API keys:

## Setup Instructions

1. **Copy the template file:**
   ```bash
   cp .api_keys.json.template .api_keys.json
   ```

2. **Add your API keys to `.api_keys.json`:**
   ```json
   {
     "news_api_key": "your_actual_news_api_key_here"
   }
   ```

## Getting API Keys

### News API
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to the `news_api_key` field in `.api_keys.json`

## Security Notes

- **Never commit `.api_keys.json` to version control**
- The file is already in `.gitignore` to prevent accidental commits
- Keep your API keys secure and don't share them publicly
- If you accidentally expose an API key, regenerate it immediately

## Troubleshooting

If you see errors about missing API keys:
1. Make sure `.api_keys.json` exists in the project root
2. Verify the JSON format is correct
3. Check that all required keys are present
4. Ensure the API keys are valid and active

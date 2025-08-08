# Trading on Sentiment

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The **Trading on Sentiment** project is a comprehensive full-stack application that explores the relationship between public sentiment from Reddit's r/wallstreetbets community and stock market performance. This sophisticated platform demonstrates how social media sentiment can be quantified, analyzed, and used to construct investment strategies with measurable performance metrics.

**🎯 Core Mission:** Transform unstructured social media discussions into actionable investment insights through advanced sentiment analysis and portfolio optimization.

### What This Project Accomplishes:

  * **📊 Real-time Sentiment Analysis:** Advanced NLP processing of Reddit posts to extract sentiment scores and stock mentions
  * **💹 Dynamic Portfolio Construction:** Four distinct sentiment-driven indicators for monthly portfolio rebalancing
  * **📈 Performance Visualization:** Interactive dashboards comparing sentiment-based strategies against market benchmarks
  * **⚡ High-Performance Caching:** Intelligent monthly indicator caching system achieving 380x performance improvement
  * **📰 Integrated News Analysis:** Real-time financial news integration with expandable article views
  * **🔐 Secure API Management:** JSON-based API key configuration with proper security practices

**Status:** ✅ **Production Ready** - Full-featured application with optimized performance and comprehensive analytics

## ✨ Key Features

### 🎯 Advanced Sentiment Analysis Engine
  * **Reddit Data Collection:** Automated scraping of r/wallstreetbets posts with comprehensive metadata (upvotes, comments, timestamps)
  * **NLP Processing:** Multi-model sentiment analysis using Stanza and Google's Gemini API for enhanced accuracy
  * **Stock Ticker Extraction:** Intelligent identification and validation of stock symbols within social media content
  * **Sentiment Scoring:** Sophisticated algorithms to quantify community sentiment on individual securities

### 📊 Dynamic Portfolio Strategies
Four distinct sentiment-driven indicators for monthly portfolio construction:
  * **📈 Engagement Ratio (Average):** Discussion quality metric (comments/upvotes ratio)
  * **💭 Average Sentiment Score:** Weighted sentiment analysis across all mentions
  * **💬 Total Comments (Sum):** Community engagement volume indicator  
  * **🔥 Total Post Score (Sum):** Cumulative popularity and visibility metric

### 🚀 High-Performance Architecture
  * **⚡ Intelligent Caching System:** Monthly indicator caching with 380x performance improvement
  * **🔄 Optimized Data Processing:** Efficient aggregation of sentiment data across time periods
  * **📱 Responsive Design:** Mobile-first UI with Material-UI components
  * **🎨 Enhanced Visualization:** Professional charts with subdued color schemes and integrated metrics

### 📰 Integrated News Analysis
  * **🔍 Real-time News Fetching:** Live financial news integration via NewsAPI
  * **📋 Expandable Article Views:** Toggle-enabled news sections with full article details
  * **🎯 Contextual Relevance:** News articles filtered by portfolio tickers and timeframes
  * **💾 Smart Caching:** Efficient news caching to minimize API calls and improve performance

### 🔐 Security & Configuration
  * **🔑 Secure API Management:** JSON-based API key configuration with .gitignore protection
  * **🛡️ Environment Isolation:** Proper separation of development and production configurations
  * **📋 Setup Documentation:** Comprehensive API key setup instructions and best practices

## 🛠️ Technology Stack

### Backend Infrastructure
  * **🐍 Python 3.12+:** Core language for data processing and analysis
  * **🌐 Django 4.2+:** High-level web framework for robust API development
  * **⚡ Django REST Framework:** Powerful toolkit for building Web APIs
  * **🗃️ SQLite:** Lightweight database for development with easy migration path
  * **📊 Advanced Caching:** Custom monthly indicator caching system for optimal performance

### Frontend Experience  
  * **⚛️ React 18+:** Modern JavaScript library for building interactive UIs
  * **📘 TypeScript 5+:** Type-safe development with enhanced developer experience
  * **⚡ Vite:** Next-generation frontend tooling for lightning-fast development
  * **🎨 Material-UI (MUI):** Professional React components with consistent design language
  * **📊 Chart.js:** Advanced charting library for financial data visualization

### Data Processing & Analysis
  * **🧠 NLP Libraries:** 
    - **Stanza:** Stanford's robust NLP toolkit for sentiment analysis
    - **Google Gemini API:** Advanced AI for enhanced text understanding
  * **📈 Data Manipulation:** Pandas and NumPy for efficient data operations
  * **🔍 Web Scraping:** PRAW (Python Reddit API Wrapper) for social media data collection
  * **💹 Financial APIs:** Integration with Alpha Vantage and NewsAPI for market data

### Development & Deployment
  * **📦 Package Management:** npm/yarn for frontend, pip for backend dependencies
  * **🔧 Build Optimization:** Webpack via Vite for optimized production builds
  * **🌐 HTTP Client:** Axios for efficient API communication
  * **🔐 Security:** Environment-based configuration with secure API key management

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd stock_server_v1

# Install Python dependencies
pip install -r requirements.txt

# Configure API keys
cp API_KEYS_SETUP.md.example api_keys.json
# Edit api_keys.json with your API credentials

# Run database migrations
python manage.py migrate

# Load sample data (optional)
python manage.py loaddata data/sample_data.json

# Start Django development server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd stock-client-v1

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🔑 API Keys Configuration
Create `api_keys.json` in the root directory:
```json
{
  "news_api_key": "your_newsapi_key_here",
  "alpha_vantage_api_key": "your_alpha_vantage_key_here",
  "gemini_api_key": "your_gemini_api_key_here"
}
```

**Note:** Never commit `api_keys.json` to version control. See `API_KEYS_SETUP.md` for detailed setup instructions.

## 📈 Performance Highlights

### 🚀 System Optimizations
- **380x Performance Improvement:** Intelligent monthly indicator caching system
- **Reduced API Calls:** Smart caching strategies for news and financial data
- **Optimized Database Queries:** Efficient aggregation and indexing strategies
- **Fast Frontend Rendering:** Optimized React components with lazy loading

### 📊 Portfolio Analytics
- **Monthly Rebalancing:** Dynamic portfolio construction based on sentiment indicators
- **Benchmark Comparisons:** Performance tracking against S&P 500, NASDAQ, and other indices
- **Risk Metrics:** Comprehensive analysis including volatility, Sharpe ratio, and drawdown analysis
- **Historical Backtesting:** Multi-year performance validation across different market conditions

## 🎯 Use Cases

### 👨‍💼 For Researchers
- **Academic Studies:** Quantitative analysis of social sentiment impact on markets
- **Data Export:** Clean datasets for further analysis and research
- **Methodology Validation:** Transparent algorithms for reproducible results

### 👩‍💻 For Developers  
- **Full-Stack Architecture:** Modern tech stack demonstrating best practices
- **Performance Optimization:** Real-world caching and optimization techniques
- **API Design:** RESTful API patterns with Django REST Framework

### 📊 For Traders & Analysts
- **Sentiment Indicators:** Alternative data sources for investment decisions
- **Portfolio Strategies:** Quantified approaches to sentiment-based investing
- **Market Intelligence:** Community-driven insights from retail investor sentiment

## 🔄 Data Pipeline

```
Reddit Posts → NLP Processing → Sentiment Scores → Monthly Aggregation → Portfolio Construction → Performance Analysis
     ↓              ↓              ↓                    ↓                      ↓                    ↓
[Raw Data]    [Stanza/Gemini]  [Database]      [Smart Caching]        [Rebalancing]      [Visualization]
```

## 📁 Project Structure

```
sentiment-investment/
├── 📁 stock_server_v1/          # Django Backend
│   ├── 📁 api_v1/               # Main API application  
│   │   ├── 📄 models.py         # Database models with caching
│   │   ├── 📄 views.py          # API endpoints and logic
│   │   ├── 📄 news_api.py       # News integration
│   │   └── 📁 management/       # Custom commands
│   ├── 📁 data/                 # Data files and scripts
│   └── 📄 requirements.txt      # Python dependencies
├── 📁 stock-client-v1/          # React Frontend
│   ├── 📁 src/                  # Source code
│   │   ├── 📁 components/       # React components
│   │   ├── 📁 api/             # API integration
│   │   └── 📁 styles/          # CSS and styling
│   └── 📄 package.json         # Node.js dependencies
├── 📄 api_keys.json            # API credentials (gitignored)
├── 📄 API_KEYS_SETUP.md        # Setup instructions
└── 📄 README.md                # This file
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for all new frontend code
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stanford NLP Group** for the Stanza library
- **Google** for the Gemini API
- **Reddit Community** for providing rich discussion data
- **Material-UI Team** for excellent React components

## 📞 Contact

- **LinkedIn:** [https://www.linkedin.com/in/wenshin-luo/](https://www.linkedin.com/in/wenshin-luo/)
- **Email:** wadevs14161@gmail.com
- **GitHub:** [wadevs14161](https://github.com/wadevs14161)

---

**📅 Last Updated:** August 8, 2025  
**🏷️ Version:** 2.0.0 - Production Ready with Intelligent Caching  
**📊 Performance:** 380x improvement through optimized architecture

---

*Built with ❤️ for the intersection of social sentiment and financial markets*

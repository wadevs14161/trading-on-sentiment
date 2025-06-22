# Trading on Sentiment

[](https://github.com/your-username/your-repo-name)
[](https://www.python.org/)
[](https://www.djangoproject.com/)
[](https://opensource.org/licenses/MIT)
[](https://github.com/your-username/your-repo-name/stargazers)
[](https://github.com/your-username/your-repo-name/network/members)

## Overview

The **Trading on Sentiment** project is an initiative to explore the relationship between public sentiment, particularly from online communities like **Reddit's r/wallstreetbets**, and its potential influence on stock market movements. This application demonstrates a data-driven approach to portfolio construction.

The goal is to develop tools and models that can:

  * **Collect and analyze textual data** from social media posts related to specific stocks.
  * **Quantify sentiment** expressed in this data using Natural Language Processing (NLP) techniques.
  * **Develop investing strategies** based on indicators derived from the collected and organized sentiment data.
  * **Calculate and visualize cumulative returns** to benchmark performance against established market indices, offering insights into community-driven strategies.

This project is currently in an **ongoing** phase and aims to provide insights and tools for both researchers and individuals interested in the intersection of social media and finance.

## Key Features

  * **Reddit Data Collection:** Scripts are implemented to scrape and store historical posts, comments, upvote counts, and content from the Wallstreetbets subreddit.
  * **Sentiment Analysis Implementation:** Utilizes NLP techniques, specifically the **Stanza** Python library, to analyze the sentiment (positive, neutral, negative) within post titles and content. It extracts stock tickers and assigns a comprehensive sentiment score per post.
  * **Dynamic Portfolio Strategies:** Four distinct indicators are available to filter and rank stocks monthly, leading to hypothetical portfolio constructions:
      * **Engagement Ratio (Average):** Measures discussion relative to popularity (average comments / average upvotes).
      * **Average Sentiment Score:** Overall sentiment across posts for a stock.
      * **Total Comments (Sum):** Reflects total discussion volume.
      * **Total Post Score (Sum):** Indicates cumulative popularity.
  * **Performance Visualization:** The dashboard visually compares the historical performance of these monthly rebalanced, sentiment-driven portfolios against a chosen market benchmark index (e.g., S\&P 500, NASDAQ).
  * **Robust Data Storage:** Utilizes a database (currently **MariaDB**, with potential for other options) to store collected raw data, derived sentiment scores, and historical stock prices.
  * **Full-Stack Architecture:**
      * **Frontend:** Built with **React** and **Vite** for a fast, modern, and interactive user interface, styled with **Material-UI (MUI)**.
      * **Backend:** Powered by **Django REST Framework** for a robust and scalable API, handling data processing, analysis, and serving.

## Technologies Used

  * **Python:** The primary programming language for data collection, analysis, and backend development.
  * **Django:** A high-level Python web framework for building the RESTful API.
  * **Django REST Framework (DRF):** For building the powerful and flexible Web API endpoints.
  * **NLP Libraries:** **Stanza** (for core sentiment analysis), with potential for integration of others like NLTK, spaCy, or Hugging Face's Transformers for broader NLP tasks.
  * **Data Scraping:** Libraries like **PRAW** (Python Reddit API Wrapper) for efficient data collection from Reddit.
  * **Database:** **MariaDB** (MySQL compatible) for storing all project data (posts, sentiment scores, stock prices).
  * **Data Analysis:** **Pandas** and **NumPy** for robust data manipulation, aggregation, and analytical computations.
  * **Data Visualization (Frontend):** While not explicitly listed here, a React-compatible charting library (e.g., Recharts, Nivo, Chart.js) would be used for the dashboard visualizations.
  * **Financial APIs:** Integration with APIs (e.g., **Alpha Vantage**, or other reliable sources) to fetch historical stock data and market index prices.
  * **Frontend Build Tool:** **Vite** for incredibly fast development and optimized production builds.
  * **Frontend Framework:** **React** for building the dynamic and responsive user interface.
  * **UI Component Library:** **Material-UI (MUI)** for pre-built, accessible, and highly customizable UI components.
  * **HTTP Client (Frontend):** **Axios** for making efficient API requests from the React application to the Django backend.

## Contact

  * **LinkedIn:** [https://www.linkedin.com/in/wenshin-luo/](https://www.linkedin.com/in/wenshin-luo/)
  * **Email:** wadevs14161@gmail.com

-----

**Last Updated:** June 22, 2025

-----

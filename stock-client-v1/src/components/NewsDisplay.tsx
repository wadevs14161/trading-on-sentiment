import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Link,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import { NewsArticle } from '../api/NewsApi';

interface NewsDisplayProps {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  tickers: string[];
}

const NewsDisplay: React.FC<NewsDisplayProps> = ({ articles, loading, error, tickers }) => {
  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        {[...Array(3)].map((_, index) => (
          <Card key={index} sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e9ecef' }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="100%" height={40} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No recent news found for: {tickers.join(', ')}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Recent news for:
        </Typography>
        {tickers.map((ticker) => (
          <Chip
            key={ticker}
            label={ticker}
            size="small"
            sx={{
              backgroundColor: '#495057',
              color: '#ffffff',
              fontSize: '0.75rem'
            }}
          />
        ))}
      </Box>
      
      {articles.map((article, index) => (
        <Card 
          key={index} 
          sx={{ 
            mb: 2, 
            boxShadow: 'none', 
            border: '1px solid #e9ecef',
            '&:hover': {
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          <CardContent sx={{ pb: 2 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: '#2c3e50',
                mb: 1,
                lineHeight: 1.3
              }}
            >
              <Link 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#007bff'
                  }
                }}
              >
                {article.title}
              </Link>
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {article.source}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            
            {article.description && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ lineHeight: 1.4 }}
              >
                {article.description}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default NewsDisplay;

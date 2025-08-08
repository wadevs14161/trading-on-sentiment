// src/components/About.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider'; // For visual separation

const About = () => (
    // Use Box as the main container for padding and max-width, centering it if needed.
    // The `sx` prop allows for direct styling using theme values and CSS properties.
    <Box
        sx={{
            // This padding will come from the parent (MainContent) already,
            // but if used standalone, it ensures some space.
            // For MainContent, we usually let it dictate horizontal padding.
            // Here, we'll ensure content inside is contained.
            maxWidth: 900, // Slightly wider to accommodate content better
            mx: 'auto', // Auto margins to center horizontally if parent allows
            my: 2, // Margin top/bottom
            p: 3, // Inner padding for the entire About section

            // Inherit background from parent's `background.default`
            // No direct border/shadow here as Paper will handle content sections
        }}
    >
        {/* Use Paper for a card-like section to contain the main text,
            leveraging theme.palette.background.paper for its background. */}
        <Paper
            sx={{
                p: 4, // Padding inside the paper
                borderRadius: 2, // Rounded corners
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', // Subtle shadow
                bgcolor: '#ffffff', // Clean white background
                color: '#2c3e50', // Professional text color
                border: '1px solid #e9ecef' // Subtle border
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2c3e50', mb: 3, fontWeight: 600 }}>
                About Trading on Sentiment
            </Typography>

            <Typography variant="body1">
                <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Trading on Sentiment</Box> offers a unique look at how insights from online communities can influence investment choices. This application demonstrates a data-driven approach to building stock portfolios by analyzing discussions from Reddit's popular <Box component="span" sx={{ fontWeight: 'bold' }}>Wallstreetbets</Box>  community.
            </Typography>

            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

            <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.secondary' }}>
                How It Works:
            </Typography>

            <ol style={{ paddingLeft: '20px', margin: 0 }}>
                <li>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Data Collection:</Box> We gather real-time and historical posts from Reddit's Wallstreetbets, capturing each post's title, content, upvote count (score), and the number of comments it receives.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Sentiment Analysis:</Box> Using advanced Natural Language Processing (NLP) tools, we analyze the sentiment (overall positive or negative tone) within both the title and content of each post. We identify stock symbols (tickers like 'GME' or 'AMC') mentioned in the text, and then assign a comprehensive sentiment score to every relevant post.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Portfolio Strategies:</Box> We use four distinct <Box component="span" sx={{ fontStyle: 'italic' }}>indicators</Box> derived from the Reddit data to identify and rank potentially promising stocks each month. These indicators highlight different aspects of community interest:
                        <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                            <li>
                                <Typography variant="body2">
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Engagement Ratio:</Box> Measures how much discussion a stock generates relative to its popularity. It's calculated by dividing the average comments by the average upvotes per post.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Sentiment Score:</Box> Represents the average positive or negative sentiment across all posts mentioning a specific stock.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Total Comments:</Box> The total number of comments across all posts mentioning a particular stock, reflecting discussion volume.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2">
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Total Post Score:</Box> The cumulative total of all upvotes received by posts mentioning a stock, indicating its overall popularity.
                                </Typography>
                            </li>
                        </ul>
                        <Typography variant="body1">
                            Every month, the top 5 stocks are selected based on the chosen indicator's ranking to form a new, hypothetical portfolio.
                        </Typography>
                    </Typography>
                </li>
                <li>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>Performance Visualization:</Box> The dashboard then visually compares the historical performance of these dynamically constructed portfolios against a chosen market benchmark index (like the S&P 500 or NASDAQ). This allows you to see how community-driven strategies might have performed.
                    </Typography>
                </li>
            </ol>
        </Paper>
    </Box>
);

export default About;

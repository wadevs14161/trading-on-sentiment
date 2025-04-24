import { useState } from 'react';
import './App.css';
import StockChart from './components/StockChart';
import IndicatorsControl from './components/IndicatorsControl';

function App() {
  // This is a simple React component that manages the state of various indicators and a checkbox.
  const [indicators, setIndicators] = useState({
    mostMentioned: false,
    mostCommented: false,
    highestSentiment: false,
    highestPostScores: false,
  });

  // The indicators state is an object that contains boolean values for each indicator.
  interface Indicators {
    mostMentioned: boolean;
    mostCommented: boolean;
    highestSentiment: boolean;
    highestPostScores: boolean;
  }

  // The toggleIndicator function toggles the state of a specific indicator.  
  const toggleIndicator = (indicator: keyof Indicators): void => {
    setIndicators((prev: Indicators) => ({
      ...prev,
      [indicator]: !prev[indicator],
    }));
  };

  return (
    <div className="container">
      <IndicatorsControl 
        indicators={indicators} 
        toggleIndicator={toggleIndicator} 
      />

      <div className="chart-container">
        {/* Chart will be integrated here */}
        <h1>Stock Chart</h1>
          <StockChart />
      </div>
    </div>
  );
}

export default App;
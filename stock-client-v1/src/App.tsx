import { useState } from 'react';
import './App.css';

function App() {
  // This is a simple React component that manages the state of various indicators and a checkbox.
  const [indicators, setIndicators] = useState({
    mostMentioned: false,
    mostCommented: false,
    highestSentiment: false,
    highestPostScores: false,
  });

  const [showBenchmark, setShowBenchmark] = useState(false);

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
      <div className="indicators">
        {Object.keys(indicators).map((key) => (
          <button
            key={key}
            className={`button ${indicators[key as keyof Indicators] ? 'on' : 'off'}`}
            onClick={() => toggleIndicator(key as keyof Indicators)}
          >
            {key.split(/(?=[A-Z])/).join(' ')}
          </button>
        ))}
      </div>

      <div className="checkbox-container">
        <label>
          <input
            type="checkbox"
            checked={showBenchmark}
            onChange={() => setShowBenchmark(!showBenchmark)}
          />
          Show S&P500
        </label>
      </div>

      <div className="chart-container">
        {/* Chart will be integrated here */}
        <p>Chart Placeholder</p>
      </div>
    </div>
  );
}

export default App;
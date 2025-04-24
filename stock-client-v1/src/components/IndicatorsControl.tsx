import React from 'react';

export interface Indicators {
    mostMentioned: boolean;
    mostCommented: boolean;
    highestSentiment: boolean;
    highestPostScores: boolean;
}

interface IndicatorsControlProps {
    indicators: Indicators;
    toggleIndicator: (indicator: keyof Indicators) => void;
}

const IndicatorsControl: React.FC<IndicatorsControlProps> = ({ indicators, toggleIndicator }) => {
    return (
    <div className="indicators">
        {Object.keys(indicators).map((key) => (
            <button
            key={key}
            className={`button ${indicators[key as keyof Indicators] ? 'on' : 'off'}`}
            onClick={() => toggleIndicator(key as keyof Indicators)}>
                {key.split(/(?=[A-Z])/).join(' ')}
                </button>
            ))}
            </div>
            );
};

export default IndicatorsControl;
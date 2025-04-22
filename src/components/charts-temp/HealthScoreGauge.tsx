import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../common/Card';

interface HealthScoreGaugeProps {
  score: number;
  title?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
}

const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  title = 'Health Score',
  description,
  className = '',
  size = 'md',
  showLegend = true,
}) => {
  // Validate score (must be between 0 and 100)
  const validScore = Math.max(0, Math.min(100, score));
  
  // Calculate remaining portion for the gauge
  const remaining = 100 - validScore;
  
  // Data for the gauge chart
  const data = [
    { name: 'Score', value: validScore },
    { name: 'Remaining', value: remaining },
  ];
  
  // Colors based on score ranges
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green (good)
    if (score >= 60) return '#FBBF24'; // Yellow (moderate)
    return '#EF4444'; // Red (poor)
  };
  
  const scoreColor = getScoreColor(validScore);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-40',
    md: 'h-60',
    lg: 'h-80',
  };
  
  // Get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2 text-center">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 text-center">
            {description}
          </p>
        )}
        
        <div className={`${sizeClasses[size]} relative`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell key="score-cell" fill={scoreColor} />
                <Cell key="remaining-cell" fill="#E5E7EB" />
              </Pie>
              {showLegend && (
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value, entry, index) => {
                    return index === 0 ? `${validScore}% - ${getScoreLabel(validScore)}` : '';
                  }}
                />
              )}
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Score') {
                    return [`${value}%`, 'Health Score'];
                  }
                  return [value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: scoreColor }}>
              {validScore}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              out of 100
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="w-3 h-3 rounded-full bg-error mx-auto mb-1"></div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">0-59</span>
          </div>
          <div>
            <div className="w-3 h-3 rounded-full bg-warning mx-auto mb-1"></div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">60-79</span>
          </div>
          <div>
            <div className="w-3 h-3 rounded-full bg-success mx-auto mb-1"></div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">80-100</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HealthScoreGauge;

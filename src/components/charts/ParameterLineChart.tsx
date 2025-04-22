import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface ParameterLineChartProps {
  data: DataPoint[];
  referenceRange?: {
    min: number;
    max: number;
  };
  color?: string;
  unit?: string;
}

const ParameterLineChart: React.FC<ParameterLineChartProps> = ({
  data,
  referenceRange,
  color = '#3B82F6',
  unit = ''
}) => {
  const formatYAxis = (value: number) => `${value}${unit}`;
  
  const getMinMax = () => {
    const values = data.map(d => d.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    
    // Include reference range in the chart boundaries if provided
    if (referenceRange) {
      min = Math.min(min, referenceRange.min);
      max = Math.max(max, referenceRange.max);
    }
    
    // Add some padding
    const padding = (max - min) * 0.1;
    min = Math.max(0, min - padding);
    max = max + padding;
    
    return { min, max };
  };
  
  const { min, max } = getMinMax();
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[min, max]} 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}${unit}`, 'Value']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          
          {/* Reference range area if provided */}
          {referenceRange && (
            <CartesianGrid
              y={referenceRange.min}
              strokeDasharray="3 3"
              stroke="#9CA3AF"
            />
          )}
          
          {/* Reference range upper limit if provided */}
          {referenceRange && (
            <CartesianGrid
              y={referenceRange.max}
              strokeDasharray="3 3"
              stroke="#9CA3AF"
            />
          )}
          
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
            name="Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ParameterLineChart; 
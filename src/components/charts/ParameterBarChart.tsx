import React from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Card from '../common/Card';

interface ParameterBarChartProps {
  data: Array<{
    name: string;
    value: number;
    min: number;
    max: number;
    isAbnormal?: boolean;
    unit: string;
  }>;
  title?: string;
  description?: string;
  className?: string;
}

const ParameterBarChart: React.FC<ParameterBarChartProps> = ({
  data,
  title,
  description,
  className = '',
}) => {
  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    min: item.min,
    max: item.max,
    // Calculate how far the value is from the reference range midpoint as a percentage
    normalizedValue: ((item.value - item.min) / (item.max - item.min)) * 100,
    isAbnormal: item.isAbnormal,
    unit: item.unit,
  }));

  return (
    <Card className={className}>
      <div className="p-6">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {description}
          </p>
        )}
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value, name, entry: any) => {
                  // Convert value to string safely
                  const valueStr = typeof value === 'number' ? value.toFixed(2) : String(value);
                  return [`${valueStr} ${entry?.unit || ''}`, name];
                }}
                labelFormatter={(label) => `Parameter: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="normalizedValue" 
                name="Value" 
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isAbnormal ? '#EF4444' : '#3B82F6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>* Values are normalized to the reference range (0% = minimum, 100% = maximum)</p>
        </div>
      </div>
    </Card>
  );
};

export default ParameterBarChart;

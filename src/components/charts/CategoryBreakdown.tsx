import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import Card from '../common/Card';

interface CategoryDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  description?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
}

// Active shape for hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="#333" className="text-sm">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#999" className="text-xs">
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  data,
  title,
  description,
  className = '',
  showLegend = true,
  showLabels = true,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  // Default colors if not provided with improved color scheme
  const COLORS = ['#3B82F6', '#10B981', '#FBBF24', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  
  // Format data to ensure colors
  const formattedData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));
  
  // Calculate total for percentage
  const total = formattedData.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {formattedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="white"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                {showLegend && (
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                    formatter={(value, entry, index) => {
                      const item = formattedData[index];
                      const percentage = ((item.value / total) * 100).toFixed(1);
                      return (
                        <span className="text-sm font-medium">
                          {value} <span className="text-neutral-500 dark:text-neutral-400">({percentage}%)</span>
                        </span>
                      );
                    }}
                  />
                )}
                <Tooltip 
                  formatter={(value, name, entry) => {
                    // Make sure value is a number before doing arithmetic
                    const numValue = typeof value === 'number' ? value : 0;
                    const percentage = total > 0 ? ((numValue / total) * 100).toFixed(1) : '0';
                    return [`${value} (${percentage}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center py-12">
                <svg className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-neutral-500 dark:text-neutral-400">No abnormal parameters found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CategoryDistributionChart;

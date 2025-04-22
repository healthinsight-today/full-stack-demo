import React from 'react';
import { Parameter } from '../../types/Report';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ParameterInfoTooltip from '../common/ParameterInfoTooltip';

interface ParameterBadgeProps {
  parameter: Parameter;
  className?: string;
}

const ParameterBadge: React.FC<ParameterBadgeProps> = ({ parameter, className = '' }) => {
  // Determine styling based on abnormal status
  const valueTextClass = parameter.is_abnormal 
    ? `text-lg font-bold ${parameter.direction === 'high' 
        ? 'text-danger-700 dark:text-danger-300' 
        : 'text-blue-600 dark:text-blue-400'}`
    : 'text-lg font-bold text-success-700 dark:text-success-300';

  return (
    <Card className={`p-3 ${className}`}>
      <div className="flex justify-between">
        <ParameterInfoTooltip parameter={parameter}>
          <span className="font-medium cursor-help">{parameter.name}</span>
        </ParameterInfoTooltip>
        <Badge color={parameter.is_abnormal ? 'danger' : 'success'} size="sm">
          {parameter.is_abnormal ? 'Abnormal' : 'Normal'}
        </Badge>
      </div>
      <div className="mt-1">
        <span className={valueTextClass}>
          {parameter.value} {parameter.unit}
        </span>
        {parameter.reference_range && (
          <span className="block text-xs text-neutral-500 dark:text-neutral-400">
            Reference: {parameter.reference_range}
          </span>
        )}
      </div>
    </Card>
  );
};

export default ParameterBadge; 
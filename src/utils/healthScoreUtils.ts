/**
 * Utilities for working with health scores and indicators
 */

/**
 * Maps a numeric score to a status level
 */
export const mapScoreToStatus = (score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
};

/**
 * Maps a status to a color for visualization
 */
export const mapStatusToColor = (status: string): string => {
  switch (status) {
    case 'excellent': return '#10B981'; // green
    case 'good': return '#22C55E'; // light green
    case 'fair': return '#F59E0B'; // amber
    case 'poor': return '#EF4444'; // red
    case 'critical': return '#991B1B'; // dark red
    default: return '#6B7280'; // gray
  }
};

/**
 * Formats a category score for visualization as a percentage
 */
export const formatCategoryScore = (score: number): string => {
  return `${Math.round(score)}%`;
};

/**
 * Calculates a description for a given health score
 */
export const getScoreDescription = (score: number): string => {
  if (score >= 90) return 'Your health indicators are excellent';
  if (score >= 75) return 'Your health indicators are good overall';
  if (score >= 60) return 'Your health indicators need some attention';
  if (score >= 40) return 'Your health indicators need improvement';
  return 'Your health indicators need urgent attention';
};

/**
 * Prepares data for pie chart visualization of abnormal parameters by severity
 */
export const prepareAbnormalParametersChart = (abnormalParameters: any[]) => {
  if (!abnormalParameters || abnormalParameters.length === 0) {
    return {
      labels: ['No abnormalities'],
      data: [1],
      colors: ['#D1D5DB']
    };
  }

  // Count parameters by severity
  const severityCounts: Record<string, number> = {
    mild: 0,
    moderate: 0,
    severe: 0
  };

  abnormalParameters.forEach(param => {
    if (param.severity && typeof severityCounts[param.severity] === 'number') {
      severityCounts[param.severity]++;
    }
  });

  // Prepare chart data
  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];

  if (severityCounts.mild > 0) {
    labels.push(`Mild (${severityCounts.mild})`);
    data.push(severityCounts.mild);
    colors.push('#FBBF24'); // yellow
  }

  if (severityCounts.moderate > 0) {
    labels.push(`Moderate (${severityCounts.moderate})`);
    data.push(severityCounts.moderate);
    colors.push('#F97316'); // orange
  }

  if (severityCounts.severe > 0) {
    labels.push(`Severe (${severityCounts.severe})`);
    data.push(severityCounts.severe);
    colors.push('#DC2626'); // red
  }

  return {
    labels,
    data,
    colors
  };
}; 
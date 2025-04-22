import React, { useState } from 'react';
import { Parameter } from '../../types/Report';

interface AbnormalParametersViewProps {
  parameters: Parameter[];
}

// Helper function to get explanation for parameters
const getParameterExplanation = (paramName: string): { what: string, impact: string } => {
  const explanations: Record<string, { what: string, impact: string }> = {
    'Total Cholesterol': {
      what: 'Total amount of cholesterol in your blood, including both HDL ("good") and LDL ("bad") types.',
      impact: 'High levels increase risk of heart disease and stroke.'
    },
    'LDL Cholesterol': {
      what: 'Low-density lipoprotein cholesterol, often called "bad" cholesterol.',
      impact: 'High levels can build up in your arteries and form plaque that increases risk of heart disease.'
    },
    'HDL Cholesterol': {
      what: 'High-density lipoprotein cholesterol, known as "good" cholesterol.',
      impact: 'Low levels may increase risk of heart disease. Higher levels are generally better.'
    },
    'Triglycerides': {
      what: 'A type of fat found in your blood that your body uses for energy.',
      impact: 'High levels may contribute to hardening of arteries and increase risk of heart disease and stroke.'
    },
    'Glucose': {
      what: 'Blood sugar level, which is your main source of energy.',
      impact: 'High levels may indicate diabetes or prediabetes.'
    },
    'Hemoglobin': {
      what: 'Protein in red blood cells that carries oxygen throughout your body.',
      impact: 'Low levels may indicate anemia, which can cause fatigue and weakness.'
    },
    'White Blood Cells': {
      what: 'Cells that help fight infections by attacking bacteria, viruses, and germs.',
      impact: 'High levels often indicate infection or inflammation. Low levels may signal immune system issues.'
    },
    'Platelets': {
      what: 'Cell fragments that help your blood clot.',
      impact: 'Low levels increase bleeding risk. High levels may increase risk of blood clots.'
    },
    'Vitamin D': {
      what: 'Nutrient that helps your body absorb calcium and maintain bone health.',
      impact: 'Low levels can lead to bone weakness, affect immune function, and have been linked to other health issues.'
    },
    'Iron': {
      what: 'Mineral needed to produce red blood cells and transport oxygen.',
      impact: 'Low levels can cause anemia. High levels may indicate iron overload conditions.'
    },
    'Creatinine': {
      what: 'Waste product filtered by your kidneys into urine.',
      impact: 'High levels may indicate kidney function problems.'
    },
    'ALT': {
      what: 'Enzyme found primarily in the liver.',
      impact: 'Elevated levels may indicate liver damage or disease.'
    },
    'AST': {
      what: 'Enzyme found in the liver and other tissues.',
      impact: 'Elevated levels may indicate liver damage, heart problems, or muscle issues.'
    },
    'TSH': {
      what: 'Thyroid-stimulating hormone, which regulates thyroid function.',
      impact: 'Low or high levels indicate thyroid gland may not be functioning properly.'
    }
  };
  
  // Try to match parameter name with known parameters
  for (const key in explanations) {
    if (paramName.includes(key)) {
      return explanations[key];
    }
  }
  
  // Default explanation if no match
  return {
    what: 'A health marker measured in your blood or other samples.',
    impact: 'Abnormal levels may require attention from your healthcare provider.'
  };
};

// Format severity text with first letter capitalized
const formatSeverity = (severity: string | null | undefined): string => {
  if (!severity) return '';
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

const AbnormalParametersView: React.FC<AbnormalParametersViewProps> = ({ parameters }) => {
  const [expandedParam, setExpandedParam] = useState<string | null>(null);
  
  // Filter to only show abnormal parameters
  const abnormalParams = parameters.filter(param => 
    (param.reference_min !== null && param.reference_min !== undefined && param.value < param.reference_min) || 
    (param.reference_max !== null && param.reference_max !== undefined && param.value > param.reference_max)
  );

  if (abnormalParams.length === 0) {
    return (
      <div className="p-4 bg-green-50 rounded-lg">
        <p className="text-green-800 font-medium">All parameters are within normal ranges.</p>
      </div>
    );
  }

  // Group parameters by category
  const parametersByCategory: Record<string, Parameter[]> = {};
  abnormalParams.forEach(param => {
    if (!parametersByCategory[param.category]) {
      parametersByCategory[param.category] = [];
    }
    parametersByCategory[param.category].push(param);
  });
  
  // Toggle explanation display for a parameter
  const toggleExplanation = (paramName: string) => {
    if (expandedParam === paramName) {
      setExpandedParam(null);
    } else {
      setExpandedParam(paramName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Abnormal Parameters</h2>
        <p className="text-gray-600">
          {abnormalParams.length} parameter{abnormalParams.length !== 1 ? 's' : ''} outside normal range
        </p>
      </div>

      {Object.entries(parametersByCategory).map(([category, params]) => (
        <div key={category} className="rounded-lg overflow-hidden border">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium text-gray-800">{category}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Range
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {params.map(param => {
                const isAboveNormal = param.reference_max !== null && param.reference_max !== undefined && param.value > param.reference_max;
                const isBelowNormal = param.reference_min !== null && param.reference_min !== undefined && param.value < param.reference_min;
                const explanation = getParameterExplanation(param.name);
                
                return (
                  <React.Fragment key={param.name}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${expandedParam === param.name ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleExplanation(param.name)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{param.name}</div>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${expandedParam === param.name ? 'transform rotate-180' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          isAboveNormal ? 'text-red-600' : isBelowNormal ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {param.value} {param.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{param.reference_range}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isAboveNormal 
                            ? param.severity === 'severe' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : param.severity === 'moderate' 
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : param.severity === 'severe' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : param.severity === 'moderate' 
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {isAboveNormal ? 'Above normal' : 'Below normal'}
                          {param.severity && ` • ${formatSeverity(param.severity)}`}
                        </span>
                      </td>
                    </tr>
                    {expandedParam === param.name && (
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="text-sm">
                            <div className="mb-2">
                              <span className="font-medium text-gray-800">What is this?</span>
                              <p className="text-gray-600">{explanation.what}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">What does it mean?</span>
                              <p className="text-gray-600">{explanation.impact}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AbnormalParametersView; 
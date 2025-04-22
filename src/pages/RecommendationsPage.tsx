import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import type { IconBaseProps } from 'react-icons';
import { 
  FaUserMd, 
  FaFlask, 
  FaAppleAlt, 
  FaRunning 
} from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface HealthCondition {
  name: string;
  description: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  confidence: number;
  recommendations: Array<{
    text: string;
    type: 'medical' | 'dietary' | 'lifestyle' | 'testing';
    priority: 'high' | 'medium' | 'low';
  }>;
}

const RecommendationsPage: React.FC = () => {
  const [selectedCondition, setSelectedCondition] = useState<HealthCondition>({
    name: "Subclinical Hypothyroidism",
    description: "Your TSH level is elevated while your T3 and T4 levels are normal. This pattern is typical of subclinical hypothyroidism, which is an early stage of thyroid underactivity.",
    severity: "Moderate",
    confidence: 90,
    recommendations: [
      {
        text: "Consult with an endocrinologist to evaluate your thyroid function",
        type: "medical",
        priority: "high"
      },
      {
        text: "Consider thyroid antibody testing to check for autoimmune thyroiditis",
        type: "testing",
        priority: "medium"
      },
      {
        text: "Ensure adequate iodine intake through iodized salt and seafood",
        type: "dietary",
        priority: "medium"
      },
      {
        text: "Reduce stress through relaxation techniques as stress can impact thyroid function",
        type: "lifestyle",
        priority: "medium"
      }
    ]
  });

  const healthConditions: HealthCondition[] = [
    {
      name: "Subclinical Hypothyroidism",
      description: "Your TSH level is elevated while your T3 and T4 levels are normal. This pattern is typical of subclinical hypothyroidism, which is an early stage of thyroid underactivity.",
      severity: "Moderate",
      confidence: 90,
      recommendations: [
        {
          text: "Consult with an endocrinologist to evaluate your thyroid function",
          type: "medical",
          priority: "high"
        },
        {
          text: "Consider thyroid antibody testing to check for autoimmune thyroiditis",
          type: "testing",
          priority: "medium"
        },
        {
          text: "Ensure adequate iodine intake through iodized salt and seafood",
          type: "dietary",
          priority: "medium"
        },
        {
          text: "Reduce stress through relaxation techniques as stress can impact thyroid function",
          type: "lifestyle",
          priority: "medium"
        }
      ]
    },
    {
      name: "Vitamin D Deficiency",
      description: "Your Vitamin D level is significantly below the recommended range, indicating a severe deficiency.",
      severity: "Severe",
      confidence: 95,
      recommendations: [
        {
          text: "Consult with your physician about vitamin D supplementation (typically 5000-10000 IU daily for severe deficiency)",
          type: "medical",
          priority: "high"
        },
        {
          text: "Increase sun exposure to 15-30 minutes several times a week (without sunscreen on arms and legs)",
          type: "lifestyle",
          priority: "high"
        },
        {
          text: "Include vitamin D-rich foods in your diet such as fatty fish, egg yolks, and fortified dairy products",
          type: "dietary",
          priority: "medium"
        },
        {
          text: "Follow up with vitamin D testing after 3 months of supplementation to ensure levels are improving",
          type: "testing",
          priority: "medium"
        }
      ]
    },
    {
      name: "Borderline Dyslipidemia",
      description: "Your lipid profile shows elevated levels of total cholesterol, LDL (bad) cholesterol, and non-HDL cholesterol.",
      severity: "Moderate",
      confidence: 85,
      recommendations: [
        {
          text: "Reduce intake of saturated fats found in red meat, full-fat dairy products, and processed foods",
          type: "dietary",
          priority: "high"
        },
        {
          text: "Increase consumption of omega-3 rich foods such as fatty fish, walnuts, and flaxseeds",
          type: "dietary",
          priority: "high"
        },
        {
          text: "Engage in regular aerobic exercise for at least 150 minutes per week",
          type: "lifestyle",
          priority: "high"
        },
        {
          text: "Maintain a healthy weight through balanced diet and regular exercise",
          type: "lifestyle",
          priority: "medium"
        },
        {
          text: "Follow up with your physician in 3-6 months to recheck your lipid profile",
          type: "medical",
          priority: "medium"
        }
      ]
    }
  ];

  const lipidProfileData = {
    labels: ['HDL', 'LDL', 'Triglycerides', 'VLDL'],
    datasets: [
      {
        data: [44, 28, 16, 12],
        backgroundColor: [
          '#4ade80', // green for HDL (good)
          '#f87171', // red for LDL (bad)
          '#fbbf24', // yellow for Triglycerides
          '#93c5fd'  // blue for VLDL
        ],
        borderColor: [
          '#22c55e',
          '#ef4444',
          '#f59e0b',
          '#60a5fa'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgb(156 163 175)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Lipid Profile Distribution',
        color: 'rgb(156 163 175)',
        font: {
          size: 14,
          weight: 'bold' as const
        }
      }
    },
    maintainAspectRatio: true,
    responsive: true
  };

  const getTypeIcon = (type: string) => {
    const iconProps: IconBaseProps = { className: "w-5 h-5" };
    
    switch (type) {
      case 'medical':
        return FaUserMd(iconProps);
      case 'testing':
        return FaFlask(iconProps);
      case 'dietary':
        return FaAppleAlt(iconProps);
      case 'lifestyle':
        return FaRunning(iconProps);
      default:
        return FaUserMd(iconProps);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'testing':
        return 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'dietary':
        return 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'lifestyle':
        return 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <PageContainer title="Supplement Recommendations for Report #latest">
      <div className="flex min-h-screen bg-white dark:bg-neutral-900">
        {/* Left Sidebar - Health Conditions */}
        <div className="w-80 border-r border-neutral-200 dark:border-neutral-800">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Health Conditions
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Based on your test results from 2025-01-22
            </p>
            <div className="space-y-2">
              {healthConditions.map((condition) => (
                <button
                  key={condition.name}
                  onClick={() => setSelectedCondition(condition)}
                  className={`w-full text-left p-4 rounded-lg ${
                    selectedCondition.name === condition.name
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500/50'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    {condition.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">
                    {condition.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {condition.severity}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {condition.confidence}% confidence
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {selectedCondition.name}
              </h1>
              
              {selectedCondition.name === "Borderline Dyslipidemia" && (
                <div className="mt-4 mb-6 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                  <div className="w-64 h-64 mx-auto">
                    <Doughnut data={lipidProfileData} options={chartOptions} />
                  </div>
                </div>
              )}

              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {selectedCondition.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${selectedCondition.severity === 'Severe' 
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                      : selectedCondition.severity === 'Moderate'
                      ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                    {selectedCondition.severity} Severity
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {selectedCondition.confidence}% confidence
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedCondition.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className={`p-3 rounded-lg ${getTypeColor(rec.type)}`}>
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900 dark:text-white font-medium">
                      {rec.text}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(rec.type)}`}>
                        {rec.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default RecommendationsPage;

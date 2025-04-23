import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  // Sample data - in a real app, this would come from an API
  const recentReports = [
    { id: 1, date: 'Apr 2, 2023', type: 'Complete Blood Count', lab: 'LifeLabs', status: 'normal' },
    { id: 2, date: 'Mar 15, 2023', type: 'Lipid Panel', lab: 'Quest Diagnostics', status: 'attention' },
    { id: 3, date: 'Feb 28, 2023', type: 'Vitamin D', lab: 'LabCorp', status: 'low' },
  ];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusColors = {
      normal: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Recent Reports Section */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Recent Reports</h1>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Report Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Lab/Hospital</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-4 text-sm text-neutral-900">{report.date}</td>
                    <td className="px-4 py-4 text-sm text-neutral-900">{report.type}</td>
                    <td className="px-4 py-4 text-sm text-neutral-900">{report.lab}</td>
                    <td className="px-4 py-4 text-sm text-neutral-900">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <Link to={`/reports/${report.id}`} className="text-brand-purple hover:text-brand-purple-dark">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Health Insights Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Health Insights</h2>
        <div className="space-y-4">
          {/* LDL Insight */}
          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-start">
              <div className="mr-3 text-yellow-500">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">LDL Cholesterol is Above Optimal</h3>
                <p className="text-neutral-600">
                  Your LDL cholesterol is slightly elevated at 128 mg/dL. The optimal level is below 100 mg/dL. Consider dietary changes and consult with a healthcare provider.
                </p>
              </div>
            </div>
          </Card>

          {/* Vitamin D Insight */}
          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-start">
              <div className="mr-3 text-yellow-500">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Vitamin D Insufficiency</h3>
                <p className="text-neutral-600">
                  Your Vitamin D level is 28 ng/mL, which is below the optimal range of 30-50 ng/mL. Consider more sun exposure and supplementation.
                </p>
              </div>
            </div>
          </Card>

          {/* Specialist Recommendation */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start">
              <div className="mr-3 text-blue-500">
                <InformationCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Recommended Specialists</h3>
                <p className="text-neutral-600">
                  Based on your recent lab results, a consultation with a cardiologist and nutritionist might be beneficial. View recommended specialists in your area.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

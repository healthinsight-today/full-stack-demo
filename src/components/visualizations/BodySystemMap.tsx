import React, { useState } from 'react';
import { Report, Parameter } from '../../types/Report';
import Card from '../common/Card';

interface BodySystemMapProps {
  report: Report;
  className?: string;
  onSystemClick?: (system: string) => void;
}

// Define body systems and their associated parameters
const BODY_SYSTEMS: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  parameters: string[];
  sections: string[];
  iconPath: string;
  icon: React.ReactNode;
  keyFacts: string[];
}> = {
  cardiovascular: {
    title: 'Cardiovascular System',
    description: 'Heart and blood vessel health',
    longDescription: 'The cardiovascular system pumps blood throughout your body, delivering oxygen and nutrients while removing waste products. Tests in this category evaluate heart health and circulation.',
    parameters: ['Cholesterol Total', 'Cholesterol-HDL', 'Cholesterol-LDL', 'Triglycerides-TGL', 'Non HDL Cholesterol'],
    sections: ['Clinical Biochemistry - Lipid Profile'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
    ),
    keyFacts: [
      'Cholesterol levels indicate risk for heart disease and stroke',
      'HDL ("good" cholesterol) helps remove other forms of cholesterol',
      'LDL ("bad" cholesterol) can build up in artery walls',
      'Triglycerides are a type of fat that can contribute to heart disease'
    ]
  },
  blood: {
    title: 'Blood & Immune System',
    description: 'Blood cells and immune function',
    longDescription: 'Your blood contains red cells (carrying oxygen), white cells (fighting infection), and platelets (for clotting). These tests evaluate cellular components of blood and immune function.',
    parameters: ['Hemoglobin', 'Red Blood Cells', 'White Blood Cells', 'Platelets', 'Neutrophils', 'Lymphocytes', 'Basophils'],
    sections: ['Hematology - Complete Blood Count'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-600">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0 0 1.5h1.5a3.75 3.75 0 0 0 3.75-3.75v-.75a.75.75 0 0 0-.75-.75H10.5a.75.75 0 0 1 0-1.5h3.75a.75.75 0 0 0 0-1.5h-3A2.25 2.25 0 0 0 9 7.5Z" clipRule="evenodd" />
      </svg>
    ),
    keyFacts: [
      'Red blood cells carry oxygen to tissues throughout the body',
      'White blood cells are part of the immune system that fights infections',
      'Platelets help blood clot after injury',
      'Abnormal counts may indicate infection, anemia, or other conditions'
    ]
  },
  kidney: {
    title: 'Kidney Function',
    description: 'Renal filtration and waste removal',
    longDescription: 'Your kidneys filter waste products from blood and regulate fluid balance, electrolyte levels, and blood pressure. These tests assess how well your kidneys are working.',
    parameters: ['Creatinine', 'Blood Urea Nitrogen (BUN)', 'GFR by MDRD Formula', 'Urea-Serum'],
    sections: ['Clinical Biochemistry - Kidney Function'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-pink-700">
        <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 0 1 .878.645 49.17 49.17 0 0 1 .376 5.452.657.657 0 0 1-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 0 0-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 0 1-.595 4.845.75.75 0 0 1-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 0 1-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 0 1-.658.643 49.118 49.118 0 0 1-4.708-.36.75.75 0 0 1-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 0 1 5.337 15c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.036 0 1.875-1.007 1.875-2.25S8.336 11.25 7.3 11.25c-.369 0-.713.128-1.003.349-.283.215-.604.401-.959.401a.656.656 0 0 1-.658-.663 47.989 47.989 0 0 1 .548-4.929.75.75 0 0 1 .863-.651c1.598.246 3.209.424 4.831.529a.578.578 0 0 1 .578.598Z" />
      </svg>
    ),
    keyFacts: [
      'The kidneys filter about 120-150 quarts of blood daily',
      'GFR (Glomerular Filtration Rate) is the best measure of kidney function',
      'Creatinine is a waste product from muscle metabolism',
      'High levels of waste products may indicate kidney disease'
    ]
  },
  liver: {
    title: 'Liver Function',
    description: 'Hepatic processing and detoxification',
    longDescription: 'Your liver processes nutrients, filters toxins, produces proteins, and helps with digestion. These tests evaluate how well your liver is performing these vital functions.',
    parameters: ['Bilirubin(Total)', 'SGOT (AST)', 'SGPT (ALT)', 'Alkaline Phosphatase', 'Total Protein', 'Albumin'],
    sections: ['Clinical Biochemistry - Liver Function'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-700">
        <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
        <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.133 2.845a.75.75 0 0 1 1.06 0l1.72 1.72 1.72-1.72a.75.75 0 1 1 1.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 1 1-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 1 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    ),
    keyFacts: [
      'The liver processes nutrients from food into forms the body can use',
      'It detoxifies harmful substances in the blood',
      'Liver enzymes (AST, ALT) leak into the blood when liver cells are damaged',
      'Elevated enzymes may indicate hepatitis, fatty liver, or other conditions'
    ]
  },
  thyroid: {
    title: 'Thyroid Function',
    description: 'Metabolism and hormone regulation',
    longDescription: 'Your thyroid gland produces hormones that regulate metabolism, growth, and development. These tests assess thyroid hormone levels and function.',
    parameters: ['TSH-Thyroid Stimulating Hormone', 'T3 (Triiodothyronine)', 'T4 (Thyroxine)'],
    sections: ['Clinical Biochemistry - Thyroid Function'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
        <path d="M11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    ),
    keyFacts: [
      'The thyroid produces hormones that control your metabolism',
      'TSH from the pituitary gland regulates thyroid hormone production',
      'T3 and T4 are the active thyroid hormones that affect nearly every process in the body',
      'Thyroid disorders can affect energy, weight, mood, and many body functions'
    ]
  },
  metabolism: {
    title: 'Glucose Metabolism',
    description: 'Blood sugar regulation and diabetes risk',
    longDescription: 'These tests evaluate how your body processes sugar (glucose), which is a vital source of energy. Abnormal results may indicate diabetes or prediabetes.',
    parameters: ['Glucose Fasting (F)', 'Glycated Hemoglobin (HbA1c)', 'Mean Plasma Glucose'],
    sections: ['Clinical Biochemistry - Glucose Metabolism'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-600">
        <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
      </svg>
    ),
    keyFacts: [
      'Insulin produced by the pancreas helps control blood sugar levels',
      'Fasting glucose shows blood sugar after not eating for 8-12 hours',
      'HbA1c reflects average blood sugar over the past 2-3 months',
      'Consistently high blood sugar can damage blood vessels and nerves'
    ]
  },
  nutrition: {
    title: 'Nutritional Status',
    description: 'Vitamin and mineral levels',
    longDescription: 'These tests assess levels of essential vitamins and minerals in your body. Deficiencies can impact immune function, energy levels, and overall health.',
    parameters: ['Iron Saturation(% Transferrin Saturation)', 'Ferritin', '25-Hydroxy Vitamin D', 'Vitamin B12', 'Total Iron'],
    sections: ['Clinical Biochemistry - Iron Profile', 'Clinical Biochemistry - Vitamins'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
        <path fillRule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
      </svg>
    ),
    keyFacts: [
      'Vitamin D is crucial for bone health and immune function',
      'Iron is essential for red blood cell production and oxygen transport',
      'Vitamin B12 is needed for nerve function and red blood cell formation',
      'Deficiencies can cause fatigue, weakened immunity, and other symptoms'
    ]
  },
  urinary: {
    title: 'Urinary System',
    description: 'Bladder and urinary health',
    longDescription: 'Urinalysis evaluates components in urine to detect kidney disease, urinary tract infections, diabetes, and other conditions affecting the urinary system.',
    parameters: ['Colour', 'Appearance', 'Specific Gravity', 'Glucose', 'Protein', 'Blood', 'Reaction (pH)'],
    sections: ['Clinical Pathology - Urine Analysis'],
    iconPath: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-400">
        <path fillRule="evenodd" d="M1.5 9.832v1.793c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V9.832a3 3 0 0 0-.722-1.952l-3.285-3.832A3 3 0 0 0 16.215 3h-8.43a3 3 0 0 0-2.278 1.048L2.222 7.88A3 3 0 0 0 1.5 9.832ZM14.25 21 18 17.25l.04-.0399.041.0399L21.75 21l-2.665-2.665-.581-.581-.581.58L14.25 21Z" clipRule="evenodd" />
      </svg>
    ),
    keyFacts: [
      'Urine color and clarity can indicate hydration, infection, or presence of blood',
      'Protein in urine may suggest kidney problems',
      'Glucose in urine could indicate diabetes',
      'Urine pH can be affected by diet, medications, and certain medical conditions'
    ]
  }
};

const BodySystemMap: React.FC<BodySystemMapProps> = ({ report, className = '', onSystemClick }) => {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  // Calculate health status for each system
  const getSystemHealth = (systemId: string): {
    status: 'normal' | 'mild' | 'moderate' | 'severe';
    abnormalCount: number;
    totalCount: number;
    abnormalParameters: Parameter[];
  } => {
    const system = BODY_SYSTEMS[systemId];
    const relevantSections = report.test_sections.filter(section => 
      system.sections.includes(section.section_name)
    );
    
    // Get all parameters that match this system's parameter list or are in matching sections
    const allSystemParameters: Parameter[] = [];
    
    relevantSections.forEach(section => {
      section.parameters.forEach(param => {
        if (system.parameters.includes(param.name) || system.sections.includes(section.section_name)) {
          allSystemParameters.push(param);
        }
      });
    });
    
    // Count abnormal parameters
    const abnormalParameters = allSystemParameters.filter(param => param.is_abnormal);
    const abnormalCount = abnormalParameters.length;
    const totalCount = allSystemParameters.length;
    
    // Determine severity based on abnormal count and severity
    let status: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
    
    if (abnormalCount > 0) {
      // Check if any parameter has severe status
      if (abnormalParameters.some(param => param.severity === 'severe')) {
        status = 'severe';
      } 
      // Check if any parameter has moderate status
      else if (abnormalParameters.some(param => param.severity === 'moderate')) {
        status = 'moderate';
      }
      // Otherwise it's mild
      else {
        status = 'mild';
      }
    }

    return { status, abnormalCount, totalCount, abnormalParameters };
  };
  
  // Handle clicking on a system
  const handleSystemClick = (systemId: string) => {
    setSelectedSystem(systemId === selectedSystem ? null : systemId);
    if (onSystemClick) {
      onSystemClick(systemId);
    }
  };
  
  // Get status color
  const getStatusColor = (status: 'normal' | 'mild' | 'moderate' | 'severe') => {
    switch (status) {
      case 'normal':
        return 'text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30';
      case 'mild':
        return 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30';
      case 'moderate':
        return 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30';
      case 'severe':
        return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30';
      default:
        return 'text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/10 border-neutral-200 dark:border-neutral-800/30';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white">Body Systems Health Map</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Click on any system to see detailed information about related test parameters
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(BODY_SYSTEMS).map(([systemId, system]) => {
          const health = getSystemHealth(systemId);
          const statusColor = getStatusColor(health.status);
          const isSelected = systemId === selectedSystem;
          
          return (
            <div 
              key={systemId}
              onClick={() => handleSystemClick(systemId)}
              className={`
                relative rounded-lg border p-4 cursor-pointer transition-all
                hover:shadow-md hover:scale-[1.02] 
                ${statusColor}
                ${isSelected ? 'ring-2 ring-primary-500 shadow-md' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-12 h-12 mr-3 flex items-center justify-center`}>
                    {/* Placeholder for custom organ icon - in production would use real image */}
                    <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/30 p-1 flex items-center justify-center">
                      {system.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800 dark:text-white flex items-center">
                      {system.title}
                      <button 
                        className="ml-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSystem(systemId);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{system.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-3">
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    health.status === 'normal' ? 'bg-green-500' :
                    health.status === 'mild' ? 'bg-amber-500' :
                    health.status === 'moderate' ? 'bg-orange-500' :
                    'bg-red-500'
                  } mr-2`}></span>
                  <span className="capitalize">{health.status}</span>
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  {health.abnormalCount > 0 ? 
                    `${health.abnormalCount}/${health.totalCount} abnormal` : 
                    'All normal'
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Detail panel for selected system */}
      {selectedSystem && (
        <Card className="mt-4 p-5 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-3 flex items-center justify-center bg-white/80 dark:bg-gray-800/30 rounded-full p-1">
                {BODY_SYSTEMS[selectedSystem].icon}
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
                {BODY_SYSTEMS[selectedSystem].title} Details
              </h3>
            </div>
            <button 
              onClick={() => setSelectedSystem(null)}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 mb-5">
            <p className="text-neutral-700 dark:text-neutral-300">
              {BODY_SYSTEMS[selectedSystem].longDescription}
            </p>
            
            <div className="mt-4">
              <h4 className="font-medium text-neutral-800 dark:text-white mb-2">Key Facts</h4>
              <ul className="space-y-1">
                {BODY_SYSTEMS[selectedSystem].keyFacts.map((fact, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-800 dark:text-white flex items-center">
              Parameters
              <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                ({getSystemHealth(selectedSystem).abnormalCount} abnormal of {getSystemHealth(selectedSystem).totalCount} total)
              </span>
            </h4>
            
            {/* Get all parameters for this system */}
            {report.test_sections
              .filter(section => BODY_SYSTEMS[selectedSystem].sections.includes(section.section_name))
              .flatMap(section => section.parameters)
              .filter(param => BODY_SYSTEMS[selectedSystem].parameters.includes(param.name) || 
                        BODY_SYSTEMS[selectedSystem].sections.includes(
                          report.test_sections.find(s => 
                            s.parameters.some(p => p.name === param.name)
                          )?.section_name || '')
              )
              .map(param => {
                const abnormalClass = param.is_abnormal ? (
                  param.direction === 'high' ? 
                    'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500' :
                    'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500'
                ) : '';
                
                return (
                  <div 
                    key={param.name} 
                    className={`p-3 rounded-md ${abnormalClass}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-white">{param.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Reference: {param.reference_range} {param.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-lg ${
                          param.is_abnormal ? (
                            param.direction === 'high' ? 'text-red-600 dark:text-red-400' : 
                            'text-blue-600 dark:text-blue-400'
                          ) : 'text-green-600 dark:text-green-400'
                        }`}>
                          {param.value} {param.unit}
                          {param.is_abnormal && (
                            <span className="ml-2">
                              {param.direction === 'high' ? '↑' : '↓'}
                            </span>
                          )}
                        </p>
                        <p className="text-sm mt-1">
                          {param.is_abnormal ? (
                            <span className={`
                              ${param.severity === 'mild' ? 'text-amber-600 dark:text-amber-400' : 
                                param.severity === 'moderate' ? 'text-orange-600 dark:text-orange-400' : 
                                'text-red-600 dark:text-red-400'}
                            `}>
                              {param.direction === 'high' ? 'High' : 'Low'} ({param.severity})
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Normal</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {param.is_abnormal && param.name in report.abnormal_parameters && (
                      <div className="mt-3 text-sm border-t border-neutral-200 dark:border-neutral-700 pt-2 text-neutral-700 dark:text-neutral-300">
                        <p className="font-medium mb-1">Possible causes:</p>
                        <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                          {report.abnormal_parameters
                            .find(ap => ap.name === param.name)?.potential_causes?.map((cause, i) => (
                              <li key={i}>{cause}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BodySystemMap; 
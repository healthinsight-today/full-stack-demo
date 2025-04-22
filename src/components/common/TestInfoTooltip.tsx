import React, { useState, useRef } from 'react';

interface TestInfoTooltipProps {
  sectionName: string;
  children: React.ReactNode;
}

// Test descriptions for different test sections
const TEST_DESCRIPTIONS: Record<string, { short: string; details: string[] }> = {
  "Clinical Biochemistry - Kidney Function": {
    short: "Assesses how well your kidneys are filtering waste from your blood",
    details: [
      "Creatinine levels indicate kidney filtration efficiency",
      "BUN measures waste product levels in your blood",
      "GFR estimates how much blood passes through your kidneys per minute",
      "Abnormal results may suggest kidney damage or disease"
    ]
  },
  "Clinical Biochemistry - Glucose Metabolism": {
    short: "Evaluates how your body processes and manages blood sugar",
    details: [
      "Fasting glucose shows your blood sugar levels after not eating",
      "HbA1c reflects your average blood sugar over the past 2-3 months",
      "Helps detect diabetes, prediabetes, or hypoglycemia",
      "Regular monitoring is important for those with diabetes or at risk"
    ]
  },
  "Clinical Biochemistry - Lipid Profile": {
    short: "Measures fats in your blood that affect cardiovascular health",
    details: [
      "Cholesterol levels (total, HDL, LDL) indicate heart disease risk",
      "Triglycerides are fats that can contribute to heart disease",
      "Helps assess risk of heart attack, stroke, and arterial disease",
      "Abnormal values may indicate need for lifestyle changes or medication"
    ]
  },
  "Clinical Biochemistry - Liver Function": {
    short: "Checks how well your liver is working and detects liver damage",
    details: [
      "Enzymes like AST and ALT indicate liver cell damage when elevated",
      "Bilirubin levels can indicate problems with bile flow or red blood cell breakdown",
      "Albumin and total protein reflect liver's ability to produce proteins",
      "Can detect conditions like hepatitis, cirrhosis, or medication effects"
    ]
  },
  "Clinical Biochemistry - Iron Profile": {
    short: "Evaluates iron levels and how iron is stored and used in your body",
    details: [
      "Serum iron measures the amount of iron in your blood",
      "Ferritin reflects your body's iron stores",
      "Transferrin saturation shows how much iron is bound to transferrin protein",
      "Helps diagnose anemia, iron deficiency, or iron overload conditions"
    ]
  },
  "Clinical Biochemistry - Thyroid Function": {
    short: "Assesses how well your thyroid gland is functioning",
    details: [
      "TSH (Thyroid Stimulating Hormone) is the primary indicator of thyroid function",
      "T3 and T4 are the active thyroid hormones that regulate metabolism",
      "Can detect hypothyroidism (underactive thyroid) or hyperthyroidism (overactive thyroid)",
      "Thyroid disorders can affect energy levels, weight, mood, and many body systems"
    ]
  },
  "Clinical Biochemistry - Vitamins": {
    short: "Measures levels of essential vitamins in your body",
    details: [
      "Vitamin D is crucial for bone health and immune function",
      "Vitamin B12 is needed for nerve function and red blood cell formation",
      "Folate (B9) is important for cell growth and preventing birth defects",
      "Deficiencies can cause various health problems and symptoms"
    ]
  },
  "Hematology - Complete Blood Count": {
    short: "Analyzes different components of your blood",
    details: [
      "Red blood cell count, hemoglobin, and hematocrit assess oxygen-carrying capacity",
      "White blood cell count measures immune system cells that fight infection",
      "Platelet count evaluates cells that help blood clot properly",
      "Can detect anemia, infection, inflammation, bleeding disorders, and more"
    ]
  },
  "Clinical Pathology - Urine Analysis": {
    short: "Examines the content of your urine to check kidney health and detect other conditions",
    details: [
      "Physical properties like color, clarity, and specific gravity provide basic information",
      "Chemical tests check for protein, glucose, ketones, blood, and other substances",
      "Microscopic examination looks for cells, crystals, and bacteria",
      "Can detect urinary tract infections, kidney disease, diabetes, and liver problems"
    ]
  }
};

const TestInfoTooltip: React.FC<TestInfoTooltipProps> = ({ sectionName, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Default description if section not found
  const defaultDescription = {
    short: "Information about this test panel",
    details: ["This panel measures key health indicators"]
  };

  const testInfo = TEST_DESCRIPTIONS[sectionName] || defaultDescription;

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      {/* Trigger element with hover behavior */}
      <div 
        className="flex items-center cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowCard(!showCard)}
      >
        {children}
        <div className="ml-2 text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Hover tooltip */}
      {showTooltip && !showCard && (
        <div 
          className="absolute z-10 w-64 max-w-sm p-3 mt-2 -ml-20 text-sm rounded-lg shadow-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          style={{ top: "100%", left: "50%" }}
        >
          <div className="font-medium text-neutral-800 dark:text-white mb-1">{sectionName}</div>
          <p className="text-neutral-600 dark:text-neutral-300">{testInfo.short}</p>
          <div className="text-xs mt-2 text-primary-600 dark:text-primary-400">
            Click for more details
          </div>
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rotate-45 bg-white dark:bg-neutral-800 border-t border-l border-neutral-200 dark:border-neutral-700"></div>
        </div>
      )}

      {/* Expanded card on click */}
      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowCard(false)}>
          <div 
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{sectionName}</h3>
              <button 
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={() => setShowCard(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-neutral-700 dark:text-neutral-300 mb-3">{testInfo.short}</p>
              <h4 className="text-sm font-medium text-neutral-800 dark:text-white mb-2">What this test measures:</h4>
              <ul className="space-y-2">
                {testInfo.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1 text-primary-500">•</span>
                    <span className="text-neutral-600 dark:text-neutral-400 text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                This information is for educational purposes only. Always consult a healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInfoTooltip; 
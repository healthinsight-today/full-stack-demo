import React, { useState } from 'react';
import { Parameter } from '../../types/Report';

interface ParameterInfoTooltipProps {
  parameter: Parameter;
  children: React.ReactNode;
}

// Parameter descriptions for common test parameters
const PARAMETER_DESCRIPTIONS: Record<string, { short: string; details: string; normalIndicates: string }> = {
  // Kidney function parameters
  "GFR by MDRD Formula": {
    short: "Glomerular Filtration Rate - measures kidney filtering capacity",
    details: "GFR estimates how much blood passes through your kidneys' tiny filters each minute. It's the best overall indicator of kidney function.",
    normalIndicates: "Your kidneys are filtering blood efficiently"
  },
  "BUN/Creatinine Ratio": {
    short: "Ratio showing balance between blood urea nitrogen and creatinine",
    details: "This ratio helps differentiate between kidney problems and other conditions that might affect kidney markers.",
    normalIndicates: "Good balance between kidney filtration markers"
  },
  "Blood Urea Nitrogen (BUN)": {
    short: "Measures waste product levels in your blood",
    details: "BUN is a waste product created when protein breaks down in your body. Your kidneys filter it from your blood.",
    normalIndicates: "Your kidneys are removing waste products effectively"
  },
  "Creatinine": {
    short: "Waste product from muscle metabolism",
    details: "Creatinine is produced by your muscles and filtered by your kidneys. Levels remain fairly constant when kidney function is normal.",
    normalIndicates: "Your kidneys are filtering creatinine effectively"
  },

  // Glucose metabolism parameters
  "Glucose Fasting (F)": {
    short: "Blood sugar level after not eating for at least 8 hours",
    details: "This test measures your blood sugar (glucose) when you haven't eaten, providing a baseline level of your glucose.",
    normalIndicates: "Your body regulates blood sugar effectively when fasting"
  },
  "Glycated Hemoglobin (HbA1c)": {
    short: "Average blood sugar over the past 2-3 months",
    details: "HbA1c shows the percentage of hemoglobin proteins in your blood that are coated with sugar, reflecting long-term glucose control.",
    normalIndicates: "Your blood sugar has been well-controlled over recent months"
  },
  "Mean Plasma Glucose": {
    short: "Calculated average blood glucose level",
    details: "This is calculated from your HbA1c result to show the estimated average glucose level over recent months.",
    normalIndicates: "Your average blood glucose level has been in a healthy range"
  },

  // Lipid profile parameters
  "Cholesterol Total": {
    short: "Total amount of cholesterol in your blood",
    details: "Measures all types of cholesterol circulating in your bloodstream, including HDL, LDL, and VLDL.",
    normalIndicates: "Your overall cholesterol levels are within healthy range"
  },
  "Triglycerides-TGL": {
    short: "Type of fat found in your blood",
    details: "Triglycerides are fats that circulate in your blood and can contribute to heart disease when elevated.",
    normalIndicates: "Your blood fat levels are within healthy range"
  },
  "Cholesterol-HDL": {
    short: "High-density lipoprotein ('good' cholesterol)",
    details: "HDL cholesterol helps remove other forms of cholesterol from your bloodstream and is protective against heart disease.",
    normalIndicates: "You have healthy levels of protective cholesterol"
  },
  "Cholesterol-LDL": {
    short: "Low-density lipoprotein ('bad' cholesterol)",
    details: "LDL cholesterol can build up on the walls of your arteries, increasing risk of heart disease and stroke.",
    normalIndicates: "Your 'bad' cholesterol levels are within healthy limits"
  },

  // Liver function parameters
  "Bilirubin(Total)": {
    short: "Yellowish substance produced when red blood cells break down",
    details: "Bilirubin is processed by the liver and eliminated in bile. High levels can indicate liver problems or bile duct obstruction.",
    normalIndicates: "Your liver is processing bilirubin effectively"
  },
  "SGPT (ALT)": {
    short: "Enzyme mainly found in the liver",
    details: "ALT is released into the bloodstream when liver cells are damaged. Elevated levels can indicate liver inflammation or damage.",
    normalIndicates: "Your liver cells are not showing signs of damage"
  },
  "SGOT (AST)": {
    short: "Enzyme found in the liver and other tissues",
    details: "AST is released when liver, heart, or muscle cells are damaged. Elevated levels may indicate tissue damage.",
    normalIndicates: "Your liver and other tissues appear healthy"
  },
  "Alkaline Phosphatase": {
    short: "Enzyme found in liver, bones, and other tissues",
    details: "This enzyme helps break down proteins in the body and is used to detect liver or bone disorders.",
    normalIndicates: "Your liver and bile ducts are functioning normally"
  },

  // Thyroid function parameters
  "TSH-Thyroid Stimulating Hormone": {
    short: "Hormone that controls thyroid gland activity",
    details: "TSH is produced by the pituitary gland and regulates how much thyroid hormone is produced by the thyroid gland.",
    normalIndicates: "Your pituitary and thyroid glands are communicating properly"
  },
  "T3 (Triiodothyronine)": {
    short: "Active thyroid hormone that regulates metabolism",
    details: "T3 affects nearly every process in your body, including body temperature, growth, and heart rate.",
    normalIndicates: "Your thyroid is producing appropriate amounts of T3"
  },
  "T4 (Thyroxine)": {
    short: "Main thyroid hormone that regulates metabolism",
    details: "T4 is converted to the more active T3 in tissues. Together, these hormones regulate your body's energy use.",
    normalIndicates: "Your thyroid is producing appropriate amounts of T4"
  },

  // Complete blood count parameters
  "Hemoglobin": {
    short: "Protein in red blood cells that carries oxygen",
    details: "Hemoglobin binds to oxygen in the lungs and delivers it to tissues throughout the body.",
    normalIndicates: "Your blood can carry oxygen efficiently"
  },
  "Red Blood Cells (RBC)": {
    short: "Cells that carry oxygen throughout your body",
    details: "RBCs contain hemoglobin and are responsible for delivering oxygen from your lungs to your tissues.",
    normalIndicates: "You have a healthy number of oxygen-carrying cells"
  },
  "White Blood Cells (WBC)": {
    short: "Cells that help fight infection and disease",
    details: "WBCs are part of your immune system and help protect your body against infection and foreign substances.",
    normalIndicates: "Your immune system has normal levels of defense cells"
  },
  "Platelets": {
    short: "Cell fragments that help blood clot",
    details: "Platelets are tiny blood components that help form clots to stop bleeding when you're injured.",
    normalIndicates: "Your blood can form clots properly when needed"
  },

  // Urine analysis parameters
  "Colour": {
    short: "Visual appearance of urine",
    details: "Urine color can vary from pale yellow to amber, depending on concentration and sometimes indicating health issues.",
    normalIndicates: "Your urine shows normal concentration and hydration"
  },
  "Appearance": {
    short: "Clarity of urine sample",
    details: "Normal urine is clear. Cloudiness may indicate infection, kidney issues, or high levels of substances like protein.",
    normalIndicates: "Your urine is free from excess cells or substances"
  },
  "Specific Gravity": {
    short: "Concentration of particles in urine",
    details: "Measures how concentrated your urine is compared to water. Shows how well kidneys concentrate or dilute urine.",
    normalIndicates: "Your kidneys can properly concentrate and dilute urine"
  },
  "Reaction (pH)": {
    short: "Acidity or alkalinity of urine",
    details: "Urine pH can be affected by diet, medications, and certain medical conditions. Very high or low values may indicate issues.",
    normalIndicates: "Your urine has a normal acid-base balance"
  }
};

const ParameterInfoTooltip: React.FC<ParameterInfoTooltipProps> = ({ parameter, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Default description if parameter not found
  const defaultDescription = {
    short: `Information about ${parameter.name}`,
    details: `${parameter.name} is a health parameter with reference range ${parameter.reference_range}${parameter.unit ? ` measured in ${parameter.unit}` : ''}.`,
    normalIndicates: "Values within the reference range are considered normal"
  };

  const paramInfo = PARAMETER_DESCRIPTIONS[parameter.name] || defaultDescription;

  // Status determination
  const getStatusText = () => {
    if (!parameter.is_abnormal) {
      return "Normal: " + paramInfo.normalIndicates;
    } else if (parameter.direction === 'high') {
      return `High: Value is above the reference range (${parameter.reference_range}${parameter.unit})`;
    } else if (parameter.direction === 'low') {
      return `Low: Value is below the reference range (${parameter.reference_range}${parameter.unit})`;
    } else {
      return `Abnormal: Outside the reference range (${parameter.reference_range}${parameter.unit})`;
    }
  };

  // Status color
  const getStatusColor = () => {
    if (!parameter.is_abnormal) return "text-green-600 dark:text-green-400";
    if (parameter.direction === 'high') return "text-red-600 dark:text-red-400";
    if (parameter.direction === 'low') return "text-blue-600 dark:text-blue-400";
    return "text-amber-600 dark:text-amber-400";
  };

  return (
    <div className="relative inline-block">
      {/* Trigger element with hover behavior */}
      <div 
        className="cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="absolute z-10 w-72 max-w-sm p-3 -mt-1 ml-6 text-sm rounded-lg shadow-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="font-medium text-neutral-800 dark:text-white mb-1">{parameter.name}</div>
          <div className="mb-2 text-xs">
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs mb-2">{paramInfo.short}</p>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs">{paramInfo.details}</p>
          
          {/* Arrow */}
          <div className="absolute top-3 -left-2 w-4 h-4 rotate-45 bg-white dark:bg-neutral-800 border-l border-b border-neutral-200 dark:border-neutral-700"></div>
        </div>
      )}
    </div>
  );
};

export default ParameterInfoTooltip; 
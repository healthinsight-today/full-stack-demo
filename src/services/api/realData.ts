import { Report } from '../../types/Report';
import { Insight } from '../../types/Insights';
import { Recommendation } from '../../types/Recommendation';
import { ApiResponse } from '../../types/Api';

// Import the test data
import rawTestData from '../../data/testdata.json';

// Process the raw test data into the format the app expects
const processTestData = (): Report => {
  // Store the raw data for possible direct access
  const _rawData = rawTestData;
  
  // Create a unique ID for the report
  const id = `report-${rawTestData.report_info.report_id}`;
  
  // Map the patient info
  const patientInfo = {
    name: rawTestData.patient_info.name,
    patient_id: rawTestData.patient_info.id,
    age: rawTestData.patient_info.age,
    gender: rawTestData.patient_info.gender,
  };
  
  // Map report info
  const reportInfo = {
    report_id: rawTestData.report_info.report_id,
    report_type: rawTestData.report_info.report_type,
    report_date: rawTestData.report_info.report_date,
    lab_name: rawTestData.report_info.lab_name,
    processing_timestamp: rawTestData.metadata?.processing_timestamp || new Date().toISOString(),
  };
  
  // Map insights to match our app's Insight type
  const insights: Insight[] = [
    {
      id: "insight-1",
      report_id: id,
      title: "Vitamin D Deficiency",
      description: "Your vitamin D levels are below the recommended range.",
      severity: "moderate",
      category: "Vitamin D",
      related_parameters: ["Vitamin D"],
      details: "Low vitamin D can affect bone health and immune function.",
      recommendations: [
        "Consider a vitamin D3 supplement of 1000-2000 IU daily",
        "Increase sun exposure for 15-20 minutes daily",
        "Add vitamin D rich foods to your diet"
      ],
      possible_causes: [
        "Limited sun exposure",
        "Diet low in vitamin D rich foods",
        "Certain medications"
      ],
      action_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "insight-2",
      report_id: id,
      title: "Elevated LDL Cholesterol",
      description: "Your LDL cholesterol is above the recommended range.",
      severity: "moderate",
      category: "Cholesterol",
      related_parameters: ["LDL Cholesterol"],
      details: "Elevated LDL cholesterol increases risk of cardiovascular disease.",
      recommendations: [
        "Limit saturated and trans fats in your diet",
        "Increase soluble fiber intake",
        "Consider regular moderate exercise"
      ],
      possible_causes: [
        "Diet high in saturated fats",
        "Sedentary lifestyle",
        "Genetic factors"
      ],
      action_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "insight-3",
      report_id: id,
      title: "Optimal HDL Cholesterol",
      description: "Your HDL cholesterol is within the recommended range.",
      severity: "mild",
      category: "Cholesterol",
      related_parameters: ["HDL Cholesterol"],
      details: "Healthy HDL levels help protect against heart disease.",
      recommendations: [
        "Maintain current healthy habits",
        "Regular exercise helps maintain healthy HDL levels",
        "Include healthy fats in your diet"
      ],
      possible_causes: [
        "Healthy diet with adequate omega-3 fatty acids",
        "Regular physical activity",
        "Moderate alcohol consumption"
      ],
      action_required: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Map recommendations
  const recommendations: Recommendation[] = rawTestData.insights.flatMap((insight, insightIndex) => 
    insight.recommendations.map((rec, recIndex) => ({
      id: `rec-${insightIndex + 1}-${recIndex + 1}`,
      report_id: id,
      title: rec.text,
      description: rec.text,
      short_description: rec.text.substring(0, 50) + (rec.text.length > 50 ? '...' : ''),
      category: rec.type,
      priority: rec.priority,
      related_parameters: insight.parameters,
      steps: [rec.text],
      benefits: [`Addresses ${insight.condition}`],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  );
  
  // Create a file info object
  const fileInfo = {
    original_filename: `${rawTestData.report_info.report_type.toLowerCase().replace(/\s+/g, '_')}.pdf`,
    storage_path: `/uploads/user/reports/${id}.pdf`,
    mime_type: 'application/pdf',
    size: 1024 * 1024, // 1MB mock size
  };
  
  // Create a processing info object
  const processingInfo = {
    status: 'completed' as const,
    ocr_confidence: rawTestData.metadata?.ocr_confidence || 0.95,
    llm_model: rawTestData.metadata?.model_used || 'GPT-4',
    processing_time: rawTestData.metadata?.processing_time || 3.5,
  };
  
  // Map test sections
  const testSections = rawTestData.test_sections.map(section => ({
    section_id: section.section_id,
    section_name: section.section_name,
    parameters: section.parameters.map(param => {
      // Extract reference min and max from reference_range if not explicitly provided
      let reference_min = param.reference_min || null;
      let reference_max = param.reference_max || null;
      
      if (!reference_min || !reference_max) {
        const rangeMatch = param.reference_range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
        if (rangeMatch) {
          reference_min = parseFloat(rangeMatch[1]);
          reference_max = parseFloat(rangeMatch[2]);
        }
      }
      
      // Determine if value is abnormal
      const is_abnormal = param.is_abnormal || false;
      
      // Map direction and severity to proper types
      let direction: 'high' | 'low' | null = null;
      if (param.direction === 'above') direction = 'high';
      else if (param.direction === 'below') direction = 'low';
      else if (param.direction === 'high') direction = 'high';
      else if (param.direction === 'low') direction = 'low';
      
      let severity: 'mild' | 'moderate' | 'severe' | null = null;
      if (param.severity === 'Medium') severity = 'moderate';
      else if (param.severity === 'High') severity = 'severe';
      else if (param.severity === 'Low') severity = 'mild';
      else if (param.severity === 'mild') severity = 'mild';
      else if (param.severity === 'moderate') severity = 'moderate';
      else if (param.severity === 'severe') severity = 'severe';
      
      // Convert value to number if it's a string but contains a numeric value
      const value = typeof param.value === 'string' ? parseFloat(param.value as string) || 0 : param.value;
      
      return {
        ...param,
        value,
        is_abnormal,
        direction,
        severity,
        reference_min,
        reference_max,
        // Add new required fields:
        category: section.section_name,
        referenceRange: {
          min: reference_min || 0,
          max: reference_max || 100
        }
      };
    })
  }));
  
  // Also update abnormal parameters
  const abnormalParameters = rawTestData.abnormal_parameters.map(param => {
    // Extract reference min and max if needed
    const rangeMatch = param.reference_range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    const reference_min = rangeMatch ? parseFloat(rangeMatch[1]) : 0;
    const reference_max = rangeMatch ? parseFloat(rangeMatch[2]) : 100;
    
    // Convert value to number if it's a string
    const value = typeof param.value === 'string' ? parseFloat(param.value as string) || 0 : param.value;
    
    // Map direction to proper type
    let direction: 'high' | 'low' | null = null;
    if (param.direction === 'above') direction = 'high';
    else if (param.direction === 'below') direction = 'low';
    else if (param.direction === 'high') direction = 'high';
    else if (param.direction === 'low') direction = 'low';
    
    // Map severity to proper type
    let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
    if (param.severity === 'Medium') severity = 'moderate';
    else if (param.severity === 'High') severity = 'severe';
    else if (param.severity === 'Low') severity = 'mild';
    else if (param.severity === 'mild') severity = 'mild';
    else if (param.severity === 'moderate') severity = 'moderate';
    else if (param.severity === 'severe') severity = 'severe';
    
    return {
      ...param,
      value,
      // Ensure required properties exist with proper types
      is_abnormal: true, // Always true for abnormal parameters
      reference_min,
      reference_max,
      direction,
      severity,
      // Add new required fields
      category: param.section,
      referenceRange: {
        min: reference_min,
        max: reference_max
      }
    };
  });
  
  // Extract health indicators
  const healthIndicators = rawTestData.health_indicators || {
    cardiovascular_risk: { score: 6.5, status: "moderate" },
    metabolic_health: { score: 8.2, status: "good" },
    thyroid_function: { score: 5.0, status: "needs attention" },
    nutritional_status: { score: 4.8, status: "needs improvement" }
  };
  
  // Combine all data into a Report object
  const report: Report & { _rawData: any } = {
    id,
    report_info: reportInfo,
    patient_info: patientInfo,
    test_sections: testSections,
    abnormal_parameters: abnormalParameters,
    insights,
    recommendations,
    diet_recommendations: {
      foods_to_increase: rawTestData.diet_recommendations.foods_to_increase,
      foods_to_limit: rawTestData.diet_recommendations.foods_to_limit,
      meal_plan_suggestions: [
        {
          meal_type: 'Breakfast',
          description: 'Steel-cut oats with fresh berries and almonds',
          benefits: ['Sustained energy', 'Heart health', 'Blood sugar control']
        },
        {
          meal_type: 'Lunch',
          description: 'Mediterranean quinoa bowl with chickpeas',
          benefits: ['Plant-based protein', 'Fiber-rich', 'Anti-inflammatory']
        },
        {
          meal_type: 'Dinner',
          description: 'Grilled fish with roasted vegetables',
          benefits: ['Lean protein', 'Essential nutrients', 'Low in saturated fat']
        }
      ]
    },
    processing: processingInfo,
    file: fileInfo,
    user_id: 'user-123',
    filename: fileInfo.original_filename,
    description: `${reportInfo.report_type} from ${reportInfo.lab_name}`,
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    _rawData: rawTestData
  };
  
  return report as any;
};

// Helper function to map urgency strings to our app's expected values
function mapUrgency(urgency: string): 'urgent' | 'soon' | 'routine' {
  if (urgency === 'high') return 'urgent';
  if (urgency === 'medium') return 'soon';
  return 'routine';
}

// Create the processed report
export const realReport = processTestData();

// Export a function to get the real report
export const getRealReport = async (): Promise<ApiResponse<Report>> => {
  // Simulate API call with real data
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    success: true,
    data: realReport,
    status: 200
  };
};

// Export a function that returns an array with the real report
export const getRealReports = async (): Promise<ApiResponse<Report[]>> => {
  // Simulate API call with real data
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    data: [realReport],
    status: 200
  };
}; 
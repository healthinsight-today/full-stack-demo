# Sample Medical Reports for Testing

This directory contains sample medical reports in various formats for testing the medical report analysis functionality of the Trae AI health insights platform.

## Available Sample Reports

1. **General Medical Report** (`sample_report.txt`)
   - A comprehensive internal medicine report
   - Contains lab results, urinalysis, imaging findings, and treatment plan
   - Patient with Type 2 Diabetes, Hypertension, and Chronic Kidney Disease
   - Contains multiple abnormal lab values

2. **Cardiac Consultation** (`sample_report_2.txt`)
   - Cardiology consultation for a patient with chest pain
   - Contains detailed cardiac workup results
   - Diagnosis of Unstable Angina with recommendations for intervention
   - Includes cardiac-specific lab values and diagnostic studies

3. **Neurological Consultation** (`sample_report_3.txt`)
   - Neurology evaluation for a patient with headaches and TIAs
   - Contains detailed neurological examination and findings
   - Diagnosis of acute stroke with carotid stenosis
   - Includes neuroimaging results and comprehensive management plan

4. **Pediatric Visit** (`sample_report_4_pediatric.txt`)
   - Pediatric clinic visit for a 5-year-old with respiratory symptoms
   - Contains age-specific vital signs and growth parameters
   - Diagnosis of RSV bronchiolitis with asthma exacerbation
   - Includes pediatric medication dosing and family-centered care plan

5. **Obstetric Visit** (`sample_report_5_obstetric.txt`)
   - Third trimester prenatal visit for a 32-year-old woman
   - Contains pregnancy-specific measurements and assessments
   - Includes obstetric history and fetal monitoring information
   - Focuses on management of pregnancy-related conditions

## Report Structure

Each report follows a realistic medical documentation format with:
- Patient identifying information (fictional)
- Clinical history
- Physical examination findings
- Laboratory results with reference ranges
- Diagnostic study results
- Assessment with ICD-10 codes
- Detailed management plan
- Provider signature

## Testing Usage

### Manual Testing

Upload these reports through the web interface to:
1. Test the report upload functionality
2. Verify the AI analysis correctly extracts key medical information
3. Ensure insights and recommendations are appropriately generated
4. Validate abnormal parameter identification

### Automated Testing

Use the provided `test_report_upload.js` script to automatically test the report upload and analysis pipeline:

```bash
node test_report_upload.js
```

This will:
1. Authenticate with the backend
2. Upload each sample report
3. Initiate AI analysis
4. Check analysis status
5. Verify insights, recommendations, and abnormal parameters are correctly extracted

## Modifying Reports

These reports can be modified to test specific scenarios:
- Change lab values to test different abnormality detection thresholds
- Add or remove diagnoses to test insight generation algorithms
- Modify medications to test drug interaction alerts
- Change demographics to test age/gender-specific recommendations

## Testing Different Patient Demographics

The sample reports cover different patient populations:
- Adult male (General Medical Report)
- Elderly female (Cardiac Consultation)
- Middle-aged male (Neurological Consultation)
- Pediatric female (Pediatric Visit)
- Pregnant adult female (Obstetric Visit)

This diversity allows for testing age, gender, and condition-specific analysis capabilities.

## Security Note

While these reports contain realistic medical information, they use fictional patient data and do not represent real individuals. They are designed solely for testing purposes and do not contain protected health information (PHI). 
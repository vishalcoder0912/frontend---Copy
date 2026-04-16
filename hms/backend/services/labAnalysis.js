export const LAB_TEST_CATEGORIES = {
  HEMATOLOGY: "Hematology",
  BIOCHEMISTRY: "Biochemistry",
  MICROBIOLOGY: "Microbiology",
  HISTOPATHOLOGY: "Histopathology",
  RADIOLOGY: "Radiology",
  CARDIOLOGY: "Cardiology",
  ENDOCRINOLOGY: "Endocrinology",
  IMMUNOLOGY: "Immunology",
  URINALYSIS: "Urinalysis",
  COAGULATION: "Coagulation",
  GENETICS: "Genetics",
  PATHOLOGY: "Pathology",
};

export const TEST_NAME_PATTERNS = {
  "Complete Blood Count": { category: "HEMATOLOGY", params: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets", "MCV", "MCH", "MCHC"] },
  "CBC": { category: "HEMATOLOGY", params: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets", "MCV", "MCH", "MCHC"] },
  "Blood Test": { category: "HEMATOLOGY", params: ["WBC", "RBC", "Hemoglobin", "Platelets"] },
  "Lipid Profile": { category: "BIOCHEMISTRY", params: ["Total Cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"] },
  "Liver Function Test": { category: "BIOCHEMISTRY", params: ["ALT", "AST", "Bilirubin", "Albumin", "Protein", "ALP", "GGT"] },
  "LFT": { category: "BIOCHEMISTRY", params: ["ALT", "AST", "Bilirubin", "Albumin", "Protein", "ALP", "GGT"] },
  "Kidney Function Test": { category: "BIOCHEMISTRY", params: ["Creatinine", "BUN", "Uric Acid", "eGFR"] },
  "KFT": { category: "BIOCHEMISTRY", params: ["Creatinine", "BUN", "Uric Acid", "eGFR"] },
  "Thyroid Profile": { category: "ENDOCRINOLOGY", params: ["T3", "T4", "TSH"] },
  "HbA1c": { category: "ENDOCRINOLOGY", params: ["HbA1c", "Average Blood Glucose"] },
  "Blood Glucose": { category: "ENDOCRINOLOGY", params: ["Fasting Glucose", "Post Prandial", "Random Glucose"] },
  "Urinalysis": { category: "URINALYSIS", params: ["Color", "Appearance", "pH", "Protein", "Glucose", "Ketones", "Blood", "Leukocytes", "Nitrite"] },
  "Urine Test": { category: "URINALYSIS", params: ["Color", "pH", "Protein", "Glucose", "Blood"] },
  "HIV": { category: "IMMUNOLOGY", params: ["HIV 1/2 Antibodies", "p24 Antigen"] },
  "Hepatitis": { category: "IMMUNOLOGY", params: ["HBsAg", "Anti-HCV", "Anti-HAV", "Anti-HBc"] },
  "Dengue": { category: "MICROBIOLOGY", params: ["NS1 Antigen", "IgM", "IgG"] },
  "Malaria": { category: "MICROBIOLOGY", params: ["Plasmodium falciparum", "Plasmodium vivax", "Parasite Density"] },
  "Widal Test": { category: "MICROBIOLOGY", params: ["Salmonella Typhi O", "Salmonella Typhi H"] },
  "Blood Culture": { category: "MICROBIOLOGY", params: ["Bacterial Growth", "Organism", "Antibiotic Sensitivity"] },
  "PT/INR": { category: "COAGULATION", params: ["PT", "INR", "APTT"] },
  "Coagulation": { category: "COAGULATION", params: ["PT", "INR", "APTT", "Fibrinogen"] },
  "MRI": { category: "RADIOLOGY", params: ["Finding", "Impression", "Recommendation"] },
  "CT Scan": { category: "RADIOLOGY", params: ["Finding", "Impression", "Recommendation"] },
  "X-Ray": { category: "RADIOLOGY", params: ["Finding", "Impression"] },
  "Ultrasound": { category: "RADIOLOGY", params: ["Finding", "Impression"] },
  "ECG": { category: "CARDIOLOGY", params: ["Heart Rate", "Rhythm", "PR Interval", "QRS", "QT", "Interpretation"] },
  "Echocardiogram": { category: "CARDIOLOGY", params: ["Ejection Fraction", "LV Function", "Valves"] },
  "Pap Smear": { category: "HISTOPATHOLOGY", params: ["Cell Type", "Abnormal Cells", "Infection"] },
  "Biopsy": { category: "HISTOPATHOLOGY", params: ["Tissue Type", "Diagnosis", "Grade", "Stage"] },
  "Skin Allergy Panel": { category: "IMMUNOLOGY", params: ["Dust", "Pollen", "Food Allergens", "Result"] },
  "Allergy Test": { category: "IMMUNOLOGY", params: ["IgE Total", "Specific Allergens"] },
};

export const NORMAL_RANGES = {
  WBC: { min: 4.5, max: 11.0, unit: "K/μL", category: "HEMATOLOGY" },
  RBC: { min: 4.5, max: 5.9, unit: "M/μL", category: "HEMATOLOGY" },
  Hemoglobin: { min: 12.0, max: 17.5, unit: "g/dL", category: "HEMATOLOGY" },
  Hematocrit: { min: 36, max: 50, unit: "%", category: "HEMATOLOGY" },
  Platelets: { min: 150, max: 450, unit: "K/μL", category: "HEMATOLOGY" },
  MCV: { min: 80, max: 100, unit: "fL", category: "HEMATOLOGY" },
  MCH: { min: 27, max: 33, unit: "pg", category: "HEMATOLOGY" },
  MCHC: { min: 32, max: 36, unit: "g/dL", category: "HEMATOLOGY" },
  "Total Cholesterol": { min: 0, max: 200, unit: "mg/dL", category: "BIOCHEMISTRY" },
  HDL: { min: 40, max: 60, unit: "mg/dL", category: "BIOCHEMISTRY" },
  LDL: { min: 0, max: 100, unit: "mg/dL", category: "BIOCHEMISTRY" },
  Triglycerides: { min: 0, max: 150, unit: "mg/dL", category: "BIOCHEMISTRY" },
  ALT: { min: 7, max: 56, unit: "U/L", category: "BIOCHEMISTRY" },
  AST: { min: 10, max: 40, unit: "U/L", category: "BIOCHEMISTRY" },
  Creatinine: { min: 0.7, max: 1.3, unit: "mg/dL", category: "BIOCHEMISTRY" },
  BUN: { min: 7, max: 20, unit: "mg/dL", category: "BIOCHEMISTRY" },
  Uric_Acid: { min: 3.5, max: 7.2, unit: "mg/dL", category: "BIOCHEMISTRY" },
  T3: { min: 80, max: 200, unit: "ng/dL", category: "ENDOCRINOLOGY" },
  T4: { min: 4.5, max: 12, unit: "μg/dL", category: "ENDOCRINOLOGY" },
  TSH: { min: 0.4, max: 4.0, unit: "mIU/L", category: "ENDOCRINOLOGY" },
  HbA1c: { min: 4.0, max: 5.6, unit: "%", category: "ENDOCRINOLOGY" },
  "Fasting Glucose": { min: 70, max: 100, unit: "mg/dL", category: "ENDOCRINOLOGY" },
  "Post Prandial": { min: 70, max: 140, unit: "mg/dL", category: "ENDOCRINOLOGY" },
  pH: { min: 4.5, max: 8.0, unit: "", category: "URINALYSIS" },
};

export const PRIORITY_LEVELS = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  STAT: "Stat",
};

export const SPECIMEN_TYPES = {
  BLOOD: "Blood",
  URINE: "Urine",
  STOOL: "Stool",
  SPUTUM: "Sputum",
  TISSUE: "Tissue",
  CSF: "CSF",
  IMAGING: "Imaging",
};

export function detectTestCategory(testName) {
  const upperName = testName.toUpperCase();
  for (const [pattern, config] of Object.entries(TEST_NAME_PATTERNS)) {
    if (upperName.includes(pattern.toUpperCase())) {
      return {
        category: config.category,
        parameters: config.params,
      };
    }
  }
  return {
    category: "GENERAL",
    parameters: ["Result", "Finding", "Interpretation"],
  };
}

export function analyzeLabData(testName, rawText) {
  const { category, parameters } = detectTestCategory(testName);
  const results = [];
  const findings = [];

  const text = rawText.toLowerCase();

  parameters.forEach((param) => {
    const paramLower = param.toLowerCase();
    const patterns = [
      new RegExp(`${paramLower}[\\s:]*([\\d.]+)\\s*(${NORMAL_RANGES[param]?.unit || '[a-zA-Z/μ%]+'})?`, "i"),
      new RegExp(`${paramLower}[\\s:-]*\\s*([\\d.]+)`, "i"),
      new RegExp(`([\\d.]+)\\s*${paramLower}`, "i"),
    ];

    for (const pattern of patterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        const range = NORMAL_RANGES[param];
        
        let status = "normal";
        if (range) {
          if (value < range.min) status = "low";
          else if (value > range.max) status = "high";
        }

        results.push({
          parameter: param,
          value: value,
          unit: range?.unit || "",
          range: range ? `${range.min} - ${range.max}` : "",
          status: status,
          highlight: status !== "normal",
        });
        break;
      }
    }
  });

  if (text.includes("positive") || text.includes("detected") || text.includes("abnormal")) {
    findings.push({ type: "alert", message: "Abnormal findings detected" });
  }
  if (text.includes("negative") || text.includes("not detected") || text.includes("normal")) {
    findings.push({ type: "info", message: "No critical abnormalities found" });
  }
  if (text.includes("critical") || text.includes("urgent") || text.includes("immediately")) {
    findings.push({ type: "critical", message: "Critical value - immediate attention required" });
  }

  const criticalParams = results.filter(r => r.highlight);
  const summary = criticalParams.length > 0
    ? `${criticalParams.length} parameter(s) outside normal range`
    : "All parameters within normal range";

  return {
    category,
    parameters: results,
    findings,
    summary,
    testName,
    analyzedAt: new Date().toISOString(),
    criticalCount: criticalParams.length,
  };
}

export function parseLabReport(rawText, testName) {
  if (!rawText || rawText.length < 10) {
    return {
      success: false,
      error: "Insufficient data for analysis",
      rawData: rawText,
    };
  }

  const analysis = analyzeLabData(testName, rawText);
  
  return {
    success: true,
    rawData: rawText,
    analysis,
    recommendations: generateRecommendations(analysis),
  };
}

function generateRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.criticalCount > 0) {
    recommendations.push({
      priority: "high",
      text: "Consult physician regarding abnormal findings",
    });
  }

  analysis.parameters.forEach((param) => {
    if (param.status === "high" && param.parameter === "Hemoglobin") {
      recommendations.push({
        priority: "medium",
        text: "Consider iron studies and dietary consultation",
      });
    }
    if (param.status === "high" && (param.parameter === "LDL" || param.parameter === "Triglycerides")) {
      recommendations.push({
        priority: "medium",
        text: "Review lipid management with cardiologist",
      });
    }
    if (param.status === "high" && param.parameter === "HbA1c") {
      recommendations.push({
        priority: "high",
        text: "Diabetes management consultation recommended",
      });
    }
    if (param.status === "high" && (param.parameter === "ALT" || param.parameter === "AST")) {
      recommendations.push({
        priority: "medium",
        text: "Consider liver function follow-up",
      });
    }
    if (param.status === "high" && param.parameter === "Creatinine") {
      recommendations.push({
        priority: "high",
        text: "Evaluate kidney function - consider nephrology referral",
      });
    }
  });

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "low",
      text: "Continue regular health monitoring",
    });
  }

  return recommendations;
}

export function extractTextFromFile(fileContent, fileType) {
  if (fileType === "text/plain" || fileType === "text/csv") {
    return fileContent;
  }

  if (fileType === "application/json") {
    try {
      const parsed = JSON.parse(fileContent);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return fileContent;
    }
  }

  return fileContent;
}

export function categorizeFile(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  const categories = {
    pdf: "Report Document",
    png: "Image Scan",
    jpg: "Image Scan",
    jpeg: "Image Scan",
    gif: "Image Scan",
    doc: "Word Document",
    docx: "Word Document",
    txt: "Text Report",
    csv: "Data Export",
    json: "Structured Data",
  };
  return categories[ext] || "Unknown Format";
}

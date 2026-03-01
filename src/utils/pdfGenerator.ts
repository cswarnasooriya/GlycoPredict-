import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (
  patientData: any, 
  prediction: string, 
  aiAdvice: string, 
  userName: string = 'Patient'
) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // blue-500
  const textColor: [number, number, number] = [51, 65, 85]; // slate-700
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('GlycoPredict', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  const date = new Date().toLocaleDateString();
  const reportId = `GP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  doc.text(`Date: ${date}`, 14, 30);
  doc.text(`Report ID: ${reportId}`, 14, 35);
  
  // Patient Info
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Patient Information', 14, 48);
  
  doc.setFontSize(11);
  doc.text(`Name: ${userName}`, 14, 56);
  doc.text(`Age: ${patientData.age} years`, 14, 62);
  doc.text(`Gender: ${patientData.gender}`, 14, 68);
  
  // Clinical Data Table
  doc.setFontSize(14);
  doc.text('Clinical Data', 14, 82);
  
  const tableData = [
    ['Urea', patientData.urea, 'mmol/L'],
    ['Creatinine (Cr)', patientData.cr, 'µmol/L'],
    ['HbA1c', patientData.hba1c, '%'],
    ['Cholesterol (Chol)', patientData.chol, 'mmol/L'],
    ['Triglycerides (TG)', patientData.tg, 'mmol/L'],
    ['HDL Cholesterol', patientData.hdl, 'mmol/L'],
    ['LDL Cholesterol', patientData.ldl, 'mmol/L'],
    ['VLDL', patientData.vldl, 'mmol/L'],
    ['BMI', patientData.bmi, 'kg/m²'],
  ];

  autoTable(doc, {
    startY: 88,
    head: [['Test', 'Value', 'Unit']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 10, textColor: textColor },
  });

  // ML Prediction Results
  const finalY = (doc as any).lastAutoTable.finalY || 88;
  
  let currentY = finalY + 15;
  
  // Check if we need a new page
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Prediction Results', 14, currentY);
  
  doc.setFontSize(12);
  let riskColor: [number, number, number] = [16, 185, 129]; // emerald-500
  if (prediction.includes('High')) riskColor = [239, 68, 68]; // red-500
  else if (prediction.includes('Moderate') || prediction.includes('Pre')) riskColor = [245, 158, 11]; // amber-500
  
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(`Risk Status: ${prediction}`, 14, currentY + 8);
  
  // AI Insights
  currentY += 20;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Personalized Recommendations (AI)', 14, currentY);
  
  doc.setFontSize(10);
  const cleanAdvice = aiAdvice.replace(/[#*]/g, '');
  const splitAdvice = doc.splitTextToSize(cleanAdvice, 180);
  
  if (currentY + 8 + (splitAdvice.length * 5) > 280) {
    doc.addPage();
    currentY = 20;
    doc.text(splitAdvice, 14, currentY);
  } else {
    doc.text(splitAdvice, 14, currentY + 8);
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'This is an AI-generated report for informational purposes only. Please consult a qualified healthcare provider for official diagnosis.',
      14,
      pageHeight - 10
    );
  }
  
  doc.save(`GlycoPredict_Report_${userName.replace(/\s+/g, '_')}.pdf`);
};

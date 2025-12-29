import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
}

export async function exportElementToPDF(
  elementId: string, 
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'sample-report.pdf',
    orientation = 'portrait',
    format = 'a4',
    margin = 10
  } = options;

  try {
    // Get the element to export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Convert any oklch colors to hex before capturing
    const convertOklchToHex = (element: Element) => {
      const computedStyle = window.getComputedStyle(element);
      const style = (element as HTMLElement).style;
      
      // Check and convert background-color
      if (computedStyle.backgroundColor.includes('oklch')) {
        style.backgroundColor = convertColorToHex(computedStyle.backgroundColor);
      }
      
      // Check and convert color
      if (computedStyle.color.includes('oklch')) {
        style.color = convertColorToHex(computedStyle.color);
      }
      
      // Check and convert border-color
      if (computedStyle.borderColor.includes('oklch')) {
        style.borderColor = convertColorToHex(computedStyle.borderColor);
      }
      
      // Recursively process children
      Array.from(element.children).forEach(convertOklchToHex);
    };
    
    // Helper function to convert oklch/color values to safe hex
    const convertColorToHex = (colorValue: string): string => {
      // Common Tailwind oklch colors to hex mappings
      const colorMap: Record<string, string> = {
        'oklch(0.985 0.003 106.4)': '#f9fafb', // gray-50
        'oklch(0.962 0.006 106.47)': '#f3f4f6', // gray-100
        'oklch(0.923 0.014 106.04)': '#e5e7eb', // gray-200
        'oklch(0.863 0.024 105.68)': '#d1d5db', // gray-300
        'oklch(0.682 0.045 104.84)': '#6b7280', // gray-500
        'oklch(0.585 0.054 104.85)': '#4b5563', // gray-600
        'oklch(0.494 0.062 105.25)': '#374151', // gray-700
        'oklch(0.213 0.075 106.41)': '#111827', // gray-900
        'oklch(0.946 0.019 230.32)': '#dbeafe', // blue-100
        'oklch(0.663 0.167 230.95)': '#1d4ed8', // blue-700
        'oklch(0.609 0.178 231.04)': '#1e40af', // blue-800
        'oklch(0.954 0.023 152.72)': '#dcfce7', // green-100
        'oklch(0.542 0.137 152.05)': '#166534', // green-800
        'oklch(0.947 0.019 76.04)': '#fed7aa', // orange-100
        'oklch(0.502 0.147 70.67)': '#9a3412', // orange-800
        'oklch(0.956 0.021 17.56)': '#fee2e2', // red-100
        'oklch(0.507 0.166 22.18)': '#991b1b', // red-800
        'oklch(0.956 0.019 305.88)': '#f3e8ff', // purple-100
        'oklch(0.463 0.154 302.52)': '#6b21a8', // purple-800
      };
      
      // Return mapped color or fallback to a safe default
      return colorMap[colorValue] || '#ffffff';
    };
    
    // Add comprehensive print styles
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      /* Force all elements in the export area to use hex colors */
      #${elementId} * {
        background: unset !important;
        color: unset !important;
        border-color: unset !important;
      }
      
      /* Ensure good PDF rendering */
      #${elementId} {
        background: #ffffff !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        color: #000000 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      
      /* Tailwind class overrides with hex colors */
      #${elementId} .bg-white { background-color: #ffffff !important; }
      #${elementId} .bg-gray-50 { background-color: #f9fafb !important; }
      #${elementId} .bg-gray-100 { background-color: #f3f4f6 !important; }
      #${elementId} .bg-blue-50 { background-color: #eff6ff !important; }
      #${elementId} .bg-blue-100 { background-color: #dbeafe !important; }
      #${elementId} .bg-green-50 { background-color: #f0fdf4 !important; }
      #${elementId} .bg-green-100 { background-color: #dcfce7 !important; }
      #${elementId} .bg-orange-50 { background-color: #fff7ed !important; }
      #${elementId} .bg-orange-100 { background-color: #ffedd5 !important; }
      #${elementId} .bg-red-50 { background-color: #fef2f2 !important; }
      #${elementId} .bg-red-100 { background-color: #fee2e2 !important; }
      #${elementId} .bg-purple-50 { background-color: #faf5ff !important; }
      #${elementId} .bg-purple-100 { background-color: #f3e8ff !important; }
      #${elementId} .bg-yellow-50 { background-color: #fefce8 !important; }
      #${elementId} .bg-yellow-100 { background-color: #fef3c7 !important; }
      
      #${elementId} .text-black { color: #000000 !important; }
      #${elementId} .text-white { color: #ffffff !important; }
      #${elementId} .text-gray-500 { color: #6b7280 !important; }
      #${elementId} .text-gray-600 { color: #4b5563 !important; }
      #${elementId} .text-gray-700 { color: #374151 !important; }
      #${elementId} .text-gray-900 { color: #111827 !important; }
      #${elementId} .text-blue-500 { color: #3b82f6 !important; }
      #${elementId} .text-blue-700 { color: #1d4ed8 !important; }
      #${elementId} .text-blue-800 { color: #1e40af !important; }
      #${elementId} .text-green-500 { color: #22c55e !important; }
      #${elementId} .text-green-800 { color: #166534 !important; }
      #${elementId} .text-orange-500 { color: #f97316 !important; }
      #${elementId} .text-orange-800 { color: #9a3412 !important; }
      #${elementId} .text-red-500 { color: #ef4444 !important; }
      #${elementId} .text-red-800 { color: #991b1b !important; }
      #${elementId} .text-purple-500 { color: #a855f7 !important; }
      #${elementId} .text-purple-800 { color: #6b21a8 !important; }
      
      #${elementId} .border-gray-200 { border-color: #e5e7eb !important; }
      #${elementId} .border-gray-300 { border-color: #d1d5db !important; }
      #${elementId} .border-blue-200 { border-color: #bfdbfe !important; }
      #${elementId} .border-green-200 { border-color: #bbf7d0 !important; }
      #${elementId} .border-orange-200 { border-color: #fed7aa !important; }
      #${elementId} .border-red-200 { border-color: #fecaca !important; }
      #${elementId} .border-red-300 { border-color: #fca5a5 !important; }
      
      /* Show PDF-only content during export */
      #${elementId} .print\\:block { display: block !important; }
      #${elementId} .hidden { display: none !important; }
      #${elementId} .print\\:border-b-0 { border-bottom: 0 !important; }
      #${elementId} .print\\:pt-4 { padding-top: 1rem !important; }
    `;
    document.head.appendChild(printStyle);

    // Convert any remaining oklch colors
    convertOklchToHex(element);

    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 200));

    // Final fallback: clone element and strip all computed styles that use oklch
    const clonedElement = element.cloneNode(true) as HTMLElement;
    const stripOklchColors = (el: Element) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
      
      // Force safe fallback colors for any oklch values
      if (computedStyle.backgroundColor?.includes('oklch')) {
        htmlEl.style.backgroundColor = '#ffffff';
      }
      if (computedStyle.color?.includes('oklch')) {
        htmlEl.style.color = '#000000';
      }
      if (computedStyle.borderColor?.includes('oklch')) {
        htmlEl.style.borderColor = '#e5e7eb';
      }
      
      Array.from(el.children).forEach(stripOklchColors);
    };
    
    stripOklchColors(clonedElement);
    
    // Temporarily replace the element for canvas capture
    element.style.display = 'none';
    element.parentNode?.insertBefore(clonedElement, element);

    // Capture the cloned element as canvas
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true, // Allow cross-origin content
      backgroundColor: '#ffffff',
      width: clonedElement.scrollWidth,
      height: clonedElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable console warnings
      ignoreElements: (el) => {
        // Ignore elements that might cause color parsing issues
        return el.classList?.contains('feedback-component') || 
               el.classList?.contains('print-hidden');
      }
    });

    // Clean up: remove cloned element and restore original
    clonedElement.remove();
    element.style.display = '';
    
    // Remove temporary styles
    document.head.removeChild(printStyle);

    // Calculate PDF dimensions
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Get page dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions with margins
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add content to PDF
    let heightLeft = imgHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - margin * 2);

    // Add additional pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - margin * 2);
    }

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

export function generateSampleReportFilename(sampleLabel: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedLabel = sampleLabel.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `Patomove_Sample_Report_${sanitizedLabel}_${date}.pdf`;
}

export function showExportSuccess(filename: string): void {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  toast.textContent = `PDF exported: ${filename}`;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

export function showExportError(message: string): void {
  // Create error toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  toast.textContent = `Export failed: ${message}`;
  
  document.body.appendChild(toast);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 5000);
}
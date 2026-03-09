
'use client';

import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

/**
 * PDF.js Worker initialization. 
 * Using a CDN version that matches the package version for reliability in the browser.
 */
const PDFJS_VERSION = '4.0.379';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

/**
 * Extracts text from a File object supporting .txt, .pdf, and .docx formats.
 */
export async function parseDocument(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
      return parseTxt(file);
    case 'pdf':
      return parsePdf(file);
    case 'docx':
      return parseDocx(file);
    default:
      throw new Error(`Unsupported file format: .${extension}`);
  }
}

async function parseTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read text file.'));
    reader.readAsText(file);
  });
}

async function parsePdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Use Uint8Array which is the standard input for getDocument
    const typedArray = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjs.getDocument({ 
      data: typedArray,
      useWorkerFetch: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('PDF appears to be empty or contains only images (OCR not supported).');
    }

    return fullText.trim();
  } catch (error: any) {
    console.error('PDF parsing error details:', error);
    throw new Error(error.message || 'Could not parse PDF file.');
  }
}

async function parseDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error: any) {
    console.error('DOCX parsing error:', error);
    throw new Error('Could not parse DOCX file.');
  }
}

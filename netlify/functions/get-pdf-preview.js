// In netlify/functions/get-pdf-preview.js

const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

exports.handler = async function (event, context) {
    const courseId = event.queryStringParameters.id;

    if (!courseId) {
        return { statusCode: 400, body: 'Error: Missing course ID' };
    }

    try {
        // --- 1. Find the path to the original PDF ---
        const dataPath = path.resolve(__dirname, '../../public/data.json');
        const dataFile = await fs.readFile(dataPath, 'utf8');
        const courses = JSON.parse(dataFile);
        
        const course = courses.find(c => c.id === courseId);
        if (!course || !course.documents || course.documents.length === 0) {
            return { statusCode: 404, body: 'Error: Course or its documents not found' };
        }
        
        // We'll just create a preview for the FIRST document listed for that course.
        const originalDocPath = course.documents[0].path;
        const pdfPath = path.resolve(__dirname, '../../public/', originalDocPath);

        // --- 2. Read the original PDF and create a new one ---
        const originalPdfBytes = await fs.readFile(pdfPath);
        
        // Load the original PDF into pdf-lib
        const originalPdf = await PDFDocument.load(originalPdfBytes);
        
        // Create a brand new, empty PDF document
        const previewPdf = await PDFDocument.create();

        // --- 3. Copy just the first page ---
        // Get the first page from the original document (pages are zero-indexed, so page 1 is at index 0)
        const [firstPage] = await previewPdf.copyPages(originalPdf, [0]);
        
        // Add that copied page to our new document
        previewPdf.addPage(firstPage);

        // --- 4. Save the new, single-page PDF to a buffer ---
        const previewPdfBytes = await previewPdf.save();

        // --- 5. Return the new PDF to the browser ---
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Length': previewPdfBytes.length,
            },
            body: Buffer.from(previewPdfBytes).toString('base64'), // Return as Base64 for Netlify
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: `An error occurred: ${error.message}` };
    }
};
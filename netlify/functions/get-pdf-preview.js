// In netlify/functions/get-pdf-preview.js

const fs = require('fs').promises;
const path = require('path');
// Import more tools from pdf-lib for drawing text
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// A helper function to add our professional message to a page
async function addPrivacyWatermark(page, pdfDoc) {
    const watermarkText = 'Content blurred to protect university IP. Original materials are used solely for personal study and demonstration purposes.';
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 24;
    
    // Get the dimensions of the page
    const { width, height } = page.getSize();
    // Get the width of our message
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

    // Draw the text
    page.drawText(watermarkText, {
        x: width / 2 - textWidth / 2, // Center horizontally
        y: 40, // Place it near the bottom of the page
        font,
        size: fontSize,
        color: rgb(0.5, 0.5, 0.5), // A 50% grey color
        opacity: 0.5, // Make it semi-transparent
    });
}


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

        const originalDocPath = course.documents[0].path;
        const pdfPath = path.resolve(__dirname, '../../public/', originalDocPath);

        // --- 2. Read the original PDF ---
        const originalPdfBytes = await fs.readFile(pdfPath);
        const originalPdf = await PDFDocument.load(originalPdfBytes);
        
        // --- 3. Copy ALL pages and add the watermark to each one ---
        const pageIndices = originalPdf.getPageIndices();
        for (const pageIndex of pageIndices) {
            const page = originalPdf.getPage(pageIndex);
            await addPrivacyWatermark(page, originalPdf);
        }

        // --- 4. Save the modified PDF ---
        const protectedPdfBytes = await originalPdf.save();

        // --- 5. Return the protected PDF to the browser ---
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/pdf' },
            body: Buffer.from(protectedPdfBytes).toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Function Error:', error);
        return { statusCode: 500, body: `An error occurred: ${error.message}` };
    }
};
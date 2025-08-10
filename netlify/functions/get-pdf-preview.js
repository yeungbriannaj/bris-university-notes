const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function addPrivacyWatermark(page, pdfDoc) {
    const watermarkText = 'Content protected by university IP.'; // Your watermark text
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Large enough font to cover most of the page
    const fontSize = Math.min(width, height) / 5; 
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = fontSize;

    page.drawText(watermarkText, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        font,
        size: fontSize,
        color: rgb(0.75, 0.75, 0.75),
        opacity: 0.25, // Slightly transparent
        rotate: { degrees: 45 } // Optional diagonal watermark
    });
}

exports.handler = async function (event, context) {
    const courseId = event.queryStringParameters.id;

    if (!courseId) {
        return { statusCode: 400, body: 'Error: Missing course ID' };
    }

    try {
        const dataPath = path.resolve(__dirname, '../../public/data.json');
        const dataFile = await fs.readFile(dataPath, 'utf8');
        const courses = JSON.parse(dataFile);

        const course = courses.find(c => c.id === courseId);
        if (!course || !course.documents || course.documents.length === 0) {
            return { statusCode: 404, body: 'Error: Course or its documents not found' };
        }

        const originalDocPath = course.documents[0].path;
        const pdfPath = path.resolve(__dirname, '../../public/', originalDocPath);

        const originalPdfBytes = await fs.readFile(pdfPath);
        const originalPdf = await PDFDocument.load(originalPdfBytes);
        
        // Add watermark to all pages
        for (const page of originalPdf.getPages()) {
            await addPrivacyWatermark(page, originalPdf);
        }

        const protectedPdfBytes = await originalPdf.save();

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

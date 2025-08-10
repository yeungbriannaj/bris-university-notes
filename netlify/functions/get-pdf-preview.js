
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

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
        const pdfPath = path.resolve(__dirname, '../../public/', doc.path);
        const originalPdfBytes = await fs.readFile(pdfPath);
        const originalPdf = await PDFDocument.load(originalPdfBytes);
        const previewPdf = await PDFDocument.create();
        const [firstPage] = await previewPdf.copyPages(originalPdf, [0]);
        previewPdf.addPage(firstPage);
        const previewPdfBytes = await previewPdf.save();

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
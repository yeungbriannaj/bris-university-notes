const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Draws a semi-transparent white rectangle over the entire page to obscure content.
 * @param {PDFPage} page The page to draw on.
 */
function addBlurLayer(page) {
    const { width, height } = page.getSize();
    page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: rgb(1, 1, 1), 
        opacity: 0.95, 
    });
}

/**
 * Adds a centered, multi-line copyright notice to the page.
 * @param {PDFPage} page The page to draw on.
 * @param {PDFDocument} pdfDoc The PDF document instance to embed the font.
 */
async function addCopyrightNotice(page, pdfDoc) {
    const noticeLine1 = 'Content hidden to protect UoA IP.';
    const noticeLine2 = 'Original materials are used solely for personal study and demonstration purposes.';
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 14;
    const textColor = rgb(247 / 255, 140 / 255, 180 / 255);
    const { width, height } = page.getSize();
    const textWidth1 = font.widthOfTextAtSize(noticeLine1, fontSize);
    const textWidth2 = font.widthOfTextAtSize(noticeLine2, fontSize);

    page.drawText(noticeLine1, {
        x: width / 2 - textWidth1 / 2,
        y: height / 2 + 10,
        font,
        size: fontSize,
        color: textColor,
    });

    page.drawText(noticeLine2, {
        x: width / 2 - textWidth2 / 2,
        y: height / 2 - 10,
        font,
        size: fontSize,
        color: textColor,
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
        const pdfDoc = await PDFDocument.load(originalPdfBytes);
        const pageIndices = pdfDoc.getPageIndices();
        for (const pageIndex of pageIndices) {
            const page = pdfDoc.getPage(pageIndex);
            
            addBlurLayer(page);
            await addCopyrightNotice(page, pdfDoc);
        }
        const protectedPdfBytes = await pdfDoc.save();

        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="protected-document.pdf"'
            },
            body: Buffer.from(protectedPdfBytes).toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Function Error:', error);
        if (error.code === 'ENOENT') {
             return { statusCode: 500, body: 'An error occurred: Could not find a required file.' };
        }
        return { statusCode: 500, body: `An error occurred: ${error.message}` };
    }
};
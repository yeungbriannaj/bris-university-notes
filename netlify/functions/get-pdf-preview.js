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
        color: rgb(1, 1, 1),      // White color
        opacity: 0.95,            // 95% opacity. Makes text underneath unreadable. Adjust between 0.9 and 1.0.
    });
}

/**
 * Adds a centered, multi-line copyright notice to the page.
 * @param {PDFPage} page The page to draw on.
 * @param {PDFDocument} pdfDoc The PDF document instance to embed the font.
 */
async function addCopyrightNotice(page, pdfDoc) {
    const noticeLine1 = 'Content blurred to protect intellectual property.';
    const noticeLine2 = 'Original materials are used solely for personal study and demonstration purposes.';
    
    // Using a standard, legible font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 16;
    const textColor = rgb(0.2, 0.2, 0.2); // Dark gray for better readability

    const { width, height } = page.getSize();
    
    // Calculate the width of each line to center them independently
    const textWidth1 = font.widthOfTextAtSize(noticeLine1, fontSize);
    const textWidth2 = font.widthOfTextAtSize(noticeLine2, fontSize);

    // Draw the first line slightly above the center
    page.drawText(noticeLine1, {
        x: width / 2 - textWidth1 / 2,
        y: height / 2 + 10, // Positioned 10 units above the vertical center
        font,
        size: fontSize,
        color: textColor,
    });

    // Draw the second line slightly below the center
    page.drawText(noticeLine2, {
        x: width / 2 - textWidth2 / 2,
        y: height / 2 - 10, // Positioned 10 units below the vertical center
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
        // --- 1. Find the path to the PDF ---
        const dataPath = path.resolve(__dirname, '../../public/data.json');
        const dataFile = await fs.readFile(dataPath, 'utf8');
        const courses = JSON.parse(dataFile);

        const course = courses.find(c => c.id === courseId);
        if (!course || !course.documents || course.documents.length === 0) {
            return { statusCode: 404, body: 'Error: Course or its documents not found' };
        }

        const originalDocPath = course.documents[0].path;
        const pdfPath = path.resolve(__dirname, '../../public/', originalDocPath);

        // --- 2. Load the original PDF ---
        const originalPdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(originalPdfBytes);
        
        // --- 3. Modify each page ---
        const pageIndices = pdfDoc.getPageIndices();
        for (const pageIndex of pageIndices) {
            const page = pdfDoc.getPage(pageIndex);
            
            // IMPORTANT: Apply blur layer first, then the text on top
            addBlurLayer(page);
            await addCopyrightNotice(page, pdfDoc);
        }

        // --- 4. Save the modified PDF to a buffer ---
        const protectedPdfBytes = await pdfDoc.save();

        // --- 5. Return the protected PDF to the browser ---
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="protected-document.pdf"' // Suggests a filename to the browser
            },
            body: Buffer.from(protectedPdfBytes).toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Function Error:', error);
        // Be careful about leaking path information in error messages
        if (error.code === 'ENOENT') {
             return { statusCode: 500, body: 'An error occurred: Could not find a required file.' };
        }
        return { statusCode: 500, body: `An error occurred: ${error.message}` };
    }
};
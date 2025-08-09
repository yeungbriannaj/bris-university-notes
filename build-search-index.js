const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

async function buildIndex() {
    console.log('Starting to build search index...');

    try {
        // Read main data file to know which PDFs to process
        const dataFilePath = path.join(__dirname, 'data.json');
        const dataFileContent = await fs.readFile(dataFilePath, 'utf8');
        const courses = JSON.parse(dataFileContent);
        const searchIndex = {};

        // Loop through each course and each document
        for (const course of courses) {
            let fullCourseText = '';
            for (const doc of course.documents) {
                const pdfPath = path.join(__dirname, doc.path);
                const dataBuffer = await fs.readFile(pdfPath);
                const pdfData = await pdf(dataBuffer);
                // Add the text from this PDF to our full course text
                fullCourseText += pdfData.text + '\n\n';
            }
            searchIndex[course.id] = fullCourseText.toLowerCase();
            console.log(`Indexed text for course ${course.id}`);
        }
        // Write final index to a new file
        const indexFilePath = path.join(__dirname, 'search-index.json');
        await fs.writeFile(indexFilePath, JSON.stringify(searchIndex, null, 2));
        console.log('✅ Search index built successfully!');
        console.log(`Index file created at: ${indexFilePath}`);
    } catch (error) {
        console.error('Error building search index:', error);
    }
}
buildIndex();
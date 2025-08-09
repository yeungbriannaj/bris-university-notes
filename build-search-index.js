// build-search-index.js

// Import the libraries we need
const fs = require('fs').promises; // For reading and writing files
const path = require('path'); // For handling file paths
const pdf = require('pdf-parse'); // Our PDF reading library

async function buildIndex() {
    console.log('Starting to build search index...');

    try {
        // 1. Read our main data file to know which PDFs to process
        const dataFilePath = path.join(__dirname, 'data.json');
        const dataFileContent = await fs.readFile(dataFilePath, 'utf8');
        const courses = JSON.parse(dataFileContent);

        const searchIndex = {}; // We'll store our text content here

        // 2. Loop through each course and each document
        for (const course of courses) {
            let fullCourseText = '';
            for (const doc of course.documents) {
                // Construct the full path to the PDF file
                const pdfPath = path.join(__dirname, doc.path);
                
                // Read the PDF file's buffer
                const dataBuffer = await fs.readFile(pdfPath);
                
                // Use pdf-parse to extract text
                const pdfData = await pdf(dataBuffer);
                
                // Add the text from this PDF to our full course text
                // We add newlines to separate content from different docs
                fullCourseText += pdfData.text + '\n\n';
            }
            // Store all the extracted text for this course ID
            searchIndex[course.id] = fullCourseText.toLowerCase();
            console.log(`Indexed text for course ${course.id}`);
        }

        // 3. Write the final index to a new file
        const indexFilePath = path.join(__dirname, 'search-index.json');
        await fs.writeFile(indexFilePath, JSON.stringify(searchIndex, null, 2));
        
        console.log('✅ Search index built successfully!');
        console.log(`Index file created at: ${indexFilePath}`);

    } catch (error) {
        console.error('Error building search index:', error);
    }
}

// Run the function
buildIndex();
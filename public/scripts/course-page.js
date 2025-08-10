// in public/scripts/course-page.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Apply the correct theme on page load ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // --- 2. Get the course ID and find the elements ---
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const courseId = urlParams.get('id');

    const courseTitleEl = document.getElementById('course-title');
    const pdfViewerEl = document.getElementById('pdf-viewer');
    const documentLinksEl = document.getElementById('document-links'); // We'll use this for a message

    // --- 3. Set the iframe source to our new serverless function! ---
    if (courseId) {
        pdfViewerEl.src = `/.netlify/functions/get-pdf-preview?id=${courseId}`;
    }

    // --- 4. Fetch data just to display the title ---
    fetch('/data.json')
        .then(response => response.json())
        .then(courses => {
            const course = courses.find(c => c.id === courseId);
            if (course) {
                document.title = course.title;
                courseTitleEl.textContent = course.title;
                if (!course.documents || course.documents.length === 0) {
                    documentLinksEl.innerHTML = '<p>No document preview available for this course.</p>';
                    pdfViewerEl.style.display = 'none';
                }
            } else {
                courseTitleEl.textContent = 'Error: Course Not Found';
            }
        });
});
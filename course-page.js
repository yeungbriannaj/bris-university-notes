document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Get the Course ID from the URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const courseId = urlParams.get('id');

    // Find the elements on the page we need to update
    const courseTitleEl = document.getElementById('course-title');
    const documentLinksEl = document.getElementById('document-links');
    const pdfViewerEl = document.getElementById('pdf-viewer');

    // Fetch ALL the course data from our main data file
    fetch('/data.json')
        .then(response => response.json())
        .then(courses => {
            const course = courses.find(c => c.id === courseId);
            if (!course) {
                courseTitleEl.textContent = 'Error: Course Not Found';
                return;
            }
            document.title = course.title;
            courseTitleEl.textContent = course.title;

            // Generate the buttons for each document
            if (course.documents.length > 0) {
                course.documents.forEach(doc => {
                    const button = document.createElement('button');
                    button.textContent = `View ${doc.type}`;
                    button.className = 'document-button';
                    button.addEventListener('click', () => {
                        pdfViewerEl.src = `/${doc.path}`;
                    });
                    documentLinksEl.appendChild(button);
                });
                // Load the first document by default
                pdfViewerEl.src = `/${course.documents[0].path}`;
            } else {
                documentLinksEl.innerHTML = '<p>No documents available for this course.</p>';
                pdfViewerEl.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching course data:', error);
            courseTitleEl.textContent = 'Error Loading Course Data';
        });
});
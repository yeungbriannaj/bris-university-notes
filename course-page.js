document.addEventListener('DOMContentLoaded', () => {

    // GET COURSE ID FROM THE URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const courseId = urlParams.get('id');
    const courseTitleEl = document.getElementById('course-title');
    const courseDescriptionEl = document.getElementById('course-description');
    const documentLinksEl = document.getElementById('document-links');
    const pdfViewerEl = document.getElementById('pdf-viewer');

    // FETCH ALL COURSE DATA
    fetch('../data.json')
        .then(response => response.json())
        .then(courses => {
            
            // FIND THE SPECIFIC COURSE WE NEED
            const course = courses.find(c => c.id === courseId);
            if (!course) {
                courseTitleEl.textContent = 'Error: Course Not Found';
                return;
            }

            // POPULATE THE PAGE WITH THE COURSE DATA
            document.title = course.title;
            courseTitleEl.textContent = course.title;
            courseDescriptionEl.textContent = course.description;

            course.documents.forEach(doc => {
                const button = document.createElement('button');
                button.textContent = `View ${doc.type}`;
                button.className = 'document-button';
                button.addEventListener('click', () => {
                    pdfViewerEl.src = `../${doc.path}`;
                });
                documentLinksEl.appendChild(button);
            });

            // Automatically load the first document into the viewer by default
            if (course.documents.length > 0) {
                pdfViewerEl.src = `../${course.documents[0].path}`;
            } else {
                documentLinksEl.innerHTML = '<p>No documents available for this course.</p>';
                pdfViewerEl.style.display = 'none'; // Hide the iframe
            }
        })
        .catch(error => {
            console.error('Error fetching course data:', error);
            courseTitleEl.textContent = 'Error Loading Course Data';
        });
});
document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');

    // Fetch the course data from data.JSON
    fetch('data.json')
        .then(response => {
            return response.json();
        })
        .then(courses => {
            
            // Loop through each course in array
            courses.forEach(course => {
                // For each course, create the HTML string for its card.
                const cardHTML = `
                    <div class="course-card" data-category="${course.category}">
                        <a href="courses/course.html?id=${course.id}">
                            <img src="${course.image}" alt="Image for ${course.title}">
                        </a>
                        <a href="courses/course.html?id=${course.id}">
                            <h2>${course.title}</h2>
                            <p>${course.year} - ${course.semester_num === 0 ? 'Summer School' : 'SEMESTER ' + course.semester_num}</p>
                        </a>
                    </div>
                `;
                
                // Insert newly created HTML for this card into the container
                cardContainer.innerHTML += cardHTML;
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing course data:', error);
            cardContainer.innerHTML = '<p>Sorry, we could not load the course data at this time.</p>';
        });
});
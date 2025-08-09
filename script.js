document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET ALL THE DOM ELEMENTS ---
    const cardContainer = document.getElementById('card-container');
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subject-filter');
    const yearFilter = document.getElementById('year-filter');
    const levelFilter = document.getElementById('level-filter');
    const sortBy = document.getElementById('sort-by');
    let allCourses = []; // This will store our master list of courses

    // --- 2. THE MASTER FUNCTION TO APPLY FILTERS AND SORT ---
    function applyFiltersAndSort() {
        // Get the current values from all the controls
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSubject = subjectFilter.value;
        const selectedYear = yearFilter.value;
        const selectedLevel = levelFilter.value;
        const sortValue = sortBy.value;

        // Start with the full list of courses
        let filteredCourses = allCourses;

        // --- FILTERING LOGIC ---
        // Filter by Search Term (Title or Description)
        if (searchTerm) {
            filteredCourses = filteredCourses.filter(course =>
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm)
            );
        }
        // Filter by Subject
        if (selectedSubject !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.category === selectedSubject);
        }
        // Filter by Year
        if (selectedYear !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.year.toString() === selectedYear);
        }
        // Filter by Level (e.g., 100, 200, 300)
        if (selectedLevel !== 'all') {
            filteredCourses = filteredCourses.filter(course => 
                Math.floor(parseInt(course.id) / 100) * 100 === parseInt(selectedLevel)
            );
        }

        // --- SORTING LOGIC ---
        // The .sort() method modifies the array in place
        filteredCourses.sort((a, b) => {
            if (sortValue === 'id_asc') {
                return parseInt(a.id) - parseInt(b.id);
            } else if (sortValue === 'id_desc') {
                return parseInt(b.id) - parseInt(a.id);
            } else if (sortValue === 'year_desc') {
                // For year, also sort by semester as a secondary factor
                if (b.year !== a.year) {
                    return b.year - a.year;
                }
                return b.semester_num - a.semester_num;
            } else if (sortValue === 'year_asc') {
                if (a.year !== b.year) {
                    return a.year - b.year;
                }
                return a.semester_num - b.semester_num;
            }
        });

        // Finally, render the filtered and sorted cards
        renderCards(filteredCourses);
    }

    // --- 3. RENDER CARDS FUNCTION ---
    function renderCards(coursesToRender) {
        cardContainer.innerHTML = ''; // Clear existing cards
        coursesToRender.forEach(course => {
            const cardHTML = `
                <div class="course-card" data-category="${course.category}">
                    <a href="courses/course.html?id=${course.id}">
                        <img src="${course.image}" alt="Image for ${course.title}">
                    </a>
                    <a href="courses/course.html?id=${course.id}">
                        <h2>${course.title}</h2>
                        <p><strong>${course.year} ${course.semester_num === 0 ? 'Summer School' : 'SEMESTER ' + course.semester_num}</strong></p>
                        <p class="card-description">${course.description}</p>
                        
                    </a>
                </div>
            `;
            cardContainer.innerHTML += cardHTML;
        });
    }

    // --- 4. FETCH DATA AND INITIALIZE ---
    fetch('data.json')
        .then(response => response.json())
        .then(courses => {
            allCourses = courses; // Store the master list
            applyFiltersAndSort(); // Perform an initial render
        })
        .catch(error => console.error('Error fetching course data:', error));

    // --- 5. ADD EVENT LISTENERS ---
    // Add listeners to all controls to re-run the filter function on any change
    searchInput.addEventListener('keyup', applyFiltersAndSort);
    subjectFilter.addEventListener('change', applyFiltersAndSort);
    yearFilter.addEventListener('change', applyFiltersAndSort);
    levelFilter.addEventListener('change', applyFiltersAndSort);
    sortBy.addEventListener('change', applyFiltersAndSort);
});
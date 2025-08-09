document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    }

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        
    }
    applyTheme(savedTheme);

    const cardContainer = document.getElementById('card-container');
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subject-filter');
    const yearFilter = document.getElementById('year-filter');
    const levelFilter = document.getElementById('level-filter');
    const sortBy = document.getElementById('sort-by');
    let allCourses = []; //Store master list of courses

    // THE MASTER FUNCTION TO APPLY FILTERS AND SORT ---
    function applyFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSubject = subjectFilter.value;
        const selectedYear = yearFilter.value;
        const selectedLevel = levelFilter.value;
        const sortValue = sortBy.value;

        let filteredCourses = allCourses;

        if (searchTerm) {
            filteredCourses = filteredCourses.filter(course => {
                const courseText = searchIndex[course.id] || '';
                const titleMatch = course.title.toLowerCase().includes(searchTerm);
                const descriptionMatch = course.description.toLowerCase().includes(searchTerm);
                const contentMatch = courseText.includes(searchTerm);
                return titleMatch || descriptionMatch || contentMatch;
            });
        }


        // Filter by Subject
        if (selectedSubject !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.category === selectedSubject);
        }
        // Filter by Year
        if (selectedYear !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.year.toString() === selectedYear);
        }
        // Filter by Level
        if (selectedLevel !== 'all') {
            filteredCourses = filteredCourses.filter(course => 
                Math.floor(parseInt(course.id) / 100) * 100 === parseInt(selectedLevel)
            );
        }

        // .sort() modifies the array in place
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
        renderCards(filteredCourses);
    }

    function renderCards(coursesToRender) {
        cardContainer.innerHTML = '';
        coursesToRender.forEach(course => {
            const cardHTML = `
                <div class="course-card" data-category="${course.category}">
                    <a href="/courses/course.html?id=${course.id}">
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

    Promise.all([
        fetch('/data.json').then(res => res.json()),
        fetch('/search-index.json').then(res => res.json())
    ])
    .then(([courses, index]) => {
        allCourses = courses;
        searchIndex = index;
        console.log("Search Index Loaded:", searchIndex); 
        applyFiltersAndSort(); // Perform an initial render
    })
    .catch(error => console.error('Error fetching data:', error));

    fetch('data.json')
        .then(response => response.json())
        .then(courses => {
            allCourses = courses; // Store the master list
            applyFiltersAndSort(); // Perform an initial render
        })
        .catch(error => console.error('Error fetching course data:', error));

    searchInput.addEventListener('keyup', applyFiltersAndSort);
    subjectFilter.addEventListener('change', applyFiltersAndSort);
    yearFilter.addEventListener('change', applyFiltersAndSort);
    levelFilter.addEventListener('change', applyFiltersAndSort);
    sortBy.addEventListener('change', applyFiltersAndSort);
});
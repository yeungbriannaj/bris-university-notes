document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const allCards = document.querySelectorAll('.course-card');
    const noResultsMessage = document.getElementById('noResultsMessage');

    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleCardsCount = 0;

        allCards.forEach(card => {
            const courseTitle = card.querySelector('h2').textContent.toLowerCase();
            const shouldBeVisible = courseTitle.includes(searchTerm);

            if (shouldBeVisible) {
                // This card should be visible.
                // If it was previously hidden, let's show it.
                if (card.classList.contains('is-hidden')) {
                    // First, immediately put it back in the layout.
                    // It's still invisible because of the 'is-hidden' class.
                    card.style.display = 'block';

                    // Then, wait a tiny moment (10ms) for the browser to register
                    // the display change, and then remove the class to trigger the fade-in animation.
                    setTimeout(() => {
                        card.classList.remove('is-hidden');
                    }, 10);
                }
                visibleCardsCount++;

            } else {
                // This card should be hidden.
                // If it's currently visible, let's hide it.
                if (!card.classList.contains('is-hidden')) {
                    // First, add the class to trigger the fade-out animation.
                    card.classList.add('is-hidden');

                    // After the animation finishes (300ms), then set display to none
                    // to completely remove it from the layout, allowing other cards to move in.
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // IMPORTANT: This MUST match your CSS transition duration!
                }
            }
        });

        // Show or hide the "No Results" message
        if (visibleCardsCount === 0) {
            noResultsMessage.classList.remove('is-hidden');
        } else {
            noResultsMessage.classList.add('is-hidden');
        }
    });
});
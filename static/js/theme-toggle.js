document.addEventListener('DOMContentLoaded', () => {
    const themeIconContainer = document.getElementById('theme-icon-container');

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
    }

    // Toggle theme on 't' key press
    document.addEventListener('keydown', function(event) {
        if (event.key === 't') {
            event.preventDefault();
            toggleTheme();
        }
    });

    // Toggle theme on icon click
    if (themeIconContainer) {
        themeIconContainer.addEventListener('click', function() {
            toggleTheme();
        });
    }
}); 
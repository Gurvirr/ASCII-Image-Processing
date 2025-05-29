document.addEventListener('DOMContentLoaded', () => {
    const themeIconContainer = document.getElementById('theme-icon-container');
    const rightThemePrompt = document.getElementById('right-theme-prompt');

    function updateRightThemePromptText() {
        if (!rightThemePrompt) return;
        if (document.body.classList.contains('dark-theme')) {
            rightThemePrompt.textContent = "Press T for light";
        } else {
            rightThemePrompt.textContent = "Press T for dark";
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        updateRightThemePromptText();
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

    // Set initial right theme prompt text
    updateRightThemePromptText();
}); 
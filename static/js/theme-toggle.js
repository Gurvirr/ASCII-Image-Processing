document.addEventListener('DOMContentLoaded', () => {
    const themeIconContainer = document.getElementById('theme-icon-container');
    const rightThemePrompt = document.getElementById('right-theme-prompt');
    const commandInput = document.getElementById('command-input');

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

    document.addEventListener('keydown', function(event) {
        if (event.key.toLowerCase() === 't') {
            if (event.target !== commandInput && 
                !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
                event.preventDefault();
                toggleTheme();
            }
        }
    });

    if (themeIconContainer) {
        themeIconContainer.addEventListener('click', function() {
            toggleTheme();
        });
    }

    // Make toggleTheme globally accessible if it isn't already
    window.toggleTheme = toggleTheme;

    updateRightThemePromptText();
});
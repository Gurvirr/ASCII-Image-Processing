document.addEventListener('DOMContentLoaded', () => {
    const commandInput = document.getElementById('command-input');
    const commandOutputContainer = document.getElementById('command-output-container');

    document.addEventListener('keydown', function(event) {
        if (event.key === '/' && event.target !== commandInput) { // Only toggle nav if not typing in command input
            event.preventDefault(); 
            document.body.classList.toggle('side-nav-is-open');
            if (document.body.classList.contains('side-nav-is-open')) {
                commandInput.focus();
            }
        }
    });

    if (commandInput && commandOutputContainer) {
        commandInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const commandText = commandInput.value.trim();

                if (commandText !== '') {
                    const newCommandOutput = document.createElement('p');
                    newCommandOutput.textContent = commandText;
                    
                    commandOutputContainer.prepend(newCommandOutput);
                    
                    // Force a reflow before adding the class to trigger transition
                    // One way is to request a property that forces layout calculation:
                    void newCommandOutput.offsetWidth;

                    newCommandOutput.classList.add('visible');
                    
                    // Timer to initiate fade-out animation and then remove
                    setTimeout(() => {
                        newCommandOutput.classList.remove('visible'); // Remove .visible to ensure .fading-out styles take precedence if they conflict
                        newCommandOutput.classList.add('fading-out');
                        
                        // Timer to remove the element from DOM after the fade-out animation (0.3s)
                        setTimeout(() => {
                            if (newCommandOutput.parentNode) {
                                newCommandOutput.remove();
                            }
                        }, 300); // This duration MUST match the CSS transition duration for opacity/max-height
                    }, 8000); // 8 seconds until fade-out begins

                    commandInput.value = ''; // Clear the input
                }
            }
        });
    }
}); 
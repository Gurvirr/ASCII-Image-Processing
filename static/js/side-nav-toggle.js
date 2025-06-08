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
                    // Remove oldest message if there are already 20
                    const outputs = commandOutputContainer.querySelectorAll('p');
                    if (outputs.length >= 20) {
                        const oldest = outputs[outputs.length - 1];
                        oldest.classList.remove('visible');
                        oldest.classList.add('fading-out');
                        setTimeout(() => {
                            if (oldest.parentNode) {
                                oldest.remove();
                            }
                        }, 700); // match CSS fade duration
                    }

                    const newCommandOutput = document.createElement('p');
                    newCommandOutput.textContent = commandText;
                    
                    commandOutputContainer.prepend(newCommandOutput);
                    
                    // Force a reflow before adding the class to trigger transition
                    // One way is to request a property that forces layout calculation:
                    void newCommandOutput.offsetWidth;

                    newCommandOutput.classList.add('visible');
                    
                    // Remove the 8-second lifespan timer and fade-out. Messages now only disappear when the 20-message limit is exceeded.

                    commandInput.value = ''; // Clear the input
                }
            }
        });
    }
}); 
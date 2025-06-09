document.addEventListener("DOMContentLoaded", () => {
  // Upload modal logic
  const commandInput = document.getElementById("command-input");
  const uploadModal = document.getElementById("upload-modal");
  const uploadForm = document.getElementById("upload-form");
  const cancelUpload = document.getElementById("cancel-upload");
  const widthSelect = document.getElementById("width-select");
  const customWidth = document.getElementById("custom-width");
  const paletteSelect = document.getElementById("palette-select");
  const customPalette = document.getElementById("custom-palette");

  // Show/hide custom width input
  widthSelect.addEventListener("change", () => {
    customWidth.style.display = widthSelect.value === "custom" ? "inline-block" : "none";
  });

  // Show/hide custom palette input
  paletteSelect.addEventListener("change", () => {
    customPalette.style.display = paletteSelect.value === "custom" ? "inline-block" : "none";
  });

  // Command terminal input and output logic
  const commandOutputContainer = document.getElementById('command-output-container');
  commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const commandText = commandInput.value.trim();
      // Helper to add a message to the terminal
      function addTerminalMessage(text) {
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
        newCommandOutput.textContent = text;
        commandOutputContainer.prepend(newCommandOutput);
        void newCommandOutput.offsetWidth;
        newCommandOutput.classList.add('visible');
      }

      if (commandText === '?upload --image') {
        addTerminalMessage(commandText);
        uploadModal.style.display = 'flex';
        commandInput.value = '';
        return;
      }
      if (commandText === '?clear') {
        addTerminalMessage(commandText);
        // Staggered fade out for all messages from oldest to newest (top to bottom)
        const outputs = Array.from(commandOutputContainer.querySelectorAll('p'));
        outputs.reverse(); // So the most recent fades last
        outputs.forEach((msg, idx) => {
          setTimeout(() => {
            msg.classList.remove('visible');
            msg.classList.add('fading-out');
          }, idx * 80); // 80ms stagger per message
        });
        setTimeout(() => {
          commandOutputContainer.innerHTML = '';
        }, 700 + outputs.length * 80); // Wait for last fade to finish
        commandInput.value = '';
        return;
      }
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
        void newCommandOutput.offsetWidth;
        newCommandOutput.classList.add('visible');
        // No auto-fade, only removed when limit is exceeded
        commandInput.value = '';
      }
    }
  });

  // Cancel button
  cancelUpload.addEventListener("click", () => {
    uploadModal.style.display = "none";
    uploadForm.reset();
    customWidth.style.display = "none";
    customPalette.style.display = "none";
  });

  // Handle form submit (AJAX to backend, to be implemented)
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: Send form data to backend via fetch
    uploadModal.style.display = "none";
    uploadForm.reset();
    customWidth.style.display = "none";
    customPalette.style.display = "none";
    // Optionally, show a loading spinner or message
  });
}); 
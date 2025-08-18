document.addEventListener("DOMContentLoaded", () => {
  const commandInput = document.getElementById("command-input");
  const autocompleteSuggestion = document.getElementById(
    "autocomplete-suggestion",
  );

  const validCommands = [
    "?help",
    "?clear",
    "?size",
    "?theme",
    "?upload",
    "?ascii",
  ];

  // Initialize file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file"; // Set type to file
  fileInput.accept = "image/*"; // Only accept image files
  fileInput.style.display = "none"; // Hide it
  document.body.appendChild(fileInput); // Add/append to webpage

  let uploadedFileName = "";

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadedFileName = file.name; // store it
      addTerminalMessage(
        `Selected file: "${uploadedFileName}".`,
        "system-message",
      );

      const formData = new FormData();
      formData.append("file", file);

      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text()) // read server response
        .then((msg) => {
          addTerminalMessage(msg, "system-message");
          fileInput.value = ""; // clear input so same file can be re-uploaded
        })
        .catch((error) => {
          addTerminalMessage(`Upload failed: ${error}`, "error-message");
          fileInput.value = ""; // clear input even on error
        });
    }
  });

  // Command terminal input and output logic
  const commandOutputContainer = document.getElementById(
    "command-output-container",
  );

  let currentMessageCount = commandOutputContainer.querySelectorAll("p").length;

  // Helper to add a message to the terminal
  function addTerminalMessage(text, commandType) {
    // Check if we need to remove any messages to maintain the 20 message limit
    const maxMessages = 20;
    const outputs =
      commandOutputContainer.querySelectorAll("p:not(.fading-out)");

    // If we're at or will exceed the limit with this new message
    if (outputs.length >= maxMessages) {
      // Find the oldest message (last in the DOM since we prepend)
      const oldest = outputs[outputs.length - 1];

      // Mark it for removal
      oldest.classList.remove("visible");
      oldest.classList.add("fading-out");

      // Actually remove it from DOM after animation completes
      setTimeout(() => {
        if (oldest.parentNode) {
          oldest.remove();
        }
      }, 700); // match CSS fade duration
    }

    // Create and add the new message
    const newCommandOutput = document.createElement("p");
    newCommandOutput.textContent = text;
    if (commandType) {
      newCommandOutput.classList.add(commandType);
    }

    // Add the new message to the container
    commandOutputContainer.prepend(newCommandOutput);

    // Trigger reflow for animation
    void newCommandOutput.offsetWidth;
    newCommandOutput.classList.add("visible");
  }

  // Initialize file input element
  // Autocomplete functionality
  function updateAutocompleteSuggestion() {
    const inputValue = commandInput.value.trim();

    if (inputValue === "") {
      autocompleteSuggestion.textContent = "";
      return;
    }

    // Find a command that starts with the current input
    const matchingCommand = validCommands.find((cmd) =>
      cmd.toLowerCase().startsWith(inputValue.toLowerCase()),
    );

    if (matchingCommand) {
      // Only show the part of the suggestion that comes after what's already typed
      const suggestion = matchingCommand.substring(inputValue.length);
      autocompleteSuggestion.textContent = suggestion;

      // Position the suggestion to align with the input text
      autocompleteSuggestion.style.paddingLeft = `${8 + calculateTextWidth(inputValue)}px`;
    } else {
      autocompleteSuggestion.textContent = "";
    }
  }

  // Helper to calculate text width (for aligning suggestion with input text)
  function calculateTextWidth(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = window.getComputedStyle(commandInput).font;
    return context.measureText(text).width;
  }

  // Handle input events for autocompletion
  commandInput.addEventListener("input", updateAutocompleteSuggestion);

  // Complete the suggestion on Tab key
  commandInput.addEventListener("keydown", function (event) {
    if (event.key === "Tab" && autocompleteSuggestion.textContent) {
      event.preventDefault();
      commandInput.value += autocompleteSuggestion.textContent;
      autocompleteSuggestion.textContent = "";
      // Move cursor to end of input
      commandInput.selectionStart = commandInput.value.length;
      commandInput.selectionEnd = commandInput.value.length;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const commandText = commandInput.value.trim();

      if (commandText.startsWith("?")) {
        if (validCommands.includes(commandText)) {
          // Check if the command is in the validCommands array
          addTerminalMessage(commandText, "valid-command");

          if (commandText === "?clear") {
            // Staggered fade out for all messages from oldest to newest (top to bottom)
            const outputs = Array.from(
              commandOutputContainer.querySelectorAll("p"),
            );
            outputs.reverse(); // So the most recent fades last
            outputs.forEach((msg, idx) => {
              setTimeout(() => {
                msg.classList.remove("visible");
                msg.classList.add("fading-out");
              }, idx * 80); // 80ms stagger per message
            });
            setTimeout(
              () => {
                commandOutputContainer.innerHTML = "";
              },
              700 + outputs.length * 80,
            ); // Wait for last fade to finish
          } else if (commandText === "?size") {
            document.body.classList.toggle("terminal-large-font");
            const isLarge = document.body.classList.contains(
              "terminal-large-font",
            );
            addTerminalMessage(
              `Terminal font size set to ${isLarge ? "large" : "default"}.`,
              "system-message",
            ); // Added 'system-message' class
          } else if (commandText === "?theme") {
            if (typeof toggleTheme === "function") {
              toggleTheme();
              const currentTheme = document.body.classList.contains(
                "dark-theme",
              )
                ? "dark"
                : "light";
              addTerminalMessage(
                `Theme switched to ${currentTheme} mode.`,
                "system-message",
              );
            } else {
              addTerminalMessage(
                "Error: Theme toggle function not found.",
                "invalid-command",
              );
            }
          } else if (commandText === "?upload") {
            fileInput.click();
          } else if (commandText == "?ascii") {
            fetch("/ascii", {
              method: "GET",
            })
              .then((response) => {
                if (!response.ok) throw new Error("No file uploaded yet.");
                return response.text();
              })
              .then((asciiArt) => {
                addTerminalMessage(
                  `Converted "${uploadedFileName}" to ASCII.`,
                  "system-message",
                ); // display in terminal
                document.getElementById("ascii").textContent = asciiArt; // update <pre> dynamically
              })
              .catch((error) => {
                addTerminalMessage(`Error: ${error.message}`, "error-message");
              });
          }
        } else {
          addTerminalMessage(commandText, "invalid-command");
        }
      } else if (commandText !== "") {
        // For non-commands, we don't pass a commandType, so it gets default styling
        addTerminalMessage(commandText);
      }
      commandInput.value = ""; // Clear input after processing
      autocompleteSuggestion.textContent = ""; // Clear suggestion after command
    }
  });
});

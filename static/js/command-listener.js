document.addEventListener("DOMContentLoaded", () => {
  // Improved: Use requestAnimationFrame, delayed fallback, and MutationObserver for header changes
  function positionAsciiOutputContainer() {
    requestAnimationFrame(() => {
      let header = document.getElementById("ascii-header");
      const splitHeader = document.getElementById("split-ascii-header");
      const container = document.querySelector(".ascii-output-container");

      // If split header is visible, use its bottom instead
      if (splitHeader && splitHeader.offsetParent !== null) {
        // Find the last visible pre inside split-ascii-header
        const preElements = splitHeader.querySelectorAll("pre");
        let lastVisiblePre = null;
        preElements.forEach((pre) => {
          if (pre.offsetParent !== null) lastVisiblePre = pre;
        });
        if (lastVisiblePre) header = lastVisiblePre;
      }

      if (header && container) {
        const rect = header.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        container.style.top = rect.bottom + scrollY + 10 + "px";
      }
    });
  }

  // Initial positioning
  positionAsciiOutputContainer();

  // Reposition on resize/scroll, with requestAnimationFrame and a delayed fallback
  window.addEventListener("resize", () => {
    positionAsciiOutputContainer();
    setTimeout(positionAsciiOutputContainer, 100); // fallback for late layout
  });
  window.addEventListener("scroll", positionAsciiOutputContainer);

  // Optionally, observe DOM changes in the header area
  const splitHeader = document.getElementById("split-ascii-header");
  const headerArea = splitHeader?.parentNode || document.body;
  const observer = new MutationObserver(positionAsciiOutputContainer);
  observer.observe(headerArea, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  const commandInput = document.getElementById("command-input");
  const autocompleteSuggestion = document.getElementById(
    "autocomplete-suggestion",
  );

  const validCommands = [
    "?palette",
    "?help",
    "?clear",
    "?size",
    "?theme",
    "?upload",
    "?ascii",
    "?mode",
    "?invert",
  ];

  const commandDescriptions = {
    "?palette": "Select new palette",
    "?invert": "Invert ASCII palette",
    "?mode {mode}": "Switch mode",
    "?ascii {width}": "Specify width",
    "?ascii": "Convert image to ASCII",
    "?upload": "Upload image",
    "?theme": "Toggle light/dark theme",
    "?size": "Toggle terminal font size",
    "?clear": "Clear terminal",
    "?help": "List all valid commands",
  };

  const paletteMenu = {
    "custom:": "custom",
    "complex:":
      "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'.",
    "default:": "MNFVI*:.",
  };

  let currentMode = "grayscale";
  let lastConversionWidth = null;
  let lastImageUploaded = false;
  let isInverted = false;
  let inPaletteMenu = false;
  let paletteMenuIndex = 2; // Current selected index (start at "default")
  let isNavigatingMenu = false; // True when using arrow keys, false when typing

  // Function to display the palette menu
  function displayPaletteMenu(withAnimation = true) {
    // Define the order we want
    let paletteOrder = ["custom", "complex", "default"];

    if (withAnimation) {
      // Don't clear messages on initial display to preserve command message
      // Create new elements with animation
      for (let i = 0; i < paletteOrder.length; i++) {
        let paletteName = paletteOrder[i];
        if (i === paletteMenuIndex) {
          addTerminalMessage("\u00A0\u00A0> " + paletteName, "selected-option"); // Selected option
        } else {
          addTerminalMessage("\u00A0\u00A0" + paletteName, "system-message"); // Other options (with spaces)
        }
      }

      // Add opened message after menu so it appears at the top
      addTerminalMessage("Select your character palette:", "system-message");
    } else {
      // Update existing elements in place (no animation)
      const outputs = commandOutputContainer.querySelectorAll("p");
      for (let i = 0; i < 3; i++) {
        if (outputs[i + 1]) {
          // Skip the first element (opened message)
          let paletteName = paletteOrder[2 - i]; // Reverse index to match prepended order
          if (2 - i === paletteMenuIndex) {
            outputs[i + 1].textContent = "\u00A0\u00A0> " + paletteName; // Selected option
            outputs[i + 1].className = "selected-option visible";
          } else {
            outputs[i + 1].textContent = "\u00A0\u00A0" + paletteName; // Other options (with spaces)
            outputs[i + 1].className = "system-message visible";
          }
        }
      }
    }
  }

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

  // Autocomplete functionality
  function updateAutocompleteSuggestion() {
    const inputValue = commandInput.value.trim();

    if (inputValue === "") {
      autocompleteSuggestion.textContent = "";
      return;
    }

    // Autocomplete suggestion for all mode parameters (exact match)
    if (inputValue.toLowerCase() === "?mode") {
      autocompleteSuggestion.textContent = "grayscale/rgb/ansi";
      autocompleteSuggestion.style.paddingLeft = `${8 + calculateTextWidth(inputValue) + 4}px`;
      return;
    }

    // Autocomplete functionality for the 3 mode parameters (partial match)
    if (inputValue.toLowerCase().startsWith("?mode ")) {
      const parts = inputValue.split(" ");
      if (parts.length === 2) {
        const partialMode = parts[1].toLowerCase();
        const modeOptions = ["grayscale", "rgb", "ansi"];

        const matchingMode = modeOptions.find((mode) =>
          mode.toLowerCase().startsWith(partialMode),
        );

        if (matchingMode) {
          // Show completion for just the mode part
          const completion = matchingMode.substring(partialMode.length);
          autocompleteSuggestion.textContent = completion;
          autocompleteSuggestion.style.paddingLeft = `${8 + calculateTextWidth(inputValue)}px`;
        } else {
          autocompleteSuggestion.textContent = "";
        }
        return;
      }
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
    // Handle palette menu navigation (only intercept specific keys)
    if (inPaletteMenu) {
      // Arrow Up key
      if (event.key === "ArrowUp") {
        // Handle arrow up in palette menu
        isNavigatingMenu = true;
        event.preventDefault();

        paletteMenuIndex = (paletteMenuIndex + 1) % 3;
        displayPaletteMenu(false);
        return;
      }

      // Arrow Down key
      else if (event.key === "ArrowDown") {
        // Handle arrow down in palette menu
        isNavigatingMenu = true;
        event.preventDefault();

        paletteMenuIndex = (paletteMenuIndex - 1 + 3) % 3;
        displayPaletteMenu(false);
        return;
      }

      // Enter key
      else if (event.key === "Enter") {
        if (isNavigatingMenu) {
          // Select the current menu option
          event.preventDefault();
          return;
        }
      }

      // Escape key
      else if (event.key === "Escape") {
        // Exit palette menu and clear it from history
        inPaletteMenu = false;
        isNavigatingMenu = false;

        // Remove the palette menu items from terminal history
        const outputs = commandOutputContainer.querySelectorAll("p");
        for (let i = 0; i < 4; i++) {
          if (outputs[i]) {
            outputs[i].remove();
          }
        }

        addTerminalMessage("Palette menu closed.", "system-message");
        event.preventDefault();
        event.stopPropagation(); // Prevent nav panel from closing
        return;
      }

      // Other keys
      else {
        // Any other key (typing) means we're no longer navigating the menu
        isNavigatingMenu = false;
      }
    }

    // Normal command processing when not in palette menu
    if (event.key === "Tab" && autocompleteSuggestion.textContent) {
      event.preventDefault();
      commandInput.value += autocompleteSuggestion.textContent;
      autocompleteSuggestion.textContent = "";
      // Move cursor to end of input
      commandInput.selectionStart = commandInput.value.length;
      commandInput.selectionEnd = commandInput.value.length;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const commandText = commandInput.value.trim().toLowerCase();

      // Close palette menu if any command is entered (valid or invalid)
      if (inPaletteMenu) {
        inPaletteMenu = false;
        isNavigatingMenu = false;

        // Remove the palette menu items from terminal history
        const outputs = commandOutputContainer.querySelectorAll("p");
        for (let i = 0; i < 4; i++) {
          if (outputs[i]) {
            outputs[i].remove();
          }
        }

        addTerminalMessage("Palette menu closed.", "system-message");
      }

      if (commandText.startsWith("?")) {
        if (
          validCommands.includes(commandText) ||
          commandText.startsWith("?ascii ") ||
          commandText.startsWith("?mode ")
        ) {
          // Check if the command is in the validCommands array

          addTerminalMessage(commandText, "valid-command");

          // ?help command
          if (commandText === "?help") {
            Object.entries(commandDescriptions).forEach(([cmd, desc]) => {
              addTerminalMessage(
                `${cmd} \u00A0—\u00A0 ${desc}`,
                "system-message",
              );
            });
          }

          // ?clear command
          else if (commandText === "?clear") {
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
          }

          // ?size command
          else if (commandText === "?size") {
            document.body.classList.toggle("terminal-large-font");
            const isLarge = document.body.classList.contains(
              "terminal-large-font",
            );
            addTerminalMessage(
              `Terminal font size set to ${isLarge ? "large" : "default"}.`,
              "system-message",
            );
          }

          // ?theme command
          else if (commandText === "?theme") {
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
          }

          // ?upload command
          else if (commandText === "?upload") {
            fileInput.click();
          }

          // ?ascii command
          else if (commandText.startsWith("?ascii")) {
            const parts = commandText.split(" ");
            const width = parts[1] ? parseInt(parts[1], 10) : 256;

            if (isNaN(width) || width <= 0) {
              addTerminalMessage(
                "Invalid width. Please enter a positive number, e.g. ?ascii 128",
                "system-message",
              );
              return;
            }

            fetch(
              `/ascii?width=${width}&mode=${currentMode}&invert=${isInverted}`,
              {
                method: "GET",
              },
            )
              .then((response) => {
                if (!response.ok) throw new Error("No file uploaded yet.");
                return response.json();
              })
              .then((data) => {
                // Store conversion parameters for ?mode command
                lastConversionWidth = width;
                lastImageUploaded = true;

                addTerminalMessage(
                  `Converted "${uploadedFileName}" to ASCII.`,
                  "system-message",
                );

                // Adjust font size dynamically based on width
                // setAsciiFontSize(width);
                document.getElementById("ascii").innerHTML = data.ascii;
                fitAsciiToContainer(data.is_portrait); // <-- pass orientation to fit function
              })
              .catch((error) => {
                addTerminalMessage(`Error: ${error.message}`, "error-message");
              });
          }

          // ?mode command
          else if (commandText.startsWith("?mode ")) {
            if (!lastImageUploaded || !lastConversionWidth) {
              addTerminalMessage(
                "No ASCII conversion found. Please use ?ascii first.",
                "system-message",
              );
              return;
            }

            const parts = commandText.split(" ");
            const newMode = parts[1]?.toLowerCase();

            const allowedModes = ["grayscale", "rgb", "ansi"];
            if (allowedModes.includes(newMode)) {
              currentMode = newMode;

              // Re-convert with new mode using stored width
              fetch(
                `/ascii?width=${lastConversionWidth}&mode=${currentMode}&invert=${isInverted}`,
                {
                  method: "GET",
                },
              )
                .then((response) => {
                  if (!response.ok) throw new Error("Conversion failed.");
                  return response.json();
                })
                .then((data) => {
                  const modeText =
                    currentMode === "rgb"
                      ? "RGB"
                      : currentMode === "ansi"
                        ? "ANSI"
                        : "Grayscale";
                  addTerminalMessage(
                    `Applied ${modeText} mode to existing ASCII.`,
                    "system-message",
                  );

                  document.getElementById("ascii").innerHTML = data.ascii;
                  fitAsciiToContainer(data.is_portrait);
                })
                .catch((error) => {
                  addTerminalMessage(
                    `Error: ${error.message}`,
                    "error-message",
                  );
                });
            } else {
              addTerminalMessage(
                `Invalid mode. Choose one of: ${allowedModes.join(", ")}`,
                "error-message",
              );
            }
          }

          // ?invert command
          else if (commandText === "?invert") {
            isInverted = !isInverted;
            addTerminalMessage(
              `Character inversion ${isInverted ? "enabled" : "disabled"}.`,
              "system-message",
            );

            // Re-convert if image exists
            if (lastImageUploaded && lastConversionWidth) {
              fetch(
                `/ascii?width=${lastConversionWidth}&mode=${currentMode}&invert=${isInverted}`,
                {
                  method: "GET",
                },
              )
                .then((response) => {
                  if (!response.ok) throw new Error("Re-conversion failed.");
                  return response.json();
                })
                .then((data) => {
                  addTerminalMessage(
                    `Applied inversion to existing ASCII.`,
                    "system-message",
                  );

                  document.getElementById("ascii").innerHTML = data.ascii;
                  fitAsciiToContainer(data.is_portrait);
                })
                .catch((error) => {
                  addTerminalMessage(
                    `Error: ${error.message}`,
                    "error-message",
                  );
                });
            }
          }

          // ?palette command
          else if (commandText === "?palette") {
            inPaletteMenu = true;
            isNavigatingMenu = false; // Start in typing mode, not navigation mode

            paletteMenuIndex = 2; // Point to "default" which is now at index 2

            displayPaletteMenu();
          }
        }

        // check for invalid commands
        else {
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

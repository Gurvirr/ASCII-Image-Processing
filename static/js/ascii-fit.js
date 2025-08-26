document.addEventListener("DOMContentLoaded", () => {
  const asciiOutput = document.getElementById("ascii");
  if (!asciiOutput) return;

  let storedOrientation = null; // Store the orientation

  window.fitAsciiToContainer = function (isPortrait) {
    // Store orientation if provided, otherwise use stored value
    if (isPortrait !== undefined) {
      storedOrientation = isPortrait;
    }

    // Use stored orientation if no parameter provided
    const currentOrientation =
      isPortrait !== undefined ? isPortrait : storedOrientation;
    const container = asciiOutput.parentElement;
    if (!container) return;

    const lines = asciiOutput.textContent.split("\n");
    const rows = lines.length;
    const cols = Math.max(...lines.map((line) => line.length));

    if (rows === 0 || cols === 0) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / cols;
    const scaleY = containerHeight / rows;

    let fontSize;
    if (currentOrientation) {
      // For portrait images, Math.min works perfectly
      fontSize = Math.min(scaleX, scaleY);
    } else {
      // For landscape images, Math.max works perfectly
      fontSize = Math.max(scaleX, scaleY);
    }

    asciiOutput.style.fontSize = fontSize + "px";
    asciiOutput.style.lineHeight = fontSize + "px";
  };

  window.addEventListener("resize", () => fitAsciiToContainer());

  const observer = new MutationObserver(() => fitAsciiToContainer());
  observer.observe(asciiOutput, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  fitAsciiToContainer();
});

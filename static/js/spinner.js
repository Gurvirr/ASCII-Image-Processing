document.addEventListener("DOMContentLoaded", () => {
  const spinnerFrames = [
                         "\\", "|", "/", "—",
                         "\\", "|", "/", "—",
                         "\\", "|", "/", "—",
                         "\\", "|", "/",

                         " ", " ", " ", " ",

                         "/", "|", "\\", "—",
                         "/", "|", "\\", "—",
                         "/", "|", "\\", "—",
                         "/", "|", "\\",

                         " ", " ", " ", " "
                        ];
  let index = 0;
  const spinner = document.getElementById("spinner-char");

  if (!spinner) return;

  setInterval(() => {
    spinner.textContent = spinnerFrames[index];
    index = (index + 1) % spinnerFrames.length;
  }, 200); // speed in milliseconds
});

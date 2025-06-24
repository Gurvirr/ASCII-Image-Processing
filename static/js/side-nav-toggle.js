document.addEventListener("DOMContentLoaded", () => {
    const commandInput = document.getElementById("command-input");
    const commandOutputContainer = document.getElementById("command-output-container");

    document.addEventListener("keydown", function(event) {
        if (event.key === "/" && event.target !== commandInput) { // Only toggle nav if not typing in command input
            event.preventDefault(); 
            document.body.classList.toggle("side-nav-is-open");
            if (document.body.classList.contains("side-nav-is-open")) {
                commandInput.focus();
            }
        }
    });
}); 
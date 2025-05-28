document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', function(event) {
        if (event.key === 't') {
            event.preventDefault();
            document.body.classList.toggle('dark-theme');
        }
    });
}); 
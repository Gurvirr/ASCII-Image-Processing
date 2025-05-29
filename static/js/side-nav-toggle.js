document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', function(event) {
        if (event.key === '/') {
            event.preventDefault(); // Prevent default browser action for '/'
            document.body.classList.toggle('side-nav-is-open');
        }
    });
}); 
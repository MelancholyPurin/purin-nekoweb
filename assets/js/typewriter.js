// Terminal typing effect for .typeWriter headings.
// Sets --characters from the actual text so the animation ends exactly at the last character.
document.querySelectorAll('.typeWriter').forEach(el => {
    el.style.setProperty('--characters', el.textContent.trim().length);
    el.classList.add('play');
});

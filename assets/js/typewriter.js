// Terminal typing effect for .typeWriter headings

const MS_PER_CHARACTER = 70;

function typeOut(el) {
    const text = el.textContent.trim();
    el.textContent = text;
    const node = el.firstChild;
    if (!node) {
        return;
    }

    // Width of the text up to each character boundary
    const range = document.createRange();
    range.setStart(node, 0);
    const widths = [0];
    let offset = 0;
    for (const char of Array.from(text)) {
        offset += char.length;
        range.setEnd(node, offset);
        widths.push(range.getBoundingClientRect().width);
    }
    const fullWidth = widths[widths.length - 1];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || widths.length < 3) {
        el.style.width = fullWidth + "px";
    } else {
        // Each keyframe jumps (step-end) to the next character boundary
        const keyframes = widths.map((width, i) => ({
            width: width + "px",
            offset: i / (widths.length - 1),
            easing: "steps(1, end)",
        }));
        el.animate(keyframes, {
            duration: (widths.length - 1) * MS_PER_CHARACTER,
            fill: "forwards",
        });
    }
    el.classList.add("play");
}

// Wait for the font to avoid measuring with the fallback font
document.querySelectorAll(".typeWriter").forEach((el) => {
    const font = getComputedStyle(el).font;
    const ready = document.fonts
        ? document.fonts.load(font, el.textContent)
        : Promise.resolve();
    ready.catch(() => {}).then(() => typeOut(el));
});

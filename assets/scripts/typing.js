const texts = [
    "aspiring software developer",
    "self-taught programmer",
    "problem solver",
    "programming hobbyist",
    "backend enthusiast"
];
const typingSpeed = 100;
const erasingSpeed = 50;
const delayBetween = 1500;

let textIndex = 0;
let charIndex = 0;
const typedText = document.getElementById("typed-text");

function type() {
    if (charIndex < texts[textIndex].length) {
        typedText.textContent += texts[textIndex][charIndex];
        charIndex++;
        setTimeout(type, typingSpeed);
    } else {
        setTimeout(erase, delayBetween);
    }
}

function erase() {
    if (charIndex > 0) {
        typedText.textContent = texts[textIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingSpeed);
    } else {
        textIndex = (textIndex + 1) % texts.length; // next Text
        setTimeout(type, typingSpeed);
    }
}

// Initial
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(type, delayBetween);
});

// skills.js

document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".skill-container");

    containers.forEach(container => {
        const placeholderSkills = container.querySelectorAll(".skill");

        placeholderSkills.forEach(item => {
            const name = item.dataset.name;
            const level = parseInt(item.dataset.level, 10);

            const card = document.createElement("div");
            card.className = "skill-card";

            card.innerHTML = `
                <div class="skill-header">
                    <span class="skill-name">${name}</span>
                    <span class="skill-percent">${level}%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-bar-fill" style="width: ${level}%;"></div>
                </div>
            `;

            item.replaceWith(card);
        });
    });
});

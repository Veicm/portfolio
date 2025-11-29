const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    subject: document.getElementById("subject").value,
    msg: document.getElementById("msg").value,
    consent: document.getElementById("consent").checked,
  };

  if (!formData.consent) {
    status.textContent = "You must agree to store your data.";
    return;
  }

  try {
    const response = await fetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.text();
    status.textContent = result;
    form.reset();
  } catch (err) {
    status.textContent = "Failed to send message.";
    console.error(err);
  }
});

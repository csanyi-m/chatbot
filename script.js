let password = "";
let selectedModel = "gpt-4-turbo";
const apiUrl = "https://chatbot-api-proxy.vercel.app/api";
let sourceText = "";

// 🔐 Jelszó ellenőrzése
function verifyPassword() {
  const input = document.getElementById("passwordInput").value.trim();
  if (!input) return;

  password = input;

  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "ping",
      password: password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.reply || data.success) {
        document.querySelector(".password-container").style.display = "none";
        document.getElementById("chatContainer").style.display = "block";
        document.getElementById("modelSelector").style.display = "block";

        const modelDropdown = document.getElementById("modelDropdown");
        if (modelDropdown) {
          selectedModel = modelDropdown.value;
          modelDropdown.addEventListener("change", () => {
            selectedModel = modelDropdown.value;
          });
        }
      } else {
        document.getElementById("passwordError").textContent = "❌ Hibás jelszó.";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("passwordError").textContent = "❌ Hiba történt a kapcsolat során.";
    });
}

// 🌐 Link betöltése
async function fetchTextFromUrl() {
  const url = document.getElementById("urlInput").value;
  try {
    const response = await fetch("https://chatbot-api-proxy.vercel.app/api/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url,
        password: password
      })
    });

    const data = await response.json();

    if (data.content) {
      sourceText = new DOMParser().parseFromString(data.content, "text/html").body.innerText;
      document.getElementById("chatBox").innerHTML = `<p style="color:lightgreen;">✅ Forrás betöltve.</p>`;
    } else {
      document.getElementById("chatBox").innerHTML = `<p style="color:red;">❌ ${data.error || "Ismeretlen hiba történt."}</p>`;
    }

  } catch (error) {
    console.error(error);
    document.getElementById("chatBox").innerHTML = `<p style="color:red;">❌ Hiba történt a forrás betöltésekor.</p>`;
  }
}

// 🤖 Kérdés megválaszolása
async function answerQuestion() {
  const question = document.getElementById("questionInput").value.trim();

  if (!sourceText) {
    document.getElementById("chatBox").innerHTML = "<p>❗ Előbb adj meg egy forrást.</p>";
    return;
  }

  document.getElementById("chatBox").innerHTML = "<p>⏳ Dolgozom a válaszon...</p>";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Csak az alábbi szöveg alapján válaszolj:\n\n${sourceText}\n\nKérdés: ${question}`,
        password: password,
        model: selectedModel
      })
    });

    const data = await response.json();

    if (data.reply) {
      const html = marked.parse(data.reply);
      document.getElementById("chatBox").innerHTML = `
        <div class="formatted-answer">
          <strong>💬 Válasz:</strong><br>${html}
        </div>
      `;

    } else if (data.error) {
      document.getElementById("chatBox").innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
    } else {
      document.getElementById("chatBox").innerHTML = `<p>❌ Nem érkezett válasz.</p>`;
    }

  } catch (error) {
    console.error(error);
    document.getElementById("chatBox").innerHTML = `<p style="color:red;">❌ Hálózati hiba történt.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("passwordInput");
  const urlInput = document.getElementById("urlInput");
  const questionInput = document.getElementById("questionInput");

  if (passwordInput) {
    passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyPassword();
    });
  }

  if (urlInput) {
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") fetchTextFromUrl();
    });
  }

  if (questionInput) {
    questionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") answerQuestion();
    });
  }
});

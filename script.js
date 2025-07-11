let password = "";
const apiUrl = "https://chatbot-api-proxy.vercel.app/api";
let sourceText = "";

// Jelszó ellenőrzése
function verifyPassword() {
  const input = document.getElementById("passwordInput").value.trim();
  if (!input) return;

  password = input;

  // Egyszerű validáció: próbáljunk kérni egy üres választ
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
        // Jelszó jó, mutatjuk a chatbotot
        document.querySelector(".password-container").style.display = "none";
        document.getElementById("chatContainer").style.display = "block";
      } else {
        document.getElementById("passwordError").textContent = "❌ Hibás jelszó.";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("passwordError").textContent = "❌ Hiba történt a kapcsolat során.";
    });
}

async function fetchTextFromUrl() {
  const url = document.getElementById("urlInput").value;
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    sourceText = doc.body.innerText;
    document.getElementById("chatBox").innerHTML = `<p style="color:lightgreen;">✅ Forrás betöltve.</p>`;
  } catch (error) {
    document.getElementById("chatBox").innerHTML = `<p style="color:red;">❌ Hiba történt a forrás betöltésekor.</p>`;
    console.error(error);
  }
}

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
        password: password
      })
    });

    const data = await response.json();

    if (data.reply) {
      document.getElementById("chatBox").innerHTML = `<p><strong>💬 Válasz:</strong><br>${data.reply}</p>`;
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

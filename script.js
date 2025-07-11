let password = "";
const apiUrl = "https://chatbot-api-proxy.vercel.app/api";

// Jelszó bekérése oldal betöltéskor
window.addEventListener("DOMContentLoaded", () => {
  password = prompt("🔐 Add meg a hozzáférési jelszót:");
  if (!password) {
    alert("⛔ Nem adtál meg jelszót. Az oldal nem használható.");
    document.getElementById("urlInput").disabled = true;
    document.getElementById("questionInput").disabled = true;
  }
});

async function fetchTextFromUrl() {
  const url = document.getElementById("urlInput").value;
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    window.sourceText = doc.body.innerText;
    document.getElementById("chatBox").innerHTML = `<p style="color:lightgreen;">✅ Forrás betöltve.</p>`;
  } catch (error) {
    document.getElementById("chatBox").innerHTML = `<p style="color:red;">❌ Hiba történt a forrás betöltésekor.</p>`;
    console.error(error);
  }
}

async function answerQuestion() {
  const question = document.getElementById("questionInput").value.trim();

  if (!window.sourceText) {
    document.getElementById("chatBox").innerHTML = "<p>❗ Előbb adj meg egy forrást.</p>";
    return;
  }

  if (!password) {
    document.getElementById("chatBox").innerHTML = "<p>❗ Nincs jelszó megadva.</p>";
    return;
  }

  document.getElementById("chatBox").innerHTML = "<p>⏳ Dolgozom a válaszon...</p>";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Csak az alábbi szöveg alapján válaszolj:\n\n${window.sourceText}\n\nKérdés: ${question}`,
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

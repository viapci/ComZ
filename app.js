// app.js
document.getElementById('joinForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nickname = document.getElementById('nickname').value.trim();
  const status = document.getElementById('status').value;

  if (!nickname) {
    alert("Please enter a display name.");
    return;
  }

  // Save to localStorage for now (later to Firebase)
  localStorage.setItem('comz_nickname', nickname);
  localStorage.setItem('comz_status', status);

  // Redirect to the next page (e.g., map.html or lobby.html)
  window.location.href = "lobby.html"; // We'll build this in the next step
});

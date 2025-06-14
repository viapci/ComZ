// lobby.js

// Load user data
const nickname = localStorage.getItem('comz_nickname') || "Unknown";
const status = localStorage.getItem('comz_status') || "looking";

// Display welcome message
document.getElementById("welcomeMessage").innerText =
  `Welcome, ${nickname} – Status: ${status === "looking" ? "Looking for Team" : "In a Team"}`;

// Simulated online users (replace with real-time Firebase later)
const simulatedUsers = [
  { name: "GhostWolf", status: "looking" },
  { name: "MedicM8", status: "in-team" },
  { name: "ZRunner", status: "looking" },
  { name: "ShadowFox", status: "looking" },
  { name: nickname, status: status }, // Include self
];

// Populate user list
const userList = document.getElementById("userList");

simulatedUsers.forEach(user => {
  const li = document.createElement("li");
  li.textContent = `${user.name} – ${user.status === "looking" ? "Looking for Team" : "In a Team"}`;
  li.style.color = user.status === "looking" ? "#90ee90" : "#ffae42";
  userList.appendChild(li);
});

function goBack() {
  window.location.href = "index.html";
}

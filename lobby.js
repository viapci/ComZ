// lobby.js - with chat fixes, go back option, and team passcode

import { db, collection, addDoc, getDocs, getDoc, doc, updateDoc, serverTimestamp, onSnapshot, deleteField, arrayRemove } from './firebase.js';

let teamId = null;
let userName = localStorage.getItem('nickname') || 'Unknown';
let currentUserId = localStorage.getItem('userId') || (Math.random().toString(36).substr(2, 9));
let chatUnsub = null;

// Handle Create Team
document.getElementById('createTeam').addEventListener('click', async () => {
  const mapName = document.getElementById('mapName').value;
  const serverId = document.getElementById('serverId').value;
  const teamSize = parseInt(document.getElementById('teamSize').value, 10);
  const passcode = document.getElementById('teamPasscode').value.trim();

  if (!serverId) return alert('Server ID required');
  if (teamSize < 2 || teamSize > 5) return alert('Team size must be 2-5');

  const team = {
    mapName,
    serverId,
    maxSize: teamSize,
    members: [
      { uid: currentUserId, name: userName }
    ],
    passcode: passcode ? passcode : null
  };

  const teamRef = await addDoc(collection(db, "teams"), team);
  teamId = teamRef.id;
  showTeamLobby();
});

// Show open teams to join
async function setupLobby() {
  const q = collection(db, "teams");
  const snap = await getDocs(q);

  const list = document.getElementById('availableTeams');
  list.innerHTML = '';

  snap.forEach(docSnap => {
    const team = docSnap.data();
    const members = team.members || [];
    if (members.length < team.maxSize) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${members.length}/${team.maxSize}</strong> - Map: ${team.mapName} - Server ID: ${team.serverId} `;
      if (team.passcode) li.innerHTML += `<span style="color:#b54d4d;">🔒</span>`;
      const btn = document.createElement('button');
      btn.textContent = "Join";
      btn.onclick = () => joinTeam(docSnap.id, team);
      li.appendChild(btn);
      list.appendChild(li);
    }
  });
}

// Join a team (with passcode if set)
async function joinTeam(id, team) {
  if (team.passcode) {
    const userPass = prompt("Enter team passcode:");
    if (userPass !== team.passcode) {
      alert("Incorrect passcode.");
      return;
    }
  }

  const teamRef = doc(db, "teams", id);
  const current = await getDoc(teamRef);
  const data = current.data();
  if ((data.members || []).length >= data.maxSize) {
    alert("Team is already full.");
    return;
  }

  const updated = [...data.members, { uid: currentUserId, name: userName }];
  await updateDoc(teamRef, { members: updated });

  teamId = id;
  showTeamLobby();
}

// Show team lobby UI and realtime data
function showTeamLobby() {
  document.getElementById("teamControls").style.display = "none";
  document.getElementById("teamLobby").style.display = "block";

  const info = document.getElementById("teamInfo");
  const membersList = document.getElementById("teamMembers");

  // Listen for team changes and update UI
  onSnapshot(doc(db, "teams", teamId), (docSnap) => {
    const team = docSnap.data();

    info.innerHTML = `
      Team Size: ${team.members.length}/${team.maxSize} <br />
      Map: ${team.mapName} <br />
      Server ID: ${team.serverId}
      ${team.passcode ? '<br><span style="color:#b54d4d;">Passcode protected</span>' : ''}
    `;

    membersList.innerHTML = '';
    team.members.forEach(m => {
      const li = document.createElement('li');
      li.textContent = m.name + (m.uid === currentUserId ? " (You)" : "");
      membersList.appendChild(li);
    });
  });

  // Unsubscribe old chat listener if any
  if (chatUnsub) chatUnsub();

  const chatCol = collection(db, "teams", teamId, "chat");
  chatUnsub = onSnapshot(chatCol, (chatSnap) => {
    const chatList = document.getElementById("chatMessages");
    chatList.innerHTML = "";
    chatSnap.forEach(doc => {
      const { name, message, timestamp } = doc.data();
      const li = document.createElement("li");
      const time = timestamp ? new Date(timestamp.seconds * 1000).toLocaleTimeString() : "";
      li.textContent = `[${time}] ${name}: ${message}`;
      chatList.appendChild(li);
    });
    chatList.scrollTop = chatList.scrollHeight;
  });
}

// Send chat message (supports Enter key)
async function sendChatMsg() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg || !teamId) return;

  const chatCol = collection(db, "teams", teamId, "chat");
  await addDoc(chatCol, {
    name: userName,
    message: msg,
    timestamp: serverTimestamp()
  });

  input.value = "";
  input.focus();
}

document.getElementById("sendChat").addEventListener("click", sendChatMsg);
document.getElementById("chatInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendChatMsg();
  }
});

// Leave team and go back to lobby
document.getElementById("leaveTeam").addEventListener("click", async () => {
  // Remove user from team
  const teamRef = doc(db, "teams", teamId);
  const snap = await getDoc(teamRef);
  if (snap.exists()) {
    const data = snap.data();
    const members = (data.members || []).filter(m => m.uid !== currentUserId);
    await updateDoc(teamRef, { members });
  }
  if (chatUnsub) chatUnsub();
  teamId = null;
  document.getElementById("teamLobby").style.display = "none";
  document.getElementById("teamControls").style.display = "block";
  setupLobby();
});

// On load
setupLobby();

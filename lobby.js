import {
  auth,
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDoc,
  serverTimestamp
} from './firebase.js';

let currentUserId = null;
let userName = localStorage.getItem('comz_nickname') || "Unnamed";
let teamId = null;
let chatUnsub = null;

// Show welcome
document.getElementById("welcome").innerText = `Welcome, ${userName}`;

// Wait for auth
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;
    console.log("[AUTH] Signed in:", currentUserId);
    setupLobby();
  } else {
    console.error("[AUTH] Not signed in.");
  }
});

// Create team button
document.getElementById('createTeam').addEventListener('click', async () => {
  const maxSize = parseInt(document.getElementById('teamSize').value);
  const mapName = document.getElementById('mapName').value;
  const serverId = document.getElementById('serverId').value.trim();

  if (!serverId) {
    alert("Please enter a Server ID.");
    return;
  }

  console.log("[CREATE] Creating team:", { maxSize, mapName, serverId });

  const teamRef = await addDoc(collection(db, "teams"), {
    createdAt: serverTimestamp(),
    maxSize,
    mapName,
    serverId,
    members: [
      { uid: currentUserId, name: userName }
    ]
  });

  teamId = teamRef.id;
  showTeamLobby();
});

// Show open teams to join
async function setupLobby() {
  const q = query(collection(db, "teams"));
  const snap = await getDocs(q);

  const list = document.getElementById('availableTeams');
  list.innerHTML = '';

  snap.forEach(docSnap => {
    const team = docSnap.data();
    const members = team.members || [];
    if (members.length < team.maxSize) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${members.length}/${team.maxSize}</strong> - Map: ${team.mapName} - Server ID: ${team.serverId} `;
      const btn = document.createElement('button');
      btn.textContent = "Join";
      btn.onclick = () => joinTeam(docSnap.id, team);
      li.appendChild(btn);
      list.appendChild(li);
    }
  });
}

// Join a team
async function joinTeam(id, team) {
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

  onSnapshot(doc(db, "teams", teamId), (docSnap) => {
    const team = docSnap.data();

    info.innerHTML = `
      Team Size: ${team.members.length}/${team.maxSize} <br />
      Map: ${team.mapName} <br />
      Server ID: ${team.serverId}
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

// Send chat message
document.getElementById("sendChat").addEventListener("click", async () => {
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
});

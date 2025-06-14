// lobby.js
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

// Show name
document.getElementById("welcome").innerText = `Welcome, ${userName}`;

// Handle auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;
    setupLobby();
  }
});

// Create a new team
document.getElementById('createTeam').addEventListener('click', async () => {
  const maxSize = parseInt(document.getElementById('teamSize').value);

  const teamRef = await addDoc(collection(db, "teams"), {
    createdAt: serverTimestamp(),
    maxSize: maxSize,
    members: [
      {
        uid: currentUserId,
        name: userName
      }
    ]
  });

  teamId = teamRef.id;
  showTeamLobby();
});

// Load open teams
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
      li.innerText = `${members.length}/${team.maxSize} – Team`;
      const btn = document.createElement('button');
      btn.innerText = "Join";
      btn.onclick = () => joinTeam(docSnap.id, team);
      li.appendChild(btn);
      list.appendChild(li);
    }
  });
}

// Join an existing team
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

// Display current team
function showTeamLobby() {
  document.getElementById("teamControls").style.display = "none";
  document.getElementById("teamLobby").style.display = "block";

  const info = document.getElementById("teamInfo");
  const membersList = document.getElementById("teamMembers");

  const unsub = onSnapshot(doc(db, "teams", teamId), (docSnap) => {
    const team = docSnap.data();
    info.innerText = `Team Size: ${team.members.length}/${team.maxSize}`;
    membersList.innerHTML = '';
    team.members.forEach(m => {
      const li = document.createElement('li');
      li.textContent = m.name + (m.uid === currentUserId ? " (You)" : "");
      membersList.appendChild(li);
    });
  });
}

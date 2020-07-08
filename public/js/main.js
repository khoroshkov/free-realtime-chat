const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// Get username and room from URL

function urlParser() {
  const url_string = window.location;
  const url = new URL(url_string);
  const username = url.searchParams.get("username");
  const room = url.searchParams.get("room");
  return { username, room };
}
const { username, room } = urlParser();

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//Messages taken from server
socket.on("message", (message) => {
  outputMessage(message);

  //Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// submit message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get text message
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input field
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Put message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add roomname to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}

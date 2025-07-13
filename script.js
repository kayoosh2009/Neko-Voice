const roomId = window.location.pathname.split("/").pop();
document.getElementById("room-name").innerText = `Room: ${roomId}`;

const peer = new Peer(undefined, {
  host: 'peerjs.com',
  secure: true,
  port: 443,
});

const myAudio = document.createElement("audio");
myAudio.muted = true;

let peers = {};
let myStream;

navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  myStream = stream;
  addAudioStream(myAudio, stream, "You");

  peer.on("call", (call) => {
    call.answer(stream);
    const audio = document.createElement("audio");
    call.on("stream", (userAudioStream) => {
      addAudioStream(audio, userAudioStream, "Guest");
    });
  });

  peer.on("open", (id) => {
    const conn = new WebSocket("wss://peerjs.com/peerjs?room=" + roomId);
    conn.onopen = () => {
      conn.send(JSON.stringify({ type: "join", id, roomId }));
    };

    // use your own signaling or a simple server in real world
  });
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const audio = document.createElement("audio");
  call.on("stream", (userAudioStream) => {
    addAudioStream(audio, userAudioStream, "Guest");
  });
  call.on("close", () => {
    audio.remove();
  });

  peers[userId] = call;
}

function addAudioStream(audio, stream, label) {
  audio.srcObject = stream;
  audio.addEventListener("loadedmetadata", () => {
    audio.play();
  });
  const div = document.createElement("div");
  div.className = "user";
  div.innerText = label;
  div.appendChild(audio);
  document.getElementById("users").appendChild(div);
}

document.getElementById("mute-btn").addEventListener("click", () => {
  const enabled = myStream.getAudioTracks()[0].enabled;
  myStream.getAudioTracks()[0].enabled = !enabled;
});

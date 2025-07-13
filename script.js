const roomId = new URLSearchParams(window.location.search).get("room");
let myStream;
let peers = {};
let myId;

const peer = new Peer(undefined, {
  host: "peerjs.com",
  secure: true,
  port: 443
});

peer.on("open", id => {
  myId = id;
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    myStream = stream;
    addUser(id, "Ты");

    peer.on("call", call => {
      call.answer(stream);
      call.on("stream", remote => {
        addUser(call.peer, "Гость", remote);
      });
    });

    // Хак: в реальности тут надо использовать сервер
    // но мы просто подключимся к себе (тест)
  });
});

function addUser(id, label, stream = null) {
  const user = document.createElement("div");
  user.className = "avatar";
  user.id = `user-${id}`;
  user.title = label;

  user.style.backgroundImage = `url('https://api.dicebear.com/8.x/lorelei/svg?seed=${id}')`;

  document.getElementById("users").appendChild(user);

  if (stream) {
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.play();

    const analyser = new AudioContext();
    const src = analyser.createMediaStreamSource(stream);
    const analyserNode = analyser.createAnalyser();
    src.connect(analyserNode);
    const data = new Uint8Array(analyserNode.frequencyBinCount);

    function detectSpeaking() {
      analyserNode.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;

      const el = document.getElementById(`user-${id}`);
      if (volume > 10) {
        el.classList.add("speaking");
      } else {
        el.classList.remove("speaking");
      }

      requestAnimationFrame(detectSpeaking);
    }
    detectSpeaking();
  }
}

// Таймер звонка
let seconds = 0;
setInterval(() => {
  seconds++;
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  document.getElementById("timer").innerText = `${mins}:${secs}`;
}, 1000);

// Кнопки
document.getElementById("mute").onclick = () => {
  const track = myStream.getAudioTracks()[0];
  track.enabled = !track.enabled;
  alert(track.enabled ? "Микрофон включен" : "Микрофон выключен");
};
document.getElementById("leave").onclick = () => {
  location.href = "/";
};
document.getElementById("info").onclick = () => {
  alert(`Комната: ${roomId}\nСоздано: ${new Date().toLocaleString()}`);
};
document.getElementById("settings").onclick = () => {
  alert("Настройки скоро будут 🛠️");
};

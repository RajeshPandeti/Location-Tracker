const phoneInput = document.querySelector("#phone");
const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const statusEl = document.querySelector("#status");

let timerId = null;

const params = new URLSearchParams(window.location.search);
const invitedPhone = params.get("phone");

if (invitedPhone) {
  phoneInput.value = invitedPhone;
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`.trim();
}

async function sendLocation(position) {
  const phone = phoneInput.value.trim();

  const response = await fetch("/api/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not send location");
  }

  const time = new Date(data.location.updatedAt).toLocaleTimeString();
  setStatus(`Sharing is active. Last update sent at ${time}.`, "good");
}

function readAndSendLocation() {
  if (!navigator.geolocation) {
    setStatus("This browser does not support location access.", "bad");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      sendLocation(position).catch((error) => setStatus(error.message, "bad"));
    },
    (error) => setStatus(error.message, "bad"),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 },
  );
}

startBtn.addEventListener("click", () => {
  if (phoneInput.value.trim().length < 7) {
    setStatus("Enter a valid phone number first.", "bad");
    return;
  }

  startBtn.disabled = true;
  stopBtn.disabled = false;
  phoneInput.disabled = true;
  readAndSendLocation();
  timerId = window.setInterval(readAndSendLocation, 10000);
});

stopBtn.addEventListener("click", () => {
  window.clearInterval(timerId);
  timerId = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  phoneInput.disabled = false;
  setStatus("Location sharing is off.");
});

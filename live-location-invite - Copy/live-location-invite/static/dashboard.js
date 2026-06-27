const searchInput = document.querySelector("#searchPhone");
const publicUrlInput = document.querySelector("#publicUrl");
const trackBtn = document.querySelector("#trackBtn");
const inviteBtn = document.querySelector("#inviteBtn");
const statusEl = document.querySelector("#status");

const map = L.map("map").setView([20.5937, 78.9629], 5);
let marker = null;
let pollId = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

function setStatus(message, tone = "") {
  statusEl.innerHTML = message;
  statusEl.className = `status ${tone}`.trim();
}

async function loadLocation() {
  const phone = encodeURIComponent(searchInput.value.trim());

  if (!phone) {
    setStatus("Enter a phone number to track.", "bad");
    return;
  }

  const response = await fetch(`/api/location/${phone}`);
  const data = await response.json();

  if (!response.ok) {
    setStatus(data.error || "No shared location found.", "bad");
    return;
  }

  const latLng = [data.latitude, data.longitude];

  if (!marker) {
    marker = L.marker(latLng).addTo(map);
  } else {
    marker.setLatLng(latLng);
  }

  marker.bindPopup(`Phone: ${data.phone}`).openPopup();
  map.setView(latLng, 16);

  const updated = new Date(data.updatedAt).toLocaleString();
  const accuracy = data.accuracy ? ` Accuracy: ${Math.round(data.accuracy)} meters.` : "";
  setStatus(`Location updated ${updated}.${accuracy}`, "good");
}

trackBtn.addEventListener("click", () => {
  window.clearInterval(pollId);
  loadLocation();
  pollId = window.setInterval(loadLocation, 5000);
});

inviteBtn.addEventListener("click", async () => {
  const phone = searchInput.value.trim();
  const publicBaseUrl = publicUrlInput.value.trim().replace(/\/$/, "");

  if (phone.length < 7) {
    setStatus("Enter the phone number first, then create an invite.", "bad");
    return;
  }

  const baseUrl = publicBaseUrl || window.location.origin;
  const shareUrl = `${baseUrl}/share?phone=${encodeURIComponent(phone)}`;
  const message = `Please open this link only if you agree to share this phone's live GPS location: ${shareUrl}`;
  const smsUrl = `sms:${encodeURIComponent(phone)}?&body=${encodeURIComponent(message)}`;

  try {
    await navigator.clipboard.writeText(message);
    setStatus(`Invite copied. Send it by SMS or WhatsApp. <a href="${smsUrl}">Open SMS</a>`, "good");
  } catch {
    setStatus(`Send this consent invite: <a href="${shareUrl}">${shareUrl}</a>`, "good");
  }
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    trackBtn.click();
  }
});

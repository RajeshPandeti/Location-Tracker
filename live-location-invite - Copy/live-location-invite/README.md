# Consent-Based Location Invite

This project creates an invite link for a phone. The phone owner must open the link, tap **Start sharing**, and allow browser location permission before GPS updates are sent.

## Run

```powershell
cd C:\Users\rajes\Documents\Codex\2026-06-26\here-are-a-few-structured-prompt-3\outputs\live-location-invite\live-location-invite
python app.py
```

Open the dashboard:

```text
http://127.0.0.1:5000/
```

## Use

1. Enter the phone number in the dashboard.
2. For distant mobile tracking, paste your public HTTPS app URL in the **Public HTTPS URL** field.
3. Click **Invite**.
4. Send the copied message by SMS or WhatsApp.
5. The receiver opens the link, taps **Start sharing**, and allows location.
6. Click **Track** on the dashboard.

## Distant mobile setup

Local links like `http://127.0.0.1:5000` and `http://192.168.x.x:5000` will not work for a phone far away. Deploy this folder to a hosting service that gives you HTTPS, then use that deployed URL in the dashboard.

Example public URL:

```text
https://your-app.onrender.com
```

Example invite link:

```text
https://your-app.onrender.com/share?phone=+919876543210
```

On Render, create a new Web Service and use:

- Runtime: Python
- Build command: leave empty
- Start command: `python app.py`

The included `render.yaml` and `Procfile` are also ready for platforms that detect them.

## Phone access note

For a real distant phone to open the link and share exact GPS, the app must be reachable from that phone and should use HTTPS. The phone owner must still tap **Start sharing** and allow location permission.

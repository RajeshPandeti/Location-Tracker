# Consent-Based Location Invite

This project creates an invite link for a phone. The phone owner must open the link, tap **Start sharing**, and allow browser location permission before GPS updates are sent.

## Run

```powershell
cd C:\Users\rajes\Documents\Codex\2026-06-26\here-are-a-few-structured-prompt-3\outputs\live-location-invite
python app.py
```

Open the dashboard:

```text
http://127.0.0.1:5000/
```

## Use

1. Enter the phone number in the dashboard.
2. Click **Invite**.
3. Send the copied message by SMS or WhatsApp.
4. The receiver opens the link, taps **Start sharing**, and allows location.
5. Click **Track** on the dashboard.

## Phone access note

For a real phone to open the link, the link must be reachable from that phone. Browser GPS access usually requires HTTPS unless the page is running on localhost, so deploy this app or use an HTTPS tunnel for mobile testing.

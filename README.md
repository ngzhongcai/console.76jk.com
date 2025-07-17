# 76JK API — Serverless Backend for Bonsai Journaling

This is the frontend for [76JK.com](https://76jk.com), a minimalist journaling interface for plant lovers. Users can register, log in, and manage NFC-tagged bonsai logs with images, timestamps, and notes.

---

## ⚙️ Tech Stack

- HTML/CSS + PureCSS
- Vanilla JavaScript
- AWS S3 for image hosting
- JWT for session management
- Responsive UI for mobile-first use

---

## 🖼️ Features

- View and manage tags and entries
- Attach images (JPEG, PNG, HEIC supported)
- Timestamp entries with friendly formatting
- Inline image preview and compression
- QR and NFC-compatible tag interaction

---

## 🚧 Project Structure

| File              | Description                          |
|-------------------|--------------------------------------|
| `newentry.html`   | Create a new journal entry           |
| `editentry.html`  | Edit existing journal entry          |
| `login.html`      | User login                           |
| `tag.html`        | View tag and all its entries         |
| `scripts/base.js` | Contains shared frontend logic       |
| `scripts/config.js` | Configures API endpoints           |
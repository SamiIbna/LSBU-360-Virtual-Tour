# LSBU-360-Virtual-Tour
LSBU 360 Tour — A WebXR-ready 360° campus virtual tour for LSBU open days. Built with A-Frame and a lightweight HTML/CSS/JS UI, featuring a Video Tour (videosphere), Photo Tour (photosphere), and Help/Controls page.
# LSBU 360 Tour (WebXR)

A browser-based 360° virtual campus tour created for London South Bank University (LSBU) open-day visitors.  
The experience is designed to be easy for first-time users and works on laptop, mobile, and WebXR-capable browsers (e.g., Meta Quest Browser).

## What this project includes
- **Home page** (`index.html`) – entry point + links into tours
- **Video Tour** (`video.html`) – immersive 360 video playback using an **A-Frame videosphere**
- **Photo Tour** (`photo.html`) – immersive 360 image viewing using an **A-Frame sky/photosphere**
- **Help & Controls** (`help.html`) – instructions + comfort guidance + export notes
- **Shared UI** (`styles.css`) + **app logic** (`js/app.js`)
- **Local dev server** (`server.py`) – avoids `file://` issues

## Tour Stops
- The Hub
- Keyworth
- Faraday Wing
- Perry Building
- Campus Overview (moving/transition video)

> Note: Stops are configured in a data structure (e.g., `BUILDINGS` array) in `js/app.js`.

---

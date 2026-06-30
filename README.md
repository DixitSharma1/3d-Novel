# The Story of You & Me 📖💌

An interactive, cinematic "novel" website — a multi-chapter scroll experience with animations, sound, and a final proposal scene. Built as a personal, story-driven web experience rather than a typical webpage.

> ⚠️ This project contains personal content. Edit the text, names, and email address in the files before deploying your own copy.

## ✨ Features

- Cinematic scroll-driven chapters with GSAP animations
- Typewriter text reveals, paper-unfold transitions, and letterbox effects
- Ambient audio (rain, thunder, piano) with on-page audio controls
- Interactive question flow (`q1`, `q2`, `q3`) leading to a final proposal scene
- "YES" and "NO" outcomes, each with their own animated scene
- Every answer along the way is emailed to you automatically via [FormSubmit](https://formsubmit.co/) — no backend required
- Offline support via a Service Worker (`sw.js`) that caches static assets
- Fully responsive (mobile, tablet, desktop)

## 🗂️ Project Structure

```
Novel/
├── index.html              # Main page — all chapters/scenes live here
├── sw.js                    # Service worker (offline caching)
├── css/
│   ├── style.css            # Base styles
│   ├── animations.css       # Keyframes & transition animations
│   ├── cinematic.css        # Letterbox bars, scene transitions
│   ├── enhancements.css     # Love meter, chapter tracker, extras
│   ├── premium.css          # Polished visual details
│   └── responsive.css       # Mobile/tablet breakpoints
├── js/
│   ├── main.js               # Core flow: intro → questions → opening
│   ├── proposal.js           # Final proposal scene + email submission
│   ├── scenes.js             # Chapter scene logic
│   ├── enhancements.js       # Love meter, constellation tracker, etc.
│   ├── cinematic.js          # Cinematic transition effects
│   ├── particles.js / rain.js # Background visual effects
│   ├── audio.js              # Ambient audio controls
│   ├── cursor.js             # Custom cursor effects
│   ├── perf-core.js          # Scroll/performance helpers
│   └── sw-register.js        # Registers the service worker
└── assets/
    ├── audio/                # rain, thunder, piano tracks
    ├── images/                # backgrounds, textures, icons
    └── fonts/
```

## 📧 Email Notifications (FormSubmit)

Every answer the visitor gives (Q1, Q2, Q3, and the final YES/NO) is sent to your inbox via FormSubmit's AJAX endpoint — no server or API key needed.

To use it for yourself:

1. Open `js/main.js` and `js/proposal.js`.
2. Replace every occurrence of `dixitkhanda@gmail.com` with **your own email address**.
3. The first time someone submits a response, FormSubmit will send **you** a one-time confirmation email — click the link inside it to activate the endpoint. Until you confirm, submissions won't be delivered.
4. (Optional) You can also update the email in the hidden form in `index.html` (`#proposal-form`, `action="https://formsubmit.co/ajax/..."`).

## 🚀 Deploying on GitHub Pages

This is a fully static site, so GitHub Pages works out of the box.

1. **Create a new repository** on GitHub (e.g. `the-story-of-you-and-me`).
2. **Push this project** to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In your repository, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, select **Deploy from a branch**.
5. Choose the **`main`** branch and **`/ (root)`** folder, then click **Save**.
6. After a minute or two, your site will be live at:
   ```
   https://<your-username>.github.io/<your-repo>/
   ```

> If you placed the project inside a `Novel/` subfolder rather than at the repo root, either move all files to the repo root, or set GitHub Pages to serve from that folder (GitHub Pages only supports `/ (root)` or `/docs`, so renaming/moving to root is usually simplest).

## 🧪 Running Locally

Because the site uses a Service Worker and `fetch`, it should be served over `http://` (not opened directly as a `file://` path). Any simple static server works:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then open `http://localhost:8000` in your browser.

## 🛠️ Customizing

- **Text & chapters**: edit the relevant sections in `index.html`.
- **Names/signature**: search `index.html` for the signature and chapter text and replace with your own.
- **Colors/fonts**: tweak `css/style.css` and `css/premium.css`.
- **Audio tracks**: replace the files in `assets/audio/` (keep the same filenames, or update the references in `js/audio.js`).
- **Email recipient**: see the [Email Notifications](#-email-notifications-formsubmit) section above.

## 📄 License

This is a personal project intended for private, non-commercial use. See the [LICENSE](LICENSE) file for full terms. Feel free to fork and adapt it for your own story, but please don't redistribute or use it commercially without permission.

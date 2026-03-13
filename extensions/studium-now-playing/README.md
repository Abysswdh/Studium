**Studium Now Playing Bridge (Chrome Extension)**

This extension lets the Studium web app show/control what's playing in:
- Spotify Web Player (`open.spotify.com`)
- YouTube Music (`music.youtube.com`)

It reports **title/artist/play state/volume** and supports **prev / play-pause / next / volume** by clicking the site's player controls.

## Install (Chrome)
1) Open `chrome://extensions`
2) Enable **Developer mode**
3) Click **Load unpacked**
4) Select this folder: `extensions/studium-now-playing`

## Use
1) Open Spotify Web Player or YouTube Music in a tab and start playback.
2) Open Studium in another tab (`localhost` or your `*.vercel.app` deployment).
3) The **NOW PLAYING** widget appears in the bottom HUD area.

## Notes / Limitations
- This does **not** work for the native Spotify app, only the **web player** tab.
- If you use a custom domain (not `*.vercel.app`), add it to `host_permissions` + `content_scripts.matches`.


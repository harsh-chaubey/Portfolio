# Harsh Kumar Chaubey — Portfolio Website

Futuristic, premium personal portfolio for **Harsh Kumar Chaubey**
(Computer Science Undergraduate | AI/ML | Full-Stack Development).
Built with **Python + Flask**, HTML5, CSS3, and vanilla JavaScript.
No heavy dependencies.

## Project structure

```text
.
├── app.py
├── requirements.txt
├── README.md
├── static/
│   ├── css/style.css
│   ├── js/script.js
│   ├── images/image.png   # portrait (supplied by owner)
│   └── files/             # optional: put resume.pdf here
└── templates/
    ├── base.html
    └── index.html
```

## Run locally

Requires Python 3.10+.

```bash
cd /Users/harshchaubey/Portfolio
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# optional (dev defaults are safe for local use)
export SECRET_KEY="change-me"
export PORT=5000
export FLASK_DEBUG=1

python app.py
# or: flask --app app run --debug
```

Then open <http://127.0.0.1:5000>.

Health check: <http://127.0.0.1:5000/healthz>

## Social + live GitHub integration

- GitHub (`https://github.com/harsh-chaubey`) and LinkedIn
  (`https://linkedin.com/in/harshkumarchaubey`) appear as icons in the
  navbar, as buttons in the hero and contact sections, and as social
  icons in the footer. All open in a new tab with
  `rel="noopener noreferrer"`.
- The **Open Source / Live from GitHub** section fetches public profile
  data + top repositories live through the Flask proxy
  `GET /api/github` (cached 5 min, fork-filtered, top 6 by stars). It
  shows loading skeletons while fetching and an error card with retry
  + direct-profile fallback if GitHub is unreachable.
- LinkedIn is link-only by design — no scraping, no fabricated data.
- Optional env vars: `GITHUB_USERNAME` (default `harsh-chaubey`),
  `GITHUB_TOKEN` (raises API rate limit), `GITHUB_CACHE_TTL` (seconds).

## Certificates

- 13 files live in `static/images/certificates/` (original filenames kept).
- The Credentials section shows 13 cards in the existing design; every
  card has its own **View Certificate** button opening that certificate
  in the modal viewer (close button, click-outside + `Escape` to close,
  focus trap + focus restore, zoom for images, **Open full size** link).
- Several supplied `.png` files are actually PDF data (Deloitte, Kodacy,
  IndiaAI, BOORD, Skill India, Apna Collage, Linkedin Learning, Forage),
  so files are served via `GET /certificates/<filename>`, which sniffs
  magic bytes for the correct MIME type and renders PDFs in the embedded
  viewer instead of a broken image.
- Certificate responses allow same-origin framing (`SAMEORIGIN`) so PDF
  previews render inside the modal; all other pages stay `DENY`.
- `GET /api/certificates` lists all 13 certificates with their URLs,
  real MIME types, and per-file `ok` status — use it to verify any
  deployment: `curl https://<app>.onrender.com/api/certificates`.
  If any item reports `"ok": false` after a deploy, the Render service
  is running an older commit: Dashboard -> service -> Manual Deploy ->
  Clear build cache & deploy, then hard-refresh the browser
  (Ctrl/Cmd+Shift+R) to drop cached failed responses.
- Each Experience & Training card has a **View Certificate** button that
  opens a modal viewer on the same page: close button, click-outside and
  `Escape` to close, focus trap + focus restore, zoom controls for
  images (`+`/`-`/`0` shortcuts), and an **Open full size** link.
- Files are served via `GET /certificates/<filename>`, which sniffs
  content magic bytes for the correct MIME type (one supplied file is
  PDF data with a `.png` extension, so it renders in an embedded PDF
  viewer instead of a broken image).

## Contact form behaviour (honest by design)

The contact form `POST`s to `/contact` where Flask validates
(name ≥ 2 chars, valid email, message ≥ 10 chars, 2000-char cap),
sanitizes input, and appends it to `instance/contact_messages.jsonl`
(local only, git-ignored). The success message explicitly says the
note was **saved locally** and asks the sender to also email
`harshchaubey2123@gmail.com` for a guaranteed reply. No fake
"email sent" claims.

To wire real email delivery later, add an SMTP/API call inside the
`contact()` view in `app.py` and update this README + the success copy.

## Customisation

- Portrait: replace `static/images/image.png` (keep the filename).
- Resume (optional): drop your PDF at `static/files/resume.pdf` and
  uncomment the "View Resume" buttons in `templates/index.html`.
- Secrets: never commit real keys; use environment variables
  (`SECRET_KEY`, `PORT`, `FLASK_DEBUG`).

## Deploy notes

- `requirements.txt` contains only Flask + certifi; works on Render / Railway /
  Fly / any WSGI host with `gunicorn app:app`.
- `instance/` is created at runtime for local message storage.
# Portfolio

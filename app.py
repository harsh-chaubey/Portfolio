"""Harsh Kumar Chaubey — Portfolio website (Flask)."""
from __future__ import annotations

import html
import json
import os
import re
import ssl
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, flash, jsonify, redirect, render_template, request, send_file, url_for

BASE_DIR = Path(__file__).resolve().parent
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
GITHUB_USERNAME = os.environ.get("GITHUB_USERNAME", "harsh-chaubey")
_GITHUB_CACHE: dict[str, object] = {"at": 0.0, "payload": None}
GITHUB_CACHE_TTL = int(os.environ.get("GITHUB_CACHE_TTL", "300"))


def _ssl_context() -> ssl.SSLContext:
    """SSL context using certifi's CA bundle when available."""
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def _github_fetch(url: str) -> object:
    """GET JSON from GitHub API with short timeout + optional token."""
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "harsh-portfolio/1.0",
            **(
                {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"}
                if os.environ.get("GITHUB_TOKEN")
                else {}
            ),
        },
    )
    with urllib.request.urlopen(req, timeout=8, context=_ssl_context()) as resp:  # noqa: S310 (trusted api.github.com)
        return json.loads(resp.read().decode("utf-8"))


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")
    app.config["MAX_CONTENT_LENGTH"] = 256 * 1024  # 256 KB form payload cap

    @app.context_processor
    def inject_globals():
        return {
            "current_year": datetime.now(timezone.utc).year,
            "profile": {
                "name": "Harsh Kumar Chaubey",
                "email": "harshchaubey2123@gmail.com",
                "location": "Garhwa, Jharkhand, India",
                "linkedin": "https://linkedin.com/in/harshkumarchaubey",
                "github": "https://github.com/harsh-chaubey",
            },
        }

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Certificates are previewed in a same-origin <iframe> in the
        # certificate viewer modal, so framing by our own pages must be
        # allowed for them (a global DENY renders PDF previews as a blank
        # box). Everything else stays DENY.
        if request.path.startswith("/certificates/"):
            response.headers["X-Frame-Options"] = "SAMEORIGIN"
        else:
            response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    @app.get("/")
    def index():
        # Flash messages from contact form (if any) render on index.
        status = request.args.get("sent")
        return render_template("index.html", form_sent=(status == "1"))

    @app.get("/healthz")
    def healthz():
        return jsonify(status="ok")

    @app.get("/api/github")
    def github_api():
        """Proxy public GitHub profile + top repos (cached, no secrets leaked).

        Returns live data from api.github.com for GITHUB_USERNAME.
        Caches for GITHUB_CACHE_TTL seconds; on upstream failure returns
        the stale cache if available, else a 502 with an `error` message
        so the frontend can show its error state + fallback links.
        """
        now = time.monotonic()
        cached_at = float(_GITHUB_CACHE.get("at") or 0.0)
        if now - cached_at < GITHUB_CACHE_TTL and _GITHUB_CACHE.get("payload") is not None:
            payload = dict(_GITHUB_CACHE["payload"])  # type: ignore[arg-type]
            payload["cached"] = True
            return jsonify(payload)

        try:
            user = _github_fetch(f"https://api.github.com/users/{GITHUB_USERNAME}")
            repos_raw = _github_fetch(
                f"https://api.github.com/users/{GITHUB_USERNAME}/repos"
                "?per_page=100&sort=updated"
            )
        except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
            if _GITHUB_CACHE.get("payload") is not None:
                payload = dict(_GITHUB_CACHE["payload"])  # type: ignore[arg-type]
                payload["cached"] = True
                payload["stale"] = True
                return jsonify(payload)
            return jsonify(ok=False, error=f"GitHub is unreachable right now ({exc})."), 502

        if not isinstance(user, dict) or not isinstance(repos_raw, list):
            return jsonify(ok=False, error="Unexpected response from GitHub."), 502

        repos = []
        for r in repos_raw:
            if not isinstance(r, dict) or r.get("fork"):
                continue
            repos.append(
                {
                    "name": str(r.get("name") or ""),
                    "description": str(r.get("description") or ""),
                    "language": r.get("language"),
                    "stars": int(r.get("stargazers_count") or 0),
                    "forks": int(r.get("forks_count") or 0),
                    "url": str(r.get("html_url") or ""),
                    "homepage": str(r.get("homepage") or ""),
                    "updated_at": str(r.get("updated_at") or ""),
                }
            )
        repos.sort(key=lambda r: (-r["stars"], r["name"].lower()))
        repos = repos[:6]

        payload = {
            "ok": True,
            "cached": False,
            "profile": {
                "login": str(user.get("login") or GITHUB_USERNAME),
                "name": user.get("name"),
                "bio": user.get("bio"),
                "avatar_url": str(user.get("avatar_url") or ""),
                "html_url": str(user.get("html_url") or f"https://github.com/{GITHUB_USERNAME}"),
                "public_repos": int(user.get("public_repos") or 0),
                "followers": int(user.get("followers") or 0),
                "following": int(user.get("following") or 0),
            },
            "repos": repos,
        }
        _GITHUB_CACHE["at"] = now
        _GITHUB_CACHE["payload"] = payload
        return jsonify(payload)

    @app.get("/certificates/<path:filename>")
    def certificate_file(filename: str):
        """Serve certificate assets with content-sniffed MIME types.

        One supplied file (Kodacy Certificate.png) is PDF data despite its
        .png extension, so we sniff magic bytes instead of trusting the
        extension — otherwise browsers would show a broken image.
        """
        cert_dir = (BASE_DIR / "static" / "images" / "certificates").resolve()
        target = (cert_dir / filename).resolve()
        if cert_dir not in target.parents or not target.is_file():
            return jsonify(ok=False, error="Certificate not found."), 404
        with open(target, "rb") as f:
            magic = f.read(5)
        if magic.startswith(b"%PDF-"):
            mimetype = "application/pdf"
        elif magic.startswith(b"\x89PNG"):
            mimetype = "image/png"
        elif magic.startswith(b"\xff\xd8\xff"):
            mimetype = "image/jpeg"
        else:
            mimetype = "application/octet-stream"
        return send_file(target, mimetype=mimetype)

    @app.post("/contact")
    def contact():
        """Honest local-only contact flow.

        There is no email service configured, so we validate + sanitize
        on the server, store the message locally (instance/ folder, which
        is git-ignored), and tell the user exactly that. We never claim
        an email was sent. For guaranteed delivery the page also offers
        a direct mailto: CTA.
        """
        wants_json = "application/json" in (request.accept_mimetypes.best or "")
        if request.is_json:
            payload = request.get_json(silent=True) or {}
            name = str(payload.get("name", ""))
            email = str(payload.get("email", ""))
            message = str(payload.get("message", ""))
        else:
            name = request.form.get("name", "")
            email = request.form.get("email", "")
            message = request.form.get("message", "")

        name = name.strip()[:100]
        email = email.strip()[:254]
        message = message.strip()[:2000]

        errors: dict[str, str] = {}
        if len(name) < 2:
            errors["name"] = "Please enter your name."
        if not EMAIL_RE.match(email):
            errors["email"] = "Please enter a valid email address."
        if len(message) < 10:
            errors["message"] = "Please write a message (10+ characters)."

        if errors:
            if wants_json or request.is_json:
                return jsonify(ok=False, errors=errors), 400
            for field, msg in errors.items():
                flash(f"{field.capitalize()}: {msg}", "error")
            return redirect(url_for("index") + "#contact", 303)

        # Sanitize for storage/display; never render raw user input unescaped
        # (Jinja auto-escapes by default, this is defence in depth).
        safe = {
            "name": html.escape(name, quote=True),
            "email": html.escape(email, quote=True),
            "message": html.escape(message, quote=True),
            "received_at": datetime.now(timezone.utc).isoformat(),
            "ip": html.escape(request.headers.get("X-Forwarded-For", request.remote_addr or "")),
        }

        try:
            store = BASE_DIR / "instance"
            store.mkdir(exist_ok=True)
            with open(store / "contact_messages.jsonl", "a", encoding="utf-8") as f:
                import json

                f.write(json.dumps(safe) + "\n")
        except OSError:
            if wants_json or request.is_json:
                return jsonify(ok=False, errors={"server": "Could not save message."}), 500
            flash("Could not save your message. Please email directly.", "error")
            return redirect(url_for("index") + "#contact", 303)

        note = (
            "Thanks! Your message was saved locally on this demo server. "
            "For a guaranteed reply, please also email harshchaubey2123@gmail.com directly."
        )
        if wants_json or request.is_json:
            return jsonify(ok=True, note=note), 200
        flash(note, "success")
        return redirect(url_for("index", sent="1") + "#contact", 303)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="127.0.0.1", port=port, debug=debug)

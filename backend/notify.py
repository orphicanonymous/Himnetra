"""Alert delivery: e-mail (SMTP) and SMS (Twilio REST). Works in DRY-RUN mode when nothing is configured.
Env: SMTP_HOST, SMTP_PORT(465), SMTP_USER, SMTP_PASS, MAIL_FROM | TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM"""
import math, os, re, smtplib, ssl
from email.message import EmailMessage

def haversine_km(lat1, lng1, lat2, lng2):
    p = math.pi / 180
    a = math.sin((lat2-lat1)*p/2)**2 + math.cos(lat1*p)*math.cos(lat2*p)*math.sin((lng2-lng1)*p/2)**2
    return 12742 * math.asin(math.sqrt(a))

def email_configured(): return all(os.environ.get(k) for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASS"))
def sms_configured():   return all(os.environ.get(k) for k in ("TWILIO_SID", "TWILIO_TOKEN", "TWILIO_FROM"))

def _safe_provider_message(message: object, *phone_numbers: str) -> str | None:
    if not isinstance(message, str) or not message.strip():
        return None
    for phone in phone_numbers:
        if phone:
            message = message.replace(phone, "[phone redacted]")
    message = re.sub(r"(?<!\w)\+?\d[\d\s().-]{6,}\d(?!\w)", "[phone redacted]", message)
    message = " ".join(message.split())[:180]
    return message or None

def send_email(to: str, subject: str, body: str) -> str:
    if not email_configured(): return "dry-run (SMTP not configured)"
    msg = EmailMessage(); msg.set_content(body)
    msg["Subject"], msg["From"], msg["To"] = subject, os.environ.get("MAIL_FROM", os.environ["SMTP_USER"]), to
    with smtplib.SMTP_SSL(os.environ["SMTP_HOST"], int(os.environ.get("SMTP_PORT", 465)), context=ssl.create_default_context()) as s:
        s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"]); s.send_message(msg)
    return "sent"

def send_sms(to: str, body: str) -> str:
    if not sms_configured(): return "dry-run (Twilio not configured)"
    import httpx
    sid = os.environ["TWILIO_SID"]
    try:
        r = httpx.post(f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                       auth=(sid, os.environ["TWILIO_TOKEN"]),
                       data={"To": to, "From": os.environ["TWILIO_FROM"], "Body": body[:300]}, timeout=15)
    except httpx.RequestError as exc:
        return f"failed: Twilio request error ({type(exc).__name__})"
    if r.status_code < 300:
        return "sent"

    try:
        error = r.json()
    except ValueError:
        error = {}
    code = error.get("code") if isinstance(error, dict) else None
    detail = _safe_provider_message(error.get("message"), to, os.environ["TWILIO_FROM"]) if isinstance(error, dict) else None
    if isinstance(code, int) and code > 0:
        result = f"failed HTTP {r.status_code} (Twilio {code})"
    elif isinstance(code, str) and code.strip() and code.strip() != "0":
        result = f"failed HTTP {r.status_code} (Twilio {code.strip()})"
    else:
        content_type = r.headers.get("content-type", "unknown").split(";")[0]
        request_id = r.headers.get("Twilio-Request-Id") or r.headers.get("X-Twilio-Request-Id")
        result = f"failed HTTP {r.status_code} (Twilio error code unavailable; response type {content_type}"
        if request_id and re.fullmatch(r"[A-Za-z0-9._:-]{1,80}", request_id):
            result += f"; request ID {request_id}"
        result += ")"
    return f"{result}: {detail}" if detail else result

def affected_subscribers(lake: dict, subs: list[dict], radius_km: float = 30.0):
    """Geofence = circle around the lake until flood polygons exist (then switch to point-in-polygon)."""
    c = lake["coordinates"]
    return [s for s in subs if s.get("lat") is not None and
            haversine_km(c["lat"], c["lng"], s["lat"], s["lng"]) <= radius_km]

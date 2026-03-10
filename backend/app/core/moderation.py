import logging
from enum import Enum
from ..config import settings

logger = logging.getLogger(__name__)

BLOCKLIST = {
    "nsfw", "nude", "naked", "porn", "pornographic", "xxx", "explicit",
    "hentai", "gore", "torture", "child abuse", "underage", "pedophil",
    "sexual", "genitalia", "intercourse",
}


class ModerationFlag(str, Enum):
    CLEAN = "CLEAN"
    FLAGGED = "FLAGGED"
    BLOCKED = "BLOCKED"
    PENDING_REVIEW = "PENDING_REVIEW"


def moderate_prompt(text: str) -> tuple[ModerationFlag, str]:
    """
    Check prompt text against blocklist and optionally Gemini safety.
    Returns (flag, reason).
    """
    if not settings.MODERATION_ENABLED:
        return ModerationFlag.CLEAN, ""

    text_lower = text.lower()

    # Stage 1: Keyword blocklist (instant)
    for word in BLOCKLIST:
        if word in text_lower:
            return ModerationFlag.BLOCKED, f"Blocked keyword detected: {word}"

    # Stage 2: Gemini safety check (if API key configured)
    if settings.GEMINI_API_KEY:
        try:
            flag, reason = _gemini_text_check(text)
            return flag, reason
        except Exception as e:
            logger.warning(f"Gemini moderation failed, defaulting to CLEAN: {e}")
            return ModerationFlag.CLEAN, ""

    return ModerationFlag.CLEAN, ""


def _gemini_text_check(text: str) -> tuple[ModerationFlag, str]:
    """Use Gemini to classify prompt content safety."""
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")

    response = model.generate_content(
        f"""Analyze the following text prompt for an AI video generation tool.
Classify it as one of: CLEAN, FLAGGED, BLOCKED.

- CLEAN: Safe, appropriate content
- FLAGGED: Ambiguous or borderline content that needs human review
- BLOCKED: Clearly inappropriate (sexual, violent, hateful, exploitative content)

Respond with ONLY the classification word and a brief reason.
Format: CLASSIFICATION|reason

Text: "{text}"
""",
        safety_settings={
            "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
            "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
            "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
            "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
        },
    )

    result = response.text.strip()
    parts = result.split("|", 1)
    classification = parts[0].strip().upper()
    reason = parts[1].strip() if len(parts) > 1 else ""

    flag_map = {
        "CLEAN": ModerationFlag.CLEAN,
        "FLAGGED": ModerationFlag.FLAGGED,
        "BLOCKED": ModerationFlag.BLOCKED,
    }

    return flag_map.get(classification, ModerationFlag.FLAGGED), reason


async def moderate_video_frame(video_url: str) -> tuple[ModerationFlag, str]:
    """
    Extract a keyframe from the video and analyze with Gemini Vision.
    Placeholder for Phase 2 — requires Pillow + video frame extraction.
    """
    if not settings.MODERATION_ENABLED or not settings.GEMINI_API_KEY:
        return ModerationFlag.CLEAN, ""

    # TODO: Implement video frame extraction and Gemini Vision analysis
    # For now, return CLEAN as the prompt was already checked
    return ModerationFlag.CLEAN, ""

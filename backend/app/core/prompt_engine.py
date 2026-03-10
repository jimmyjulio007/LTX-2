import logging
from ..config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a cinematic prompt engineer for an AI video generation platform (LTX-VIDEO).
Given a simple user description, enhance it into a detailed cinematic prompt.

Include relevant details from: camera movement (dolly, pan, tracking shot), lighting (golden hour, neon, volumetric),
atmosphere (foggy, rain, dust particles), color grading (teal-orange, desaturated, warm), lens type (35mm, anamorphic, macro),
and mood (nostalgic, epic, intimate).

Rules:
- Keep the enhanced prompt under 200 words
- Do not add NSFW, violent, or inappropriate content
- Maintain the original intent and subject matter
- Write in the same language as the input
- Output ONLY the enhanced prompt, nothing else"""


async def enhance_prompt(simple_prompt: str, style: str | None = None) -> str:
    """Send simple prompt to Gemini, return cinematic-enhanced version."""
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, returning original prompt")
        return simple_prompt

    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")

    user_message = f"Enhance this prompt: {simple_prompt}"
    if style:
        user_message += f"\nStyle hint: {style}"

    response = model.generate_content([SYSTEM_PROMPT, user_message])
    return response.text.strip()

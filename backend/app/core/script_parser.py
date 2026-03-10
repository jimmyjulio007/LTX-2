import logging
import json
from typing import List, Dict
import httpx
from ..config import settings

logger = logging.getLogger(__name__)


class ScriptParser:
    """Parses scripts into scenes using Gemini AI."""

    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    async def parse_script(self, text: str, locale: str = "en") -> List[Dict]:
        """Parse a script/text into individual scenes."""
        if settings.GEMINI_API_KEY:
            try:
                return await self._parse_with_gemini(text, locale)
            except Exception as e:
                logger.warning(f"Gemini script parsing failed: {e}")

        return self._parse_fallback(text)

    async def _parse_with_gemini(self, text: str, locale: str) -> List[Dict]:
        lang = "French" if locale == "fr" else "English"
        prompt = f"""You are a film director. Break down this script into individual scenes for AI video generation.

Script:
{text}

For each scene, provide a JSON object with:
- "scene_number": integer
- "description": brief scene description in {lang}
- "camera_angle": suggested camera angle (e.g., "wide shot", "close-up", "tracking")
- "mood": the mood/atmosphere (e.g., "dramatic", "peaceful", "energetic")
- "duration": suggested duration in seconds (2-10)
- "prompt_suggestion": a detailed visual prompt for AI video generation in English

Return ONLY a JSON array, no other text."""

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.GEMINI_URL}?key={settings.GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            raw = raw.rsplit("```", 1)[0]

        return json.loads(raw)

    def _parse_fallback(self, text: str) -> List[Dict]:
        """Simple paragraph-based scene splitting."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        scenes = []
        for i, para in enumerate(paragraphs, 1):
            scenes.append({
                "scene_number": i,
                "description": para[:200],
                "camera_angle": "wide shot",
                "mood": "cinematic",
                "duration": 5,
                "prompt_suggestion": f"Cinematic scene: {para[:150]}. Professional lighting, 4k quality.",
            })
        return scenes or [{"scene_number": 1, "description": text[:200], "camera_angle": "wide shot", "mood": "cinematic", "duration": 5, "prompt_suggestion": f"Cinematic scene: {text[:150]}."}]


script_parser = ScriptParser()

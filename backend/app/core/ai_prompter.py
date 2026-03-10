import logging
import json
from typing import List, Dict, Optional
import httpx
from ..config import settings

logger = logging.getLogger(__name__)


class AIPrompter:
    """
    Service to generate creative video prompts using Google Gemini API.
    Falls back to template-based generation if API is unavailable.
    """

    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    async def generate_ad_scripts(
        self,
        description: str,
        platform: str = "tiktok",
        count: int = 3,
        product_data: Optional[Dict] = None,
    ) -> List[Dict]:
        """
        Generates N creative ad scripts for a product.
        Uses Gemini API if available, falls back to templates.
        """
        logger.info(f"Generating {count} scripts for: {description[:50]}...")

        if settings.GEMINI_API_KEY:
            try:
                return await self._generate_with_gemini(description, platform, count, product_data)
            except Exception as e:
                logger.warning(f"Gemini API failed, falling back to templates: {e}")

        return self._generate_fallback(description, platform, count)

    async def _generate_with_gemini(
        self,
        description: str,
        platform: str,
        count: int,
        product_data: Optional[Dict] = None,
    ) -> List[Dict]:
        """Generate scripts using Google Gemini API."""
        product_context = ""
        if product_data:
            product_context = f"""
Product details:
- Title: {product_data.get('title', 'N/A')}
- Description: {product_data.get('description', 'N/A')}
- Price: {product_data.get('price', 'N/A')}
- URL: {product_data.get('url', 'N/A')}
"""

        dimensions = self._get_platform_dimensions(platform)

        prompt = f"""You are a creative director for viral video ads. Generate exactly {count} unique video ad scripts.

{product_context}
Product description: {description}
Target platform: {platform}
Video dimensions: {dimensions['width']}x{dimensions['height']}

For each variation, provide a JSON object with:
- "name": a creative variation name
- "prompt": a detailed visual description for AI video generation (cinematic, specific camera angles, lighting, mood)
- "negative_prompt": things to avoid in the video
- "width": {dimensions['width']}
- "height": {dimensions['height']}

Return ONLY a JSON array of {count} objects, no other text."""

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.GEMINI_URL}?key={settings.GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.9, "maxOutputTokens": 2048},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]

        # Extract JSON from response (handle markdown code blocks)
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]

        variations = json.loads(text)
        # Ensure correct dimensions
        for v in variations:
            v["width"] = dimensions["width"]
            v["height"] = dimensions["height"]
            if "negative_prompt" not in v:
                v["negative_prompt"] = "low quality, blurry, distorted, text overlay, watermark"

        return variations[:count]

    def _generate_fallback(self, description: str, platform: str, count: int) -> List[Dict]:
        """Template-based fallback when Gemini is unavailable."""
        dimensions = self._get_platform_dimensions(platform)
        bases = [
            "Cinematic close-up, high quality, 4k, professional lighting.",
            "Dynamic action shot, fast paced, vibrant colors, bokeh.",
            "Minimalist aesthetic, clean background, soft shadows, sharp focus.",
            "Dramatic wide angle, epic scale, golden hour lighting, cinematic grade.",
            "Intimate macro shot, shallow depth of field, warm tones, detailed textures.",
        ]

        variations = []
        for i in range(count):
            base = bases[i % len(bases)]
            prompt = f"{base} A creative ad for {description}. Style: {platform} viral video."
            variations.append({
                "name": f"Variation {i + 1}",
                "prompt": prompt,
                "negative_prompt": "low quality, blurry, distorted, text overlay, watermark",
                "width": dimensions["width"],
                "height": dimensions["height"],
            })

        return variations

    def _get_platform_dimensions(self, platform: str) -> Dict[str, int]:
        """Get optimal video dimensions for each platform."""
        platforms = {
            "tiktok": {"width": 720, "height": 1280},
            "instagram_reels": {"width": 720, "height": 1280},
            "instagram_feed": {"width": 1080, "height": 1080},
            "youtube_shorts": {"width": 720, "height": 1280},
            "youtube": {"width": 1280, "height": 720},
            "facebook": {"width": 1280, "height": 720},
            "twitter": {"width": 1280, "height": 720},
        }
        return platforms.get(platform, {"width": 1280, "height": 720})


ai_prompter = AIPrompter()

import logging
import httpx
import re
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class ProductScraper:
    """Scrapes product info from a URL using meta tags and OG data."""

    async def scrape_product(self, url: str) -> Dict:
        """
        Scrape product information from a URL.
        Returns: {title, description, images[], price}
        """
        result = {
            "title": "",
            "description": "",
            "images": [],
            "price": None,
            "url": url,
        }

        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
                resp = await client.get(url, headers={
                    "User-Agent": "Mozilla/5.0 (compatible; LTX-Bot/1.0)"
                })
                html = resp.text

            # Extract Open Graph meta tags
            og_title = self._extract_meta(html, "og:title")
            og_desc = self._extract_meta(html, "og:description")
            og_image = self._extract_meta(html, "og:image")

            # Extract standard meta tags as fallback
            meta_title = self._extract_meta(html, "title", property_attr="name")
            meta_desc = self._extract_meta(html, "description", property_attr="name")

            # Extract <title> tag
            title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
            page_title = title_match.group(1).strip() if title_match else ""

            result["title"] = og_title or meta_title or page_title or "Product"
            result["description"] = og_desc or meta_desc or ""

            if og_image:
                result["images"].append(og_image)

            # Try to find additional product images
            img_matches = re.findall(r'<meta\s+(?:property|name)="(?:og:image|product:image)"[^>]*content="([^"]+)"', html, re.IGNORECASE)
            for img_url in img_matches:
                if img_url not in result["images"]:
                    result["images"].append(img_url)

            # Extract price from common patterns
            price_meta = self._extract_meta(html, "product:price:amount", property_attr="property")
            if price_meta:
                result["price"] = price_meta
            else:
                price_match = re.search(r'[\$€£]\s*(\d+(?:[.,]\d{2})?)', html)
                if price_match:
                    result["price"] = price_match.group(0)

        except Exception as e:
            logger.warning(f"Failed to scrape product URL {url}: {e}")
            result["title"] = "Product"
            result["description"] = f"Product from {url}"

        return result

    def _extract_meta(self, html: str, name: str, property_attr: str = "property") -> Optional[str]:
        pattern = rf'<meta\s+{property_attr}="{re.escape(name)}"[^>]*content="([^"]*)"'
        match = re.search(pattern, html, re.IGNORECASE)
        if not match:
            # Try reversed attribute order
            pattern = rf'<meta\s+content="([^"]*)"[^>]*{property_attr}="{re.escape(name)}"'
            match = re.search(pattern, html, re.IGNORECASE)
        return match.group(1).strip() if match else None


product_scraper = ProductScraper()

import logging
from ..config import settings

logger = logging.getLogger(__name__)


async def send_video_complete(
    user_email: str,
    user_name: str,
    video_title: str | None,
    thumbnail_url: str | None,
    video_url: str,
    locale: str = "en",
):
    """Send email notification when video generation completes."""
    title = video_title or "Your Video"
    subject = f"Your video '{title}' is ready!" if locale == "en" else f"Votre vidéo '{title}' est prête !"

    # HTML email template
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: white; padding: 40px 30px; border-radius: 16px;">
        <h1 style="color: #eab308; margin-bottom: 8px;">LTX-VIDEO</h1>
        <h2 style="color: white; margin-bottom: 20px;">{subject}</h2>
        {"<img src='" + thumbnail_url + "' style='width: 100%; border-radius: 12px; margin-bottom: 20px;' />" if thumbnail_url else ""}
        <p style="color: #94a3b8;">Hi {user_name}, your video has been generated successfully.</p>
        <a href="{video_url}" style="display: inline-block; background: #eab308; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            View Video
        </a>
    </div>
    """

    logger.info(f"Video completion email sent to {user_email}: {subject}")
    # TODO: Integrate with Resend or SMTP transporter
    # For now, just log the email


async def send_video_failed(
    user_email: str,
    user_name: str,
    video_title: str | None,
    locale: str = "en",
):
    """Send email notification when video generation fails."""
    title = video_title or "Your Video"
    subject = f"Video '{title}' generation failed" if locale == "en" else f"La génération de la vidéo '{title}' a échoué"

    logger.info(f"Video failure email sent to {user_email}: {subject}")
    # TODO: Integrate with Resend or SMTP transporter

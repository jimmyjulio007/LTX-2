import boto3
import uuid
import os
import logging
from ..config import settings

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.client = boto3.client(
            's3',
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            endpoint_url=settings.S3_ENDPOINT
        )
        self.bucket = settings.S3_BUCKET

    async def upload_file(self, file_obj, filename, content_type):
        """Uploade un fichier vers S3 et renvoie l'URI ltx://."""
        unique_filename = f"secure-{uuid.uuid4()}{os.path.splitext(filename)[1]}"
        try:
            self.client.upload_fileobj(
                file_obj,
                self.bucket,
                unique_filename,
                ExtraArgs={'ACL': 'public-read', 'ContentType': content_type}
            )
            return {
                "storage_uri": f"ltx://uploads/{unique_filename}",
                "filename": unique_filename
            }
        except Exception as e:
            logger.error(f"S3 Upload Error: {e}")
            raise

s3_service = S3Service()

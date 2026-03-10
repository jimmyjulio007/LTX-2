import redis
import os
import json
import logging

logger = logging.getLogger(__name__)

# REDIS_URL from env or default to local docker
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisClient:
    def __init__(self):
        try:
            self.redis = redis.from_url(REDIS_URL, decode_responses=True)
            logger.info(f"Connected to Redis at {REDIS_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis = None

    def publish(self, channel: str, message: str):
        if self.redis:
            try:
                self.redis.publish(channel, message)
            except Exception as e:
                logger.error(f"Redis Publish Error: {e}")

    def set_job_data(self, job_id, data: dict):
        if self.redis:
            self.redis.set(f"job_meta:{job_id}", json.dumps(data), ex=3600)

    def get_job_data(self, job_id):
        if self.redis:
            data = self.redis.get(f"job_meta:{job_id}")
            return json.loads(data) if data else None
        return None

redis_client = RedisClient()

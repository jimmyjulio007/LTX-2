import os
import runpod
import torch
import boto3
import requests
import uuid
import base64
from PIL import Image as PILImage
from ltx_pipelines.ti2vid_two_stages import TI2VidTwoStagesPipeline
from ltx_pipelines.a2vid_two_stage import A2VidPipelineTwoStage
from ltx_pipelines.retake import RetakePipeline
from ltx_core.quantization import QuantizationPolicy
from ltx_core.model.video_vae import TilingConfig
from ltx_core.components.guiders import MultiModalGuiderParams
from ltx_pipelines.utils.media_io import encode_video

# Configuration
MODELS_ROOT = os.environ.get("MODELS_ROOT", "/models")
CHECKPOINT_PATH = os.path.join(MODELS_ROOT, "ltx-2.3-22b-dev.safetensors")
DISTILLED_LORA_PATH = os.path.join(MODELS_ROOT, "ltx-2.3-22b-distilled-lora-384.safetensors")
UPSAMPLER_PATH = os.path.join(MODELS_ROOT, "ltx-2.3-spatial-upscaler-x2-1.0.safetensors")
GEMMA_ROOT = os.path.join(MODELS_ROOT, "gemma-3-12b-it")

# Backend & Webhook
BACKEND_URL = os.environ.get("BACKEND_URL")
RUNPOD_WEBHOOK_TOKEN = os.environ.get("RUNPOD_WEBHOOK_TOKEN")

# S3 Configuration
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY")
S3_ENDPOINT = os.environ.get("S3_ENDPOINT", "https://s3.amazonaws.com")

s3_client = boto3.client(
    's3',
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    endpoint_url=S3_ENDPOINT
)

q_policy = QuantizationPolicy.fp8_cast()

# Shared settings
pipeline_args = {
    "checkpoint_path": CHECKPOINT_PATH,
    "distilled_lora": [(DISTILLED_LORA_PATH, 1.0, None)],
    "spatial_upsampler_path": UPSAMPLER_PATH,
    "gemma_root": GEMMA_ROOT,
    "loras": [],
    "quantization": q_policy
}

print("Chargement des pipelines LTX-2...")
pipeline_ti2v = TI2VidTwoStagesPipeline(**pipeline_args)
pipeline_a2v = A2VidPipelineTwoStage(**pipeline_args)
pipeline_retake = RetakePipeline(
    checkpoint_path=CHECKPOINT_PATH,
    gemma_root=GEMMA_ROOT,
    loras=[],
    quantization=q_policy
)
print("Pipelines LTX-2 chargés.")

def resolve_uri(uri: str, suffix=".tmp") -> str:
    """Résout une URI (https, data, ltx://) en chemin de fichier local."""
    if not uri: return None
    local_path = f"/tmp/{uuid.uuid4()}{suffix}"
    
    # CASE 1: HTTPS URL
    if uri.startswith("http"):
        print(f"Fetch (HTTPS): {uri}")
        r = requests.get(uri, stream=True, timeout=30)
        r.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192): f.write(chunk)
            
    # CASE 2: Data URI (Base64)
    elif uri.startswith("data:"):
        print("Fetch (Data URI)")
        header, data = uri.split(",", 1)
        with open(local_path, "wb") as f:
            f.write(base64.b64decode(data))
            
    # CASE 3: ltx:// uploads
    elif uri.startswith("ltx://"):
        print(f"Fetch (S3): {uri}")
        filename = uri.replace("ltx://uploads/", "")
        s3_client.download_file(S3_BUCKET, filename, local_path)
        
    return local_path

def send_progress(job_id, progress_percent):
    if not job_id or not RUNPOD_WEBHOOK_TOKEN: return
    try:
        requests.post(
            f"{BACKEND_URL}/jobs/{job_id}/progress",
            params={"progress": progress_percent, "token": RUNPOD_WEBHOOK_TOKEN},
            timeout=5
        )
    except: pass

def handler(job):
    job_input = job['input']
    job_id = job_input.get("job_id")
    job_type = job_input.get("job_type", "text-to-video")
    
    prompt = job_input.get("prompt", "")
    negative_prompt = job_input.get("negative_prompt", "low quality, blurry, distorted")
    seed = job_input.get("seed", 42)
    height = job_input.get("height", 768)
    width = job_input.get("width", 1280)
    num_frames = job_input.get("num_frames", 121)
    frame_rate = job_input.get("frame_rate", 24.0)

    image_uri = job_input.get("image_uri")
    audio_uri = job_input.get("audio_uri")
    video_uri = job_input.get("video_uri")
    
    send_progress(job_id, 10)

    # Inputs processing
    img_path = resolve_uri(image_uri, ".png")
    images = []
    if img_path:
        images = [(PILImage.open(img_path).convert("RGB"), 0)]
        os.remove(img_path)

    try:
        if (job_type == "retake" or job_type == "extend") and video_uri:
            print(f"Mode VIDEO-PROCESSING ({job_type})")
            v_src_path = resolve_uri(video_uri, ".mp4")
            video, audio = pipeline_retake(
                video_path=v_src_path,
                prompt=prompt,
                start_time=job_input.get("start_time", 0.0),
                end_time=job_input.get("end_time", 1.0),
                seed=seed,
                negative_prompt=negative_prompt,
                tiling_config=TilingConfig.default()
            )
            os.remove(v_src_path)
            
        elif job_type == "audio-to-video" and audio_uri:
            print(f"Mode AUDIO-TO-VIDEO")
            a_src_path = resolve_uri(audio_uri, ".wav")
            video, audio = pipeline_a2v(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=seed,
                height=height,
                width=width,
                num_frames=num_frames,
                frame_rate=frame_rate,
                num_inference_steps=30,
                video_guider_params=MultiModalGuiderParams(cfg_scale=3.0),
                images=images,
                audio_path=a_src_path,
                tiling_config=TilingConfig.default()
            )
            os.remove(a_src_path)
            
        else:
            print(f"Mode TEXT/IMAGE-GENERATION")
            video, audio = pipeline_ti2v(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=seed,
                height=height,
                width=width,
                num_frames=num_frames,
                frame_rate=frame_rate,
                num_inference_steps=30,
                video_guider_params=MultiModalGuiderParams(cfg_scale=3.0),
                audio_guider_params=MultiModalGuiderParams(cfg_scale=3.0),
                images=images,
                tiling_config=TilingConfig.default()
            )
            
        send_progress(job_id, 80)

        output_filename = f"{uuid.uuid4()}.mp4"
        local_path = f"/tmp/{output_filename}"
        encode_video(video=video, fps=frame_rate, audio=audio, output_path=local_path)
        
        send_progress(job_id, 95)
        s3_client.upload_file(local_path, S3_BUCKET, output_filename, ExtraArgs={'ACL': 'public-read'})
        video_url = f"{S3_ENDPOINT.rstrip('/')}/{S3_BUCKET}/{output_filename}"
        
        if os.path.exists(local_path): os.remove(local_path)
        return {"video_url": video_url}

    except Exception as e:
        print(f"Generation Error: {e}")
        return {"error": str(e)}

runpod.serverless.start({"handler": handler})

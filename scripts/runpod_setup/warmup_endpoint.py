import requests
import os
import sys

# Charger les variables du .env si présentes
from dotenv import load_dotenv
load_dotenv()

RUNPOD_API_KEY = os.environ.get("RUNPOD_API_KEY")
ENDPOINT_ID = os.environ.get("RUNPOD_ENDPOINT_ID")

def warmup():
    if not RUNPOD_API_KEY or not ENDPOINT_ID:
        print("❌ Erreur: RUNPOD_API_KEY ou RUNPOD_ENDPOINT_ID manquant dans l'environnement.")
        return

    url = f"https://api.runpod.ai/v2/{ENDPOINT_ID}/run"
    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Un job très léger juste pour charger le modèle en VRAM
    payload = {
        "input": {
            "prompt": "warmup",
            "width": 128,
            "height": 128,
            "num_frames": 1,
            "num_inference_steps": 1,
            "job_type": "text-to-video"
        }
    }

    print(f"🔥 Envoi d'un signal de warm-up à l'endpoint {ENDPOINT_ID}...")
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            job_id = response.json().get("id")
            print(f"✅ Signal envoyé ! Job ID: {job_id}")
            print("Le worker va maintenant charger les modèles. Les prochaines requêtes seront plus rapides.")
        else:
            print(f"❌ Erreur API ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"❌ Échec de la connexion: {e}")

if __name__ == "__main__":
    warmup()

import os
from huggingface_hub import snapshot_download

# Configuration
# Note: Sur RunPod, montez votre volume sur /runpod-volume
DEST_DIR = "/runpod-volume"

def download_models():
    print(f"🚀 Démarrage du téléchargement des modèles vers {DEST_DIR}...")
    
    # 1. Pipeline LTX-2.3
    # Note: Remplacez par le repo officiel si nécessaire
    print("📦 Téléchargement de LTX-2.3-22B-Dev...")
    snapshot_download(
        repo_id="Lightricks/LTX-Video-2.3-22B-Dev",
        local_dir=DEST_DIR,
        allow_patterns=["*.safetensors", "config.json", "*.py"]
    )

    # 2. Gemma T5 Text Encoder
    print("📦 Téléchargement de Gemma-3-12B-it...")
    snapshot_download(
        repo_id="google/gemma-3-12b-it",
        local_dir=os.path.join(DEST_DIR, "gemma-3-12b-it")
    )

    print("✅ Téléchargement terminé. Vous pouvez maintenant configurer MODELS_ROOT=/runpod-volume dans votre template Serverless.")

if __name__ == "__main__":
    if not os.path.exists(DEST_DIR):
        print(f"❌ Erreur: Le dossier {DEST_DIR} n'existe pas. Assurez-vous d'avoir monté un volume.")
    else:
        download_models()

# Utiliser une image CUDA performante
FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

# Éviter les questions interactives
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Installer Python et outils système
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    git \
    curl \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Installer uv (gestionnaire ultra-rapide)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers du monorepo
COPY . .

# Installer les dépendances via uv
# --extra xformers pour l'optimisation GPU
RUN uv sync --frozen --extra xformers

# Installer runpod, boto3, requests et pillow (nécessaire pour handler.py)
RUN uv pip install runpod boto3 requests pillow

# S'assurer que les modèles seront dans /models (montage réseau conseillé sur RunPod)
ENV MODELS_ROOT=/models

# Script de lancement
CMD ["uv", "run", "runpod_worker/handler.py"]

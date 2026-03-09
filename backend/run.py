import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()
    # Configuration du serveur
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Lancement de l'API LTX-2 sur http://{host}:{port}")
    print(f"📚 Documentation Swagger : http://{host}:{port}/docs")
    
    uvicorn.run("app.main:app", host=host, port=port, reload=True)

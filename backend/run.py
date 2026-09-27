import uvicorn
import os
from app.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.APP_NAME} on http://127.0.0.1:{settings.PORT}")
    reload_enabled = os.environ.get("RENDER") is None
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=reload_enabled)

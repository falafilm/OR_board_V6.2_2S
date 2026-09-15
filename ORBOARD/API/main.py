from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from API.routers import config, dashboard, system

app = FastAPI(
    title="OR BOARD API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== include routers =====
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])

app.include_router(config.router, prefix="/api", tags=["Config"])

app.include_router(system.router, prefix="/api", tags=["System"])


# =====================================================
# ENTRY POINT (สำคัญมาก สำหรับ PyInstaller)
# =====================================================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        log_level="info"
    )

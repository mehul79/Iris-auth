from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, magic_link
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Iris Authentication API",
    description="API for iris biometric authentication with magic link fallback",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(magic_link.router, prefix="/api/v1/magic_link", tags=["magic_link"])

@app.get("/")
async def root():
    return {"message": "Welcome to Iris Authentication API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
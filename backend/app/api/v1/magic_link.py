from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_magic_link_token, verify_token
from app.db.session import get_db
from app.models.user import User
from app.services.email_service import send_magic_link
from pydantic import BaseModel, EmailStr

router = APIRouter()


class MagicLinkRequest(BaseModel):
    email: EmailStr


@router.post("/request")
async def request_magic_link(
    request: MagicLinkRequest, db: Session = Depends(get_db)
):
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Generate magic link token
    token = create_magic_link_token(request.email)
    
    # Send magic link email
    # TODO: Replace with real email service
    send_magic_link(request.email, token)
    
    return {"message": "Magic link sent to your email"}


@router.get("/verify")
async def verify_magic_link(token: str, db: Session = Depends(get_db)):
    # Verify token
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Generate access token
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
    }
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_token
from app.db.session import get_db
from app.models.user import User
from app.services.iris_service import verify_iris, create_iris_template
from pydantic import BaseModel, EmailStr

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    iris_data: str


class IrisCapture(BaseModel):
    iris_data: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate access token
    access_token = create_access_token(subject=db_user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "email": db_user.email,
    }


@router.post("/capture")
async def capture_iris(
    iris_data: IrisCapture,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    # Verify token
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # TODO: Add legal consent collection for biometric data

    # Create iris template
    try:
        # TODO: Replace with real iris SDK call
        iris_template = create_iris_template(iris_data.iris_data)
        
        # Update user with iris template
        user.iris_template = iris_template
        user.is_verified = True
        db.commit()
        
        return {"message": "Iris captured successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process iris data: {str(e)}",
        )


@router.post("/login")
async def login_with_iris(user_in: UserLogin, db: Session = Depends(get_db)):
    # Get user
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.iris_template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has not registered iris data",
        )

    # Verify iris
    try:
        # TODO: Replace with real iris SDK verification
        is_match = verify_iris(user_in.iris_data, user.iris_template)
        
        if not is_match:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Iris verification failed",
            )
        
        # Generate access token
        access_token = create_access_token(subject=user.id)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify iris: {str(e)}",
        )
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.core.config import settings


# TODO: Replace with proper KMS integration
def get_encryption_key():
    """
    Get or generate an encryption key.
    
    In production, this should use a proper KMS service.
    """
    # Use a fixed salt for development (NEVER do this in production)
    salt = b'iris_auth_salt'
    
    # Derive a key from the secret key
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
    return key


def encrypt_data(data: str) -> str:
    """
    Encrypt data using Fernet symmetric encryption.
    
    Args:
        data: String data to encrypt
        
    Returns:
        Base64 encoded encrypted data
    """
    key = get_encryption_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    return base64.b64encode(encrypted_data).decode()


def decrypt_data(encrypted_data: str) -> str:
    """
    Decrypt data using Fernet symmetric encryption.
    
    Args:
        encrypted_data: Base64 encoded encrypted data
        
    Returns:
        Decrypted string data
    """
    key = get_encryption_key()
    f = Fernet(key)
    decoded_data = base64.b64decode(encrypted_data)
    decrypted_data = f.decrypt(decoded_data)
    return decrypted_data.decode()
import base64
import hashlib
import os
from typing import Tuple

from app.libs.iris_sdk import process_iris_image, compare_iris_templates
from app.services.crypto_service import encrypt_data, decrypt_data


def create_iris_template(iris_data: str) -> str:
    """
    Create an encrypted iris template from the provided iris data.
    
    Args:
        iris_data: Base64 encoded iris image data
        
    Returns:
        Encrypted iris template string
    """
    # TODO: Replace with real iris SDK call
    # For now, we'll create a deterministic template for testing
    try:
        # Decode base64 data
        decoded_data = base64.b64decode(iris_data)
        
        # Create a deterministic template based on the data
        # In a real implementation, this would call the iris SDK
        template = _create_mock_template(decoded_data)
        
        # Encrypt the template before storing
        # TODO: Use KMS for encryption key management
        encrypted_template = encrypt_data(template)
        
        return encrypted_template
    except Exception as e:
        raise Exception(f"Failed to create iris template: {str(e)}")


def verify_iris(iris_data: str, stored_template: str) -> bool:
    """
    Verify if the provided iris data matches the stored template.
    
    Args:
        iris_data: Base64 encoded iris image data
        stored_template: Encrypted iris template from database
        
    Returns:
        True if the iris matches, False otherwise
    """
    # TODO: Replace with real iris SDK call
    try:
        # Decode base64 data
        decoded_data = base64.b64decode(iris_data)
        
        # Create a template from the provided data
        template = _create_mock_template(decoded_data)
        
        # Decrypt the stored template
        decrypted_template = decrypt_data(stored_template)
        
        # Compare templates
        # In a real implementation, this would use the iris SDK
        return template == decrypted_template
    except Exception as e:
        raise Exception(f"Failed to verify iris: {str(e)}")


def _create_mock_template(data: bytes) -> str:
    """
    Create a deterministic mock template for testing purposes.
    
    Args:
        data: Raw iris image data
        
    Returns:
        Mock iris template string
    """
    # Create a deterministic hash of the data
    hash_obj = hashlib.sha256(data)
    return hash_obj.hexdigest()


# Unit tests for iris_service
def test_create_and_verify_iris():
    # Test data
    test_data = base64.b64encode(b"test_iris_data").decode()
    
    # Create template
    template = create_iris_template(test_data)
    
    # Verify with same data
    assert verify_iris(test_data, template) is True
    
    # Verify with different data
    different_data = base64.b64encode(b"different_iris_data").decode()
    assert verify_iris(different_data, template) is False
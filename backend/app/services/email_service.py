import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_magic_link(email: str, token: str) -> bool:
    """
    Send a magic link email to the user.
    
    Args:
        email: User's email address
        token: Magic link token
        
    Returns:
        True if email was sent successfully, False otherwise
    """
    # TODO: Replace with real email service in production
    
    # For development, just print the link
    magic_link = f"http://localhost:3000/login?token={token}"
    print(f"Magic link for {email}: {magic_link}")
    
    # In development mode, don't actually send emails
    if settings.ENVIRONMENT == "development":
        return True
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_SENDER
        msg['To'] = email
        msg['Subject'] = "Your Magic Link for Iris Authentication"
        
        # Create HTML body
        body = f"""
        <html>
        <body>
            <h2>Your Magic Link</h2>
            <p>Click the link below to log in:</p>
            <p><a href="{magic_link}">Log in to Iris Authentication</a></p>
            <p>This link will expire in {settings.MAGIC_LINK_EXPIRE_MINUTES} minutes.</p>
            <p>If you didn't request this link, please ignore this email.</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server and send email
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False
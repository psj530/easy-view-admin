"""이메일 발송 서비스 - Gmail SMTP"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def send_email(to_email: str, subject: str, body_html: str) -> bool:
    """이메일 발송"""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL] SMTP 미설정 - 발송 스킵: {to_email} / {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"PwC Easy View <{settings.SMTP_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

        print(f"[EMAIL] 발송 성공: {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] 발송 실패: {to_email} - {e}")
        return False


def send_welcome_email(to_email: str, user_name: str, temp_password: str) -> bool:
    """신규 사용자 Welcome 이메일"""
    subject = "Easy View 포탈 계정이 생성되었습니다"
    body = f"""
    <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d04a02; padding: 20px 30px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">PwC Digital Finance Portal</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; color: #2d2d2d;">안녕하세요, <strong>{user_name}</strong>님</p>
            <p style="color: #6b7280;">Easy View 포탈에 초대되었습니다.</p>
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; color: #374151;"><strong>로그인 정보</strong></p>
                <p style="margin: 4px 0; color: #6b7280;">이메일: <strong>{to_email}</strong></p>
                <p style="margin: 4px 0; color: #6b7280;">임시 비밀번호: <strong>{temp_password}</strong></p>
            </div>
            <p style="color: #ef4444; font-size: 13px;">* 첫 로그인 후 반드시 비밀번호를 변경해주세요.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">본 메일은 PwC Digital Finance Portal에서 자동 발송되었습니다.</p>
        </div>
    </div>
    """
    return send_email(to_email, subject, body)


def send_permission_change_email(to_email: str, user_name: str, changes: str) -> bool:
    """권한 변경 알림 이메일"""
    subject = "Easy View 포탈 권한이 변경되었습니다"
    body = f"""
    <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d04a02; padding: 20px 30px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">PwC Digital Finance Portal</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; color: #2d2d2d;">안녕하세요, <strong>{user_name}</strong>님</p>
            <p style="color: #6b7280;">회원님의 Easy View 포탈 권한이 변경되었습니다.</p>
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;"><strong>변경 내용</strong></p>
                <p style="margin: 8px 0 0 0; color: #6b7280;">{changes}</p>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">문의사항이 있으시면 관리자에게 연락해주세요.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">본 메일은 PwC Digital Finance Portal에서 자동 발송되었습니다.</p>
        </div>
    </div>
    """
    return send_email(to_email, subject, body)

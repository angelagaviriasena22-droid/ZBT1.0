import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()


def enviar_correo_aprobacion(destinatario: str, nombre: str, nombre_hotel: str):
    remitente = os.getenv("SMTP_CORREO")
    password = os.getenv("SMTP_PASSWORD")

    if not remitente or not password:
        print("ADVERTENCIA: SMTP_CORREO o SMTP_PASSWORD no configurados en .env; omitiendo envío de correo.")
        return

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = f"¡Solicitud aprobada! Ya puedes administrar {nombre_hotel} en Zafiro Bloom Tours"
    mensaje["From"] = f"Zafiro Bloom Tours <{remitente}>"
    mensaje["To"] = destinatario

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0b4f8a; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Zafiro Bloom Tours</h2>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <p>¡Hola <strong>{nombre.strip()}</strong>!</p>
            <p>Nos alegra informarte que tu solicitud para administrar <strong>{nombre_hotel.strip()}</strong> ha sido <span style="color: #15803d; font-weight: bold;">APROBADA</span>.</p>
            <p>Ya puedes iniciar sesión en nuestra plataforma usando tu correo registrado (<strong>{destinatario}</strong>) y tu contraseña para configurar las habitaciones, tarifas y políticas de tu establecimiento.</p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="http://localhost:5173/login" style="background-color: #eab308; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Iniciar sesión en mi panel
                </a>
            </div>
            <p style="font-size: 0.85rem; color: #64748b;">Equipo Zafiro Bloom Tours</p>
        </div>
    </div>
    """

    mensaje.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as servidor:
            servidor.login(remitente, password)
            servidor.sendmail(remitente, destinatario, mensaje.as_string())
        print(f"CORRECTO: Correo de aprobación enviado a {destinatario}")
    except Exception as e:
        print(f"ERROR: No se pudo enviar el correo a {destinatario}: {e}")


def enviar_codigo_verificacion(destinatario: str, nombre: str, codigo: str):
    remitente = os.getenv("SMTP_CORREO")
    password = os.getenv("SMTP_PASSWORD")

    if not remitente or not password:
        raise RuntimeError("Faltan SMTP_CORREO o SMTP_PASSWORD en el archivo .env")

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Código de verificación - Zafiro Bloom Tours"
    mensaje["From"] = f"Zafiro Bloom Tours <{remitente}>"
    mensaje["To"] = destinatario

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px;
                margin: auto; padding: 30px; border-radius: 12px;
                border: 1px solid #e2e8f0; color: #1e293b;">
        <h2 style="text-align:center; color:#0b4f8a;">
            Zafiro Bloom Tours
        </h2>
        <p>Hola <strong>{nombre}</strong>,</p>
        <p>Usa el siguiente código para verificar tu inicio de sesión:</p>
        <div style="text-align:center; margin:30px 0;">
            <span style="font-size:32px; letter-spacing:10px;
                         font-weight:bold; color:#0b4f8a;">
                {codigo}
            </span>
        </div>
        <p>Este código vence en 5 minutos.</p>
        <p>Si no estás intentando iniciar sesión, puedes ignorar este mensaje.</p>
        <p style="color:#64748b;">Equipo Zafiro Bloom Tours</p>
    </div>
    """

    mensaje.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as servidor:
            servidor.login(remitente, password)
            servidor.sendmail(remitente, destinatario, mensaje.as_string())
    except Exception as error:
        raise RuntimeError("No se pudo enviar el código al correo") from error

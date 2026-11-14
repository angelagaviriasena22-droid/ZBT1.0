import { useEffect, useRef } from "react";

import "./BotonGoogle.css";

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

function cargarScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existente = document.getElementById("gsi-script");
    if (existente) {
      existente.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.id = "gsi-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar Google"));
    document.head.appendChild(s);
  });
}

interface Props {
  modo: "ingresar" | "registro";
  onCredencial: (credencial: string) => void;
  onError: (mensaje: string) => void;
}

function BotonGoogle({ modo, onCredencial, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const alCredencial = useRef(onCredencial);
  const alError = useRef(onError);

  useEffect(() => {
    alCredencial.current = onCredencial;
    alError.current = onError;
  });

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;
    const contenedor = ref.current;
    let activo = true;

    cargarScript()
      .then(() => {
        if (!activo) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (r: { credential: string }) => alCredencial.current(r.credential),
        });
        contenedor.innerHTML = "";
        window.google.accounts.id.renderButton(contenedor, {
          theme: "outline",
          size: "large",
          text: modo === "registro" ? "signup_with" : "signin_with",
          shape: "pill",
          width: 320,
          locale: "es",
        });
      })
      .catch(() => alError.current("No se pudo cargar el acceso con Google. Revisa tu conexión."));

    return () => {
      activo = false;
    };
  }, [modo]);

  return (
    <div className="google-bloque">
      <div className="google-separador"><span>o continúa con</span></div>

      {CLIENT_ID ? (
        <div className="google-boton" ref={ref} />
      ) : (
        <button
          type="button"
          className="google-falso"
          onClick={() =>
            onError(
              "El ingreso con Google aún no está configurado: falta el ID de cliente (VITE_GOOGLE_CLIENT_ID)."
            )
          }
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {modo === "registro" ? "Registrarse con Google" : "Continuar con Google"}
        </button>
      )}
    </div>
  );
}

export default BotonGoogle;
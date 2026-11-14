import { useEffect, useRef } from "react";

import "./BotonGoogle.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

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
  onCredencial: (credencial: string) => void;
  onError: (mensaje: string) => void;
}

function BotonGoogle({ onCredencial, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let activo = true;
    cargarScript()
      .then(() => {
        if (!activo || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (r: { credential: string }) => onCredencial(r.credential),
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
          locale: "es",
        });
      })
      .catch(() => onError("No se pudo cargar el acceso con Google."));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-bloque">
      <div className="google-separador"><span>o</span></div>
      <div className="google-boton" ref={ref} />
    </div>
  );
}

export default BotonGoogle;
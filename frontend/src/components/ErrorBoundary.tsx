import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface Estado {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, Estado> {
  state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  limpiarYRecargar = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 600, margin: "4rem auto", padding: "1rem", textAlign: "center" }}>
        <h2>Algo salió mal</h2>
        <p style={{ margin: "1rem 0", color: "#a30000" }}>{this.state.error.message}</p>
        <button className="boton" onClick={this.limpiarYRecargar}>
          Limpiar sesión y volver al inicio
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
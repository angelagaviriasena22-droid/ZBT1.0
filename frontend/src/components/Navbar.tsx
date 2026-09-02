import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-marca">
        <img src={logo} alt="Zafiro Bloom Tours" className="navbar-logo" />
        <span className="navbar-titulo">Zafiro Bloom Tours</span>
      </Link>
    </nav>
  );
}

export default Navbar;
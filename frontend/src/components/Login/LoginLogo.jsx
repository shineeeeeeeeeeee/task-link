import logo from "../../assets/logo.svg";

function LoginLogo() {
  return (
    <div className="login-logo" aria-hidden="false">
      <img src={logo} alt="Internship Portal Logo" className="logo-img" />
    </div>
  );
}

export default LoginLogo;
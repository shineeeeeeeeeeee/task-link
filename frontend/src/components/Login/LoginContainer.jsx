import LoginLogo from "./LoginLogo";
import LoginForm from "./LoginForm";

function LoginContainer() {
  return (
    <div className="login-wrap">
      <div className="illustration-layer" aria-hidden="true" />
      <div className="login-card" role="main" aria-labelledby="login-title">
        <LoginLogo />
        <div className="login-hero">
          <h1 id="login-title" className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access the Internship Portal</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginContainer;
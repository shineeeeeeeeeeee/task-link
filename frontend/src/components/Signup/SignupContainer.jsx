import SignupLogo from "./SignupLogo";
import SignupForm from "./SignupForm";

function SignupContainer() {
  return (
    <div className="signup-container">
      <div className="signup-card">
        <SignupLogo />
        <h2>Create an Account ✨</h2>
        <SignupForm />
      </div>
    </div>
  );
}

export default SignupContainer;
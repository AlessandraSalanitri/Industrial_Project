import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import signUp from "../firebase/auth/signup";
import signIn from "../firebase/auth/signIn";
import { useUser } from "../context/UserContext";
import { firebaseAuth } from "../firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "../styles/auth.css";
import ResetPasswordModal from "./ResetPasswordModal";

export default function AuthPanel({ mode }) {
  const router = useRouter();
  const { login } = useUser();

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "parent",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setIsSignUp(mode === "signup");
  }, [mode]);

  const handleSwitch = () => {
    setIsSignUp((prev) => !prev);
    setError("");
    setForm({ email: "", password: "", confirmPassword: "", role: "parent" });
    router.replace(isSignUp ? "/login" : "/signup");
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp && form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const { error: signUpError } = await signUp(
          form.email,
          form.password,
          form.role
        );
        if (signUpError) {
          if (signUpError.code === "auth/email-already-in-use") {
            setError("Email already in use. Redirecting to login...");
            setRedirecting(true);
            setTimeout(() => {
              router.replace("/login");
            }, 2000);
            return;
          }
          setError(signUpError.message || "Signup failed.");
          return;
        }
        setRedirecting(true);
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } else {
        const { result, error: signInError } = await signIn(
          form.email,
          form.password
        );
        if (signInError || !result) {
          setError(signInError?.message || "Invalid credentials.");
          return;
        }

        login(result);

        if (result.role === "parent") {
          router.replace("/parent/dashboard");
        } else if (result.role === "child") {
          if (!result.avatar) {
            router.replace("/child/create_avatar");
          } else {
            router.replace("/child/dashboard");
          }
        } else {
          router.replace("/");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(firebaseAuth, provider);

      if (!user.email) {
        setError("Google login failed. No email provided.");
        return;
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "parent",
      };

      login(userData);
      router.replace("/parent/dashboard");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/cancelled-popup-request") {
        setError("Sign‑in cancelled. Please try again.");
      } else {
        setError("Google login failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-panel ${isSignUp ? "signup-mode" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? "signup-panel" : "login-panel"}
            className={`auth-panel ${isSignUp ? "signup-mode" : ""}`}
            initial={{ x: isSignUp ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isSignUp ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="form-box">
              <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
              {error && <p className="error">{error}</p>}
              {redirecting && (
                <p className="redirect-message">
                  Redirecting to login… Please wait.
                </p>
              )}
              <form onSubmit={handleSubmit}>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {isSignUp && (
                  <>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                    >
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                    </select>
                  </>
                )}
                <button
                  type="submit"
                  className={`button ${isSignUp ? "button-secondary signup-btn" : "button-primary login-btn"}`}
                  disabled={loading || redirecting}
                >
                  {loading
                    ? "Please wait…"
                    : isSignUp
                    ? "Sign Up"
                    : "Login"}
                </button>
                {!isSignUp && (
                  <p className="forgot-password">
                    <span
                      onClick={() => setShowResetModal(true)}
                      className="link"
                    >
                      Forgot your password?
                    </span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="button google-btn"
                >
                  <Image
                    src="/assets/google.jpeg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="google-icon"
                  />
                  Sign in with Google
                </button>
              </form>
              <p className="switch-text">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={handleSwitch}
                  className="link"
                >
                  {isSignUp ? "Login here" : "Sign up here"}
                </button>
              </p>
            </div>
            <div className="auth-image">
              <Image
                src="/assets/login_img.png"
                alt="Visual"
                width={350}
                height={350}
                className="auth-image"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {showResetModal && (
        <ResetPasswordModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}

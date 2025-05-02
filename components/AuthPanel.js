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

export default function AuthPanel({ mode }) {
  const router = useRouter();
  const { login } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", role: "parent" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setIsSignUp(mode === 'signup');
  }, [mode]);

  const handleSwitch = () => {
    setIsSignUp(prev => !prev);
    setError("");
    setForm({ email: "", password: "", confirmPassword: "", role: "parent" });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp && form.password !== form.confirmPassword) {
      return setError("Passwords do not match, please double check.");
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const { error } = await signUp(form.email, form.password, form.role);
        if (error) {
          setError(error.message || "Signup failed.");
          return;
        }
        // Go to login page after signup
        router.push("/login");
      } else {
        const { result, error } = await signIn(form.email, form.password);
        if (error) {
          setError(error.message || "Login failed.");
          return;
        }

        login(result);

        // Redirect based on role
        if (result?.role === "parent") {
          router.push("/parent/dashboard");
        } else if (result?.role === "child") {
          if (!result.avatar) {
            router.push("/child/create_avatar");
          } else {
            router.push("/child/dashboard");
          }
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Logic
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      if (!user.email) {
        setError("Google login failed. No email provided.");
        return;
      }

      // Example: Assume parent role — you can enhance this with Firestore/claims logic
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "parent" // or determine dynamically
      };

      login(userData);

      // Redirect based on role
      if (userData.role === "parent") {
        router.push("/parent/dashboard");
      } else if (userData.role === "child") {
        router.push("/child/dashboard");
      } else {
        router.push("/");
      }

    } catch (error) {
      console.error("Google login failed:", error);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-panel ${isSignUp ? 'signup-mode' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? 'signup-panel' : 'login-panel'}
            className={`auth-panel ${isSignUp ? 'signup-mode' : ''}`}
            initial={{ x: isSignUp ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isSignUp ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="form-box">
              <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
              {error && <p className="error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {isSignUp && (
                  <>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <select name="role" value={form.role} onChange={handleChange}>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                    </select>
                  </>
                )}
                <button className={`button ${isSignUp ? "button-primary" : "button-secondary"}`} type="submit" disabled={loading}>
                  {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
                </button>

                {!isSignUp && (
                  <p className="forgot-password">
                    <span onClick={() => setShowResetModal(true)} className="link">
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
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button type="button" onClick={handleSwitch} className="link">
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

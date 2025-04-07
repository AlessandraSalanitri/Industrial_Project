import {  useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import signUp from "../firebase/auth/signup"; //usign signup helper- reducing load here
import signIn from "../firebase/auth/signIn"; //using signin helper in firestore/auth.
import ResetPasswordModal from '../components/ResetPasswordModal';
import { useUser } from '../context/UserContext';
import "../styles/auth.css";

export default function AuthPanel({ mode }) {
  const router = useRouter();
  const { login } = useUser(); 
  const [isSignUp, setIsSignUp] = useState(false);
  useEffect(() => {
    if (mode === 'signup') {
      setIsSignUp(true);
    }
  }, [mode]);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", role: "parent" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);



  const handleSwitch = () => {
    setIsSignUp((prev) => !prev);
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

        router.push("/login"); //redirect to login, after signup
      } else {
        const { result, error } = await signIn(form.email, form.password);
  
        if (error) {
          setError(error.message || "Login failed.");
          return;
        }

        login(result); // result contains: userId, email, role, avatar
  
  
        if (result?.role === "parent") {
          router.push("/parent/dashboard");
        } else if (result?.role === "child") {
          // Redirect to create avatar if none is set
          if (!result.avatar) {
            router.push("/child/create_avatar");
          } else {
            router.push("/child/dashboard");
          }
        } else {
          router.push("/"); // fallback
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-wrapper">
      <div className={`auth-panel ${mode === 'signup' ? 'signup-mode' : ''}`}>
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
            </form>
            <p className="switch-text">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button type="button" onClick={handleSwitch} className="link">
                {isSignUp ? "Login here" : "Sign up here"}
              </button>
            </p>

            {!isSignUp && (
            <p className="forgot-password">
              <span onClick={() => setShowResetModal(true)} className="link">
                Forgot your password?
              </span>
            </p>
           )}

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
      {showResetModal && <ResetPasswordModal onClose={() => setShowResetModal(false)} />}
    </div>
  );
}




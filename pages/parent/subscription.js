//pages/parent/subscriptions.js

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useUser } from "../../context/UserContext";
import { updateUserDetails } from "../../firebase/firestore/updateUserDetails";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { firestoreDB } from "../../firebase/firebaseConfig";
import "../../styles/subscription.css";



export default function SubscriptionPage() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    if (user?.subscriptionPlan) {
      setCurrentPlan(user.subscriptionPlan);
      setSelectedPlan(user.subscriptionPlan);
    } else {
      setCurrentPlan("free");
      setSelectedPlan("free");
    }
  }, [user]);


  const handleSelectPlan = (plan) => {
    if (plan !== selectedPlan) {
      setSelectedPlan(plan);
    }
  };



  
  const handleConfirm = async () => {
    if (!selectedPlan || !user?.userId || selectedPlan === user.subscriptionPlan) return;

  
  
    const credits = selectedPlan === "pro" ? 30 : selectedPlan === "free" ? 5 : null;
    const today = new Date().toISOString().split("T")[0];
    const userRef = doc(firestoreDB, "users", user.userId);
    const userData = {
      subscriptionPlan: selectedPlan,
      creditsToday: credits,
      lastCreditReset: today,
    };
  
    try {
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        await updateDoc(userRef, userData);
      } else {
        await setDoc(userRef, userData);
      }
  
      // ✅ Sync frontend state

      setCurrentPlan(selectedPlan);
      setUser({
        ...user,
        subscriptionPlan: selectedPlan,
        creditsToday: credits,
        lastCreditReset: today,
      });
      localStorage.setItem("user", JSON.stringify({
        ...user,
        subscriptionPlan: selectedPlan,
        creditsToday: credits,
        lastCreditReset: today,
      }));
      
  
    } catch (err) {
      console.error("❌ Failed to update or create user document:", err);
    }
  };
  
  

  const renderButton = (plan) => {
    if (plan === currentPlan) {
      return <button className="button button-secondary" disabled>Current Plan</button>;
    }
  
    if (plan === selectedPlan) {
      return <button className="button button-primary">Selected</button>;
    }
  
    return <button className="button button-primary">Switch Plan</button>;
  };
  
  



  return (
    <Layout>
      <div className="container subscription-wrapper">
        <p className="plan-text">
          Your current plan is: <strong>{user?.subscriptionPlan?.toUpperCase() || "STUDIO FREE"}</strong>
        </p>
        <h2 className="page-title">SUBSCRIPTION PLAN</h2>

        <div className="billing-toggle">
          <span className={billingCycle === "monthly" ? "active" : ""} onClick={() => setBillingCycle("monthly")}>Monthly</span>
          <span className={billingCycle === "yearly" ? "active" : ""} onClick={() => setBillingCycle("yearly")}>Yearly</span>
        </div>

        <div className="plans">
          {[
            { id: "free", label: "Studio Free", desc: "Limited features, for casual use", tag: "Basic plan" },
            { id: "pro", label: "Studio Pro", desc: "Advanced features for 2 users", tag: "For two devices" },
            { id: "unlimited", label: "Studio Unlimited", desc: "Everything unlocked, no limits", tag: "Unlimited devices" }
          ].map(plan => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? "selected" : ""}`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <span className="tag">{plan.tag}</span>
              <h3>{plan.label}</h3>
              <p>{plan.desc}</p>
              {plan.id !== "free" && <p className="price">{billingCycle === "monthly" ? "£ XX / mo" : "£ XX / yr"}</p>}
              {renderButton(plan.id)}
            </div>
          ))}
        </div>

        <div className="subscription-buttons">
          <button className="button button-secondary" onClick={() => router.back()}>Go back</button>
          <button
            className="button button-primary"
            onClick={handleConfirm}
          >
            Confirm
          </button>


        </div>
      </div>
    </Layout>
  );
}

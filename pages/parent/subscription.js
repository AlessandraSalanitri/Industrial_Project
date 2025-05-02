// pages/parent/subscriptions.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import Layout from "../../components/Layout";
import AlertModal from "../../components/AlertModal";
import { useUser } from "../../context/UserContext";
import { firestoreDB } from "../../firebase/firebaseConfig";

import "../../styles/subscription.css";

export default function SubscriptionPage() {
  const { user, setUser } = useUser();
  const router = useRouter();

  // UI state for selected plan and current billing cycle
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize the plan selection based on current user data
  useEffect(() => {
    if (user?.subscriptionPlan) {
      setCurrentPlan(user.subscriptionPlan);
      setSelectedPlan(user.subscriptionPlan);
    } else {
      setCurrentPlan("free");
      setSelectedPlan("free");
    }
  }, [user]);

  // Handles clicking on a plan card
  const handleSelectPlan = (plan) => {
    if (plan !== selectedPlan) {
      setSelectedPlan(plan);
    }
  };

  // Handles confirming the selected plan and updating Firestore
  const handleConfirm = async () => {
    // Skip if nothing changed or data is missing
    if (!selectedPlan || !user?.userId || selectedPlan === user.subscriptionPlan) return;

    // Assign daily credits based on plan type
    const credits =
      selectedPlan === "pro" ? 30 :
      selectedPlan === "free" ? 5 : null;

    const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    const userRef = doc(firestoreDB, "users", user.userId);
    const userData = {
      subscriptionPlan: selectedPlan,
      creditsToday: credits,
      lastCreditReset: today,
    };

    try {
      const docSnap = await getDoc(userRef);

      // Update or create the user document
      if (docSnap.exists()) {
        await updateDoc(userRef, userData);
      } else {
        await setDoc(userRef, userData);
      }

      // Update local state and storage
      const updatedUser = { ...user, ...userData };
      setCurrentPlan(selectedPlan);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Show confirmation modal
      setShowSuccess(true);
    } catch (err) {
      console.error("❌ Failed to update or create user document:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Renders the button state for each plan
  const renderButton = (plan) => {
    if (plan === currentPlan) {
      return <button className="button button-secondary" disabled>Current Plan</button>;
    }

    if (plan === selectedPlan) {
      return <button className="button button-primary">Selected</button>;
    }

    return <button className="button button-primary">Switch Plan</button>;
  };

  // Available subscription plans
  const plans = [
    {
      id: "free",
      label: "Studio Free",
      desc: ["⋆ Limited features", "⋆ 5 story credits/day"],
      tag: "Basic plan",
      priceMonthly: "£ 0 / mo",
      priceYearly: "£ 0 / yr"
    },
    {
      id: "pro",
      label: "Studio Pro",
      desc: ["⋆ Advanced features for 2 users", "⋆ 30 story credits/day"],
      tag: "For two devices",
      priceMonthly: "£ 3 / mo",
      priceYearly: "£ 30 / yr"
    },
    {
      id: "unlimited",
      label: "Studio Unlimited",
      desc: ["⋆ Everything unlocked", "⋆ Unlimited story credits"],
      tag: "Unlimited devices",
      priceMonthly: "£ 6 / mo",
      priceYearly: "£ 60 / yr"
    }
  ];

  return (
    <Layout>
      <div className="container subscription-wrapper">

        <h2 className="page-title">SUBSCRIPTION PLAN</h2>

        {/* Toggle between monthly/yearly */}
        <div className="billing-toggle">
          <span
            className={billingCycle === "monthly" ? "active" : ""}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </span>
          <span
            className={billingCycle === "yearly" ? "active" : ""}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
          </span>
        </div>

        {/* Plan selection UI */}
        <div className="plans">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? "selected" : ""}`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <span className="tag">{plan.tag}</span>
              <h3>{plan.label}</h3>

              {/* Price per billing cycle */}
              {plan.priceMonthly && (
                <p
                  className="price"
                  style={plan.id === "free" ? { opacity: 0.7 } : {}}
                >
                  {billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                </p>
              )}

              {/* Feature list */}
              {plan.desc.map((line, idx) => (
                <p key={idx} className="plan-feature">{line}</p>
              ))}

              {/* Select/Switch/Current button */}
              {renderButton(plan.id)}
            </div>
          ))}
        </div>

        {/* Footer buttons and confirmation modal */}
        <div className="subscription-buttons">
          <button className="button button-secondary" onClick={() => router.back()}>
            Go back
          </button>

          <button className="button button-primary" onClick={handleConfirm}>
            Confirm
          </button>

          {showSuccess && (
            <AlertModal
              type="success"
              title="Plan Updated!"
              message="All set! Your subscription has been updated and your daily credits are refreshed. Time to create more magical stories!"
              confirmLabel="OK"
              onConfirm={() => router.push("/parent/dashboard")}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

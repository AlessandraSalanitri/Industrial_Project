import { useState } from "react";
import Layout from "../../components/Layout";
import { useUser } from "../../context/UserContext";
import { updateUserDetails } from "../../firebase/firestore/updateUserDetails";
import { useRouter } from "next/router";
import "../../styles/subscription.css";

export default function SubscriptionPage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    await updateUserDetails(user.userId, { subscriptionPlan: selectedPlan });
    router.push("/parent/dashboard");
  };

  return (
    <Layout>
      <div className="container subscription-wrapper">
        <p className="plan-text">
          Your current plan is : <strong>{user?.subscriptionPlan?.toUpperCase() || "STUDIO FREE"}</strong>
        </p>
        <h2 className="page-title">SUBSCRIPTION PLAN</h2>

        <div className="billing-toggle">
          <span className={billingCycle === "monthly" ? "active" : ""} onClick={() => setBillingCycle("monthly")}>Monthly</span>
          <span className={billingCycle === "yearly" ? "active" : ""} onClick={() => setBillingCycle("yearly")}>Yearly</span>
        </div>

        <div className="plans">
          <div className={`plan-card ${selectedPlan === "free" ? "selected" : ""}`} onClick={() => handleSelectPlan("free")}>
            <span className="tag">Basic plan</span>
            <h3>Studio Free</h3>
            <p>Limited features, for casual use</p>
            <button className="button button-secondary">Get started</button>
          </div>

          <div className={`plan-card ${selectedPlan === "pro" ? "selected" : ""}`} onClick={() => handleSelectPlan("pro")}>
            <span className="tag">For two devices</span>
            <h3>Studio Pro</h3>
            <p>Advanced features for 2 users</p>
            <p className="price">{billingCycle === "monthly" ? "£ XX / mo" : "£ XX / yr"}</p>
            <button className="button button-primary">Start a free trial</button>
          </div>

          <div className={`plan-card ${selectedPlan === "unlimited" ? "selected" : ""}`} onClick={() => handleSelectPlan("unlimited")}>
            <span className="tag">Unlimited devices</span>
            <h3>Studio Unlimited</h3>
            <p>Everything unlocked, no limits</p>
            <p className="price">{billingCycle === "monthly" ? "£ XX / mo" : "£ XX / yr"}</p>
            <button className="button button-primary">Start a free trial</button>
          </div>
        </div>

        <div className="subscription-buttons">
          <button className="button button-secondary" onClick={() => router.back()}>Go back</button>
          <button className="button button-primary" onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </Layout>
  );
}

// pages/parent/personal_details.js
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from 'next/router'; 
import { fetchUserDetails, updateUserDetails } from "../../firebase/firestore/updateUserDetails";
import "../../styles/personal_details.css";

export default function PersonalDetailsPage() {
  const { user } = useUser();
  const [details, setDetails] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    creditCard: "",
    subscriptionPlan: "",
  });
  const [editField, setEditField] = useState(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (user?.userId) {
        const data = await fetchUserDetails(user.userId);
        if (data) setDetails(data);
      }
    };
    fetchData();
  }, [user]);

  const router = useRouter();

  const goBack = () => {
    router.push('/parent/dashboard');
  };

  const handleEdit = (field) => {
    setEditField(field);
    setInputValue(details[field] || "");
  };

  const handleSave = async () => {
    await updateUserDetails(user.userId, { [editField]: inputValue });
    setDetails((prev) => ({ ...prev, [editField]: inputValue }));
    setEditField(null);
    setInputValue("");
  };

  const renderField = (label, field, disabled = false) => (
    <div className="detail-row" key={field}>
      <span className="detail-label">{label}:</span>
      {editField === field && !disabled ? (
        <>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="button button-primary" onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <span className="detail-value">
            {details[field] || <span className="placeholder">Add {label}</span>}
          </span>
          {!disabled && (
          <button className="button button-secondary" onClick={() => handleEdit(field)}>
            Edit
          </button>
           )}
        </>
      )}
    </div>
  );

  return (
    <Layout>
        <div className="container">
        <h1 className="personal_details-title">Personal Details</h1>
        <p>Edit here your details. To edit your password, please click the <strong>"Forgot password" </strong> on the login page.</p>

            
            <div className="details-wrapper">
                {renderField("Full Name", "fullName")}
                {renderField("Phone Number", "phoneNumber")}
                {renderField("Address", "address")}
                {renderField("Credit Card", "creditCard")}
                <div className="detail-row">
                  <span className="detail-label">Subscription Plan:</span>
                  <span className="detail-value">
                    {details.subscriptionPlan || <span className="placeholder">No Plan Selected</span>}
                  </span>
                  <button 
                    className="button button-secondary"
                    onClick={() => router.push('/parent/subscription')}
                  >
                    Change Plan
                  </button>
                </div>               
            </div>
        </div>

        <div className="admin-buttons">
        <button className="button button-secondary" onClick={goBack}>
            Go Back
        </button>
        <button className="button button-primary" onClick={goBack}>
            Confirm
        </button>
        </div>

    </Layout>
  );
}

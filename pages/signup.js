// pages/signup.js
import Layout from "../components/Layout";
import AuthPanel from "../components/AuthPanel";

export default function SignupPage() {
  return (
    <Layout>
      <AuthPanel mode="signup" />
    </Layout>
  );
}

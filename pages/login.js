// pages/login.js
import Layout from "../components/Layout";
import AuthPanel from "../components/AuthPanel";

export default function LoginPage() {
  return (
    <Layout>
      <AuthPanel mode="login" />
    </Layout>
  );
}

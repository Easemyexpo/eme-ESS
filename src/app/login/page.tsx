import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.empId) redirect("/dashboard");

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo-badge">
            <Image className="logo-img" src="/logo.jpeg" alt={COMPANY_NAME} width={48} height={48} />
          </div>
          <div className="brand-word">{COMPANY_NAME}</div>
          <h1>{APP_NAME}</h1>
          <p className="muted">Sign in to manage attendance, leave, payroll &amp; profile</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

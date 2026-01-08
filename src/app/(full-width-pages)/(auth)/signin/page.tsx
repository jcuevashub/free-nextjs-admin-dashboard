import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión | Fintech RD - Panel Next.js",
  description: "Página de inicio de sesión en el panel Fintech RD",
};

export default function SignIn() {
  return <SignInForm />;
}

import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión | TailAdmin - Panel Next.js",
  description: "Página de inicio de sesión en el panel TailAdmin",
};

export default function SignIn() {
  return <SignInForm />;
}

import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta | TailAdmin - Panel Next.js",
  description: "Página de registro en el panel TailAdmin",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}

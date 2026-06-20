import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | SwiftShip",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

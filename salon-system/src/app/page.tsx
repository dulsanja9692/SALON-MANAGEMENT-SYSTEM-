import { redirect } from "next/navigation";

export default function Home() {
  // Automatically sends users to the login page
  redirect("/login");
}
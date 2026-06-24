import { redirect } from "next/navigation";

// Dashboard merged into the board home — the "what needs you" strip lives there now.
export default function DashboardPage() {
  redirect("/board");
}

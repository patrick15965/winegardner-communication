import { redirect } from "next/navigation";

// Handoffs are a stage on the board and a tab on each bid — not a separate page.
export default function HandoffPage() {
  redirect("/board");
}

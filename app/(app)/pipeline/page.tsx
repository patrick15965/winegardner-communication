import { redirect } from "next/navigation";

// The pipeline IS the board home now — one track, not a separate destination.
export default function PipelinePage() {
  redirect("/board");
}

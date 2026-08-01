import { redirect } from "next/navigation";
import { EVENT_ID } from "@/src/constants/event";

export default function Home() {
  redirect(`/${EVENT_ID}`);
}
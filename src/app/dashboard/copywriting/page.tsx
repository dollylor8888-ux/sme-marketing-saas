import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CopywritingClient from "./CopywritingClient";

export const dynamic = "force-dynamic";

export default async function CopywritingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/copywriting");
  }

  return <CopywritingClient />;
}

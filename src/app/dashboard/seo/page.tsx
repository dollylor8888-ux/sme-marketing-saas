import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SeoClient from "./SeoClient";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/seo");
  }

  return <SeoClient />;
}

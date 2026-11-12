import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CommandCenterApp from "../components/CommandCenterApp";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../lib/auth";

async function AuthenticatedCommandCenter() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session.valid) {
    redirect("/login");
  }

  return <CommandCenterApp authenticatedUser={session.username} />;
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#eceef4] flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm text-xs font-bold text-slate-600">
            Verifying private access session...
          </div>
        </div>
      }
    >
      <AuthenticatedCommandCenter />
    </Suspense>
  );
}

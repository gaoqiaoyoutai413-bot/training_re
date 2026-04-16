import { LoginPageClient } from "@/components/login-page-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <LoginPageClient nextPath={params.next ?? null} />;
}

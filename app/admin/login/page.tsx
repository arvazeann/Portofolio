import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../../lib/admin-auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  if (verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin");

  const { error } = await searchParams;
  const message = error === "limited"
    ? "Terlalu banyak percobaan. Silakan coba lagi nanti."
    : error === "unavailable"
      ? "Login tidak tersedia saat ini."
      : error === "invalid"
        ? "Username atau password tidak cocok."
        : null;

  return (
    <main>
      <h1>Admin CMS</h1>
      <p>Masuk untuk mengelola konten portfolio.</p>
      {message && <p role="alert">{message}</p>}
      <form method="post" action="/api/admin/login">
        <p>
          <label htmlFor="admin-username">Username</label><br />
          <input id="admin-username" name="username" autoComplete="username" required maxLength={64} />
        </p>
        <p>
          <label htmlFor="admin-password">Password</label><br />
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} />
        </p>
        <button type="submit">Masuk</button>
      </form>
    </main>
  );
}

import { requireAdminSession } from "../../lib/admin-auth";

export default async function AdminPage() {
  await requireAdminSession();

  return (
    <main>
      <h1>Portfolio CMS</h1>
      <p>Autentikasi admin sudah aktif. Editor konten akan tersedia pada tahap berikutnya.</p>
      <form method="post" action="/api/admin/logout">
        <button type="submit">Keluar</button>
      </form>
    </main>
  );
}

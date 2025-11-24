"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/session", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-500"
    >
      로그아웃
    </button>
  );
}

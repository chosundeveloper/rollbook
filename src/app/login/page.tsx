"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") || "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted, username:", username);
    setLoading(true);
    setError(null);
    try {
      console.log("Sending request to /api/session");
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "로그인 실패" }));
        throw new Error(data.message || "로그인 실패");
      }
      const data = await response.json();
      console.log("Login success:", data);
      console.log("Redirecting to:", nextUrl);
      window.location.href = nextUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
        autoComplete="on"
      >
        <h1 className="text-2xl font-semibold text-slate-800">2청년부 출석부</h1>
        <p className="mt-2 text-sm text-slate-500">부여된 아이디와 비밀번호로 로그인하세요.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="username">
          아이디
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          placeholder="example"
          autoComplete="username"
          required
        />
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          placeholder="********"
          autoComplete="current-password"
          required
        />
        {error && (
          <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error === "wrong_password" ? "Falsches Passwort." : "Login fehlgeschlagen."
        );
      }
      const params = new URLSearchParams(window.location.search);
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-paper text-ink rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="font-heading text-3xl text-ember mb-6 tracking-wide">Admin-Login</h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          className="w-full border border-ink/20 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ember"
        />
        {error && <p className="text-ember text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-ember text-paper font-semibold disabled:opacity-50"
        >
          {loading ? "…" : "Einloggen"}
        </button>
      </form>
    </main>
  );
}

"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("email", email);

      const res = await fetch(
        `https://app.loops.so/api/newsletter-form/LOOPS_FORM_ID`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-green-400 font-mono">
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <label htmlFor="waitlist-email" className="sr-only">
        Email address
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
        className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "Sending…" : "Get early access"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400 mt-1 sm:absolute sm:translate-y-12">{errorMsg}</p>
      )}
    </form>
  );
}

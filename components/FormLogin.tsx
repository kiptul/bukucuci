"use client";

import { useActionState } from "react";
import { masuk } from "@/app/login/actions";

export default function FormLogin({ pesanAwal }: { pesanAwal?: string }) {
  const [state, aksi, menunggu] = useActionState(masuk, null);
  const galat = state?.error ?? pesanAwal;

  return (
    <form action={aksi} className="mt-8 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="kasir@laundry.id"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {galat && (
        <p className="rounded-lg bg-rose-100 px-4 py-3 text-sm text-rose-800">
          {galat}
        </p>
      )}

      <button
        disabled={menunggu}
        className="w-full rounded-xl bg-sky-600 py-3.5 text-base font-semibold text-white active:bg-sky-700 disabled:opacity-60"
      >
        {menunggu ? "Masuk..." : "Masuk"}
      </button>
    </form>
  );
}

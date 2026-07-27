"use client";

import { useActionState } from "react";
import { masuk } from "@/app/login/actions";

const gayaInput =
  "w-full border border-garis bg-white px-3.5 py-3 text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen";

const gayaLabel =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-tinta-2";

export default function FormLogin({ pesanAwal }: { pesanAwal?: string }) {
  const [state, aksi, menunggu] = useActionState(masuk, null);
  const galat = state?.error ?? pesanAwal;

  return (
    <form action={aksi} className="space-y-5">
      <div>
        <label htmlFor="email" className={gayaLabel}>
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
          className={gayaInput}
        />
      </div>

      <div>
        <label htmlFor="password" className={gayaLabel}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={gayaInput}
        />
      </div>

      {galat && (
        <p className="border-l-[3px] border-red-800 bg-red-50 px-3 py-2.5 text-sm text-red-900">
          {galat}
        </p>
      )}

      <button
        disabled={menunggu}
        className="w-full bg-tinta py-3.5 font-medium text-kertas active:bg-tinta-2 disabled:opacity-50"
      >
        {menunggu ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}

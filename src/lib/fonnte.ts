// Kirim pesan WhatsApp lewat Fonnte (https://fonnte.com).
// Gagal kirim tidak melempar error — status dicatat di notifikasi_log.
export async function kirimWhatsApp(
  target: string,
  message: string
): Promise<{ ok: boolean; keterangan: string }> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    return { ok: false, keterangan: "FONNTE_TOKEN belum diisi" };
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.status !== false) {
      return { ok: true, keterangan: "terkirim via Fonnte" };
    }
    return {
      ok: false,
      keterangan: `Fonnte menolak: ${data?.reason ?? res.status}`,
    };
  } catch (e) {
    return {
      ok: false,
      keterangan: `gagal menghubungi Fonnte: ${e instanceof Error ? e.message : e}`,
    };
  }
}

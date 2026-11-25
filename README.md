[![Bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/robiyal/best-cooking-game-20261125-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/robiyal/best-cooking-game-20261125-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Satu Api, 12 Pesanan

Kamu bukan kokinya. Kamu apinya.

Sebuah game memasak untuk bounty [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) di make.fun. Di dapur warung malam dengan tiga tungku, kamu mengatur api — bukan memindahkan koki. Setiap hidangan punya zona panas idealnya sendiri: terlalu panas dan gosong, terlalu dingin dan pelanggan pergi. Sajikan 12 pesanan sebelum shift 3 menit berakhir.

## Cara bermain

- **Klik bahan** di meja bawah (telur, ayam, sayur, nasi, bumbu), lalu **klik panci** kosong untuk memasukkannya. Kalau semua bahan resep sudah lengkap, masakan mulai dimasak.
- **Atur api** tiap tungku dengan tombol **− / +** di bawah panci, atau pilih tungku dengan tombol **1 / 2 / 3** lalu **W / S** untuk menaikkan dan menurunkan api.
- **Api 0 = istirahat**: masakan berhenti sejenak. Istirahat minimal 2 detik memberi bonus **+50% koin** saat disajikan.
- Kalau cincin kemajuan penuh di zona panas yang tepat, **klik panci** untuk memiringkannya ke piring di pass, lalu **klik piring** untuk menyajikannya ke pesanan yang cocok.
- Pesanan yang kesabarannya habis akan pergi. Tiga pelanggan pergi, atau waktu habis sebelum 12 pesanan tersaji, berarti shift berakhir. Setelah 6 pesanan tersaji, rush hour dimulai: pesanan datang lebih cepat dan pelanggan makin tidak sabar.
- **R** mengulang shift, **M** mematikan suara, **Spasi** memiringkan panci yang sudah siap.

## Resep

| Hidangan | Bahan | Api ideal | Waktu | Koin |
| --- | --- | --- | --- | --- |
| Telur Dadar | telur + bumbu | 1 (kecil) | 8 dtk | 20 |
| Nasi Goreng | nasi + telur + sayur | 2 (sedang) | 12 dtk | 30 |
| Ayam Goreng | ayam + bumbu | 3 (besar) | 16 dtk | 40 |

## Menjalankan

```sh
node serve.ts
```

Lalu buka http://localhost:8080 di desktop Chrome. Game ini dibuat dengan canvas 2D dan WebAudio murni — tanpa aset eksternal, tanpa network. Semua gambar digambar prosedural, semua suara disintesis.

## Struktur

- `main.ts` — program hand-in: menyalin `game/` dan `screenshots/` ke output dan menulis `dossier.json` dengan `buildDossier` dari `vendor/makefun-game.ts`.
- `game/index.html` — halaman game.
- `game/src/main.js` — bootstrap dan game loop.
- `game/src/config.js` — resep, tuning, palet, layout.
- `game/src/world.js` — state dan aturan: tungku, panci, pesanan, timer, skor.
- `game/src/input.js` — mouse dan keyboard.
- `game/src/render.js` — semua gambar canvas.
- `game/src/audio.js` — suara synth WebAudio.
- `game/src/shots.js` — adegan staged untuk screenshot (`?shot=start|play|serve|end`).
- `screenshots/` — 4 tangkapan layar dari kode game sendiri.

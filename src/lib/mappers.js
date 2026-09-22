// Konversi antara bentuk data di aplikasi dan baris tabel `observations`.

export function toRow(o) {
  return {
    guru_id: o.guruId || null,
    guru: o.guru,
    kelas: o.kelas,
    mapel: o.mapel,
    topik: o.topik || '',
    tanggal: o.tanggal,
    scores: o.scores,
    total: o.sum,
    avg: o.avg,
    nilai: o.nilai,
    murid: o.murid || {},
    guru_ref: o.guruRef || {},
    catatan: o.catatan || '',
  }
}

export function fromRow(r) {
  return {
    id: r.id,
    createdAt: r.created_at,
    guruId: r.guru_id,
    guru: r.guru,
    kelas: r.kelas,
    mapel: r.mapel,
    topik: r.topik || '',
    tanggal: r.tanggal,
    scores: r.scores,
    sum: r.total,
    avg: Number(r.avg),
    nilai: r.nilai,
    murid: r.murid || {},
    guruRef: r.guru_ref || {},
    catatan: r.catatan || '',
  }
}

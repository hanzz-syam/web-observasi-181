// 12 indikator kualitas pembelajaran (diambil dari prototipe SI-OBSERVASI 181)
// Setiap indikator memiliki rubrik skor 1-4.

export const SCORE_LEVELS = [
  { value: 1, label: 'Perlu Perbaikan' },
  { value: 2, label: 'Cukup' },
  { value: 3, label: 'Baik' },
  { value: 4, label: 'Sangat Baik' },
]

export const INDICATORS = [
  {
    id: 'i01',
    title: 'Tujuan pembelajaran jelas',
    short: 'Tujuan jelas',
    rubric: {
      1: 'Tujuan tidak disampaikan atau tidak berkaitan dengan kegiatan belajar.',
      2: 'Tujuan disampaikan sekilas dan belum dikaitkan dengan kegiatan maupun capaian murid.',
      3: 'Tujuan disampaikan dengan jelas dan sebagian besar kegiatan selaras dengan tujuan.',
      4: 'Tujuan dipahami murid dan seluruh kegiatan serta asesmen selaras dengan tujuan.',
    },
  },
  {
    id: 'i02',
    title: 'Pembelajaran berpusat pada murid',
    short: 'Berpusat pada murid',
    rubric: {
      1: 'Guru mendominasi; murid hanya mendengar dan mencatat.',
      2: 'Murid sesekali dilibatkan, tetapi kegiatan masih didominasi penjelasan guru.',
      3: 'Sebagian besar kegiatan melibatkan murid mengerjakan, berdiskusi, atau mencoba.',
      4: 'Murid menjadi pelaku utama: menggali, memilih cara, dan mengambil peran, guru memfasilitasi.',
    },
  },
  {
    id: 'i03',
    title: 'Penguasaan materi',
    short: 'Penguasaan materi',
    rubric: {
      1: 'Ada kesalahan konsep dan guru ragu saat menjawab pertanyaan murid.',
      2: 'Materi umumnya benar, tetapi penjelasan kurang mendalam dan contoh terbatas.',
      3: 'Materi disampaikan benar dan runtut, dengan contoh yang relevan.',
      4: 'Materi dikuasai mendalam, dikaitkan dengan kehidupan murid, dan pertanyaan tak terduga dijawab dengan baik.',
    },
  },
  {
    id: 'i04',
    title: 'Strategi/metode sesuai kebutuhan murid',
    short: 'Strategi sesuai kebutuhan',
    rubric: {
      1: 'Hanya satu metode dan tidak mempertimbangkan karakteristik murid.',
      2: 'Metode cukup bervariasi, tetapi kurang sesuai dengan tujuan atau usia murid.',
      3: 'Metode sesuai dengan tujuan dan karakteristik sebagian besar murid.',
      4: 'Metode dipilih berdasarkan kebutuhan murid dan disesuaikan secara luwes selama pembelajaran.',
    },
  },
  {
    id: 'i05',
    title: 'Media/teknologi digunakan secara bermakna',
    short: 'Media bermakna',
    rubric: {
      1: 'Tidak ada media, atau media tidak berkaitan dengan materi.',
      2: 'Media digunakan sebagai pelengkap, tetapi belum membantu pemahaman murid.',
      3: 'Media memperjelas materi dan digunakan dengan tepat.',
      4: 'Media, benda konkret, atau lingkungan sekitar memperdalam pemahaman dan dimanfaatkan aktif oleh murid.',
    },
  },
  {
    id: 'i06',
    title: 'Murid aktif bertanya/berdiskusi',
    short: 'Murid aktif',
    rubric: {
      1: 'Murid pasif; hampir tidak ada pertanyaan atau diskusi.',
      2: 'Hanya sebagian kecil murid yang bertanya atau menjawab.',
      3: 'Banyak murid bertanya dan berdiskusi dengan arahan guru.',
      4: 'Hampir seluruh murid aktif bertanya, berpendapat, dan menanggapi teman disertai alasan.',
    },
  },
  {
    id: 'i07',
    title: 'Diferensiasi pembelajaran',
    short: 'Diferensiasi',
    rubric: {
      1: 'Semua murid mendapat tugas dan perlakuan yang sama tanpa penyesuaian.',
      2: 'Ada penyesuaian, tetapi hanya untuk murid tertentu dan tidak terencana.',
      3: 'Guru menyediakan pilihan tugas atau dukungan sesuai kesiapan dan minat murid.',
      4: 'Diferensiasi terencana pada konten, proses, atau produk; murid yang butuh dukungan maupun tantangan terlayani.',
    },
  },
  {
    id: 'i08',
    title: 'Pengelolaan kelas positif',
    short: 'Kelas positif',
    rubric: {
      1: 'Kelas gaduh atau tidak terkendali; guru banyak menegur dengan nada keras.',
      2: 'Kelas cukup tertib, tetapi aturan tidak konsisten dan lebih banyak berupa teguran.',
      3: 'Kelas tertib, aturan jelas, dan suasana aman serta saling menghargai.',
      4: 'Suasana hangat; murid mengelola diri dan bekerja sama; disiplin ditegakkan secara positif dan konsisten.',
    },
  },
  {
    id: 'i09',
    title: 'Asesmen formatif digunakan',
    short: 'Asesmen formatif',
    rubric: {
      1: 'Tidak ada pengecekan pemahaman selama pembelajaran.',
      2: 'Pengecekan sesekali, hanya lewat pertanyaan lisan kepada murid tertentu.',
      3: 'Guru rutin mengecek pemahaman dengan beberapa cara (tanya jawab, tugas singkat, pengamatan).',
      4: 'Pengecekan beragam dan hasilnya langsung dipakai untuk mengubah penjelasan atau mengelompokkan ulang murid.',
    },
  },
  {
    id: 'i10',
    title: 'Umpan balik diberikan',
    short: 'Umpan balik',
    rubric: {
      1: 'Tidak ada umpan balik, atau hanya menyatakan benar/salah.',
      2: 'Umpan balik bersifat umum ("bagus", "kurang tepat") dan tanpa langkah perbaikan.',
      3: 'Umpan balik spesifik dan membantu murid mengetahui bagian yang perlu diperbaiki.',
      4: 'Umpan balik spesifik, tepat waktu, mendorong murid memperbaiki sendiri, dan juga terjadi antar teman.',
    },
  },
  {
    id: 'i11',
    title: 'Penguatan karakter',
    short: 'Penguatan karakter',
    rubric: {
      1: 'Tidak ada penguatan karakter.',
      2: 'Nilai karakter disebut secara lisan, tetapi tidak terlihat dalam kegiatan.',
      3: 'Nilai karakter (mis. gotong royong, jujur, mandiri) terintegrasi dalam kegiatan dan diapresiasi guru.',
      4: 'Karakter dibiasakan lewat kegiatan bermakna, guru menjadi teladan, dan murid menunjukkannya secara mandiri.',
    },
  },
  {
    id: 'i12',
    title: 'Penutup dan refleksi',
    short: 'Penutup & refleksi',
    rubric: {
      1: 'Pembelajaran berakhir tanpa penutup.',
      2: 'Penutup berupa kesimpulan dari guru saja.',
      3: 'Guru dan murid menyimpulkan bersama serta mengecek ketercapaian tujuan.',
      4: 'Murid merefleksikan hal yang dipelajari, kesulitan, dan tindak lanjut; guru menyampaikan rencana berikutnya.',
    },
  },
]

export const INDICATOR_COUNT = INDICATORS.length
export const MAX_SCORE = 4

export const PEMAHAMAN = [
  'Sudah sangat paham',
  'Sudah paham',
  'Masih sebagian',
  'Belum paham',
]

export const MAPEL_SUGGESTIONS = [
  'Pendidikan Agama dan Budi Pekerti',
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Matematika',
  'IPAS',
  'PJOK',
  'Seni dan Budaya',
  'Bahasa Inggris',
  'Bahasa Jawa',
]

export const KELAS_SUGGESTIONS = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6']

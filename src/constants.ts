export interface Topic {
  id: string;
  title: string;
  description: string;
  concepts: string[];
}

export interface GradeData {
  grade: string;
  topics: Topic[];
}

export const MATH_DATA: GradeData[] = [
  {
    grade: "7",
    topics: [
      {
        id: "bilangan",
        title: "Bilangan",
        description: "Mempelajari bilangan bulat, pecahan, dan operasinya.",
        concepts: ["Bilangan Bulat", "Pecahan", "Persentase", "Operasi Campuran"]
      },
      {
        id: "aljabar-7",
        title: "Aljabar Dasar",
        description: "Mengenal variabel, konstanta, dan bentuk aljabar sederhana.",
        concepts: ["Variabel & Konstanta", "Penjumlahan Aljabar", "Perkalian Aljabar", "Persamaan Linear Satu Variabel"]
      },
      {
        id: "perbandingan",
        title: "Perbandingan",
        description: "Memahami rasio dan perbandingan senilai/berbalik nilai.",
        concepts: ["Rasio", "Perbandingan Senilai", "Perbandingan Berbalik Nilai", "Skala Peta"]
      },
      {
        id: "geometri-7",
        title: "Garis & Sudut",
        description: "Mempelajari hubungan antar garis dan jenis-jenis sudut.",
        concepts: ["Jenis Sudut", "Sudut Berpelurus", "Sudut Berpenyiku", "Garis Sejajar"]
      }
    ]
  },
  {
    grade: "8",
    topics: [
      {
        id: "pola-bilangan",
        title: "Pola Bilangan",
        description: "Menemukan aturan dalam urutan angka.",
        concepts: ["Barisan Aritmatika", "Barisan Geometri", "Konfigurasi Objek", "Deret Bilangan"]
      },
      {
        id: "relasi-fungsi",
        title: "Relasi & Fungsi",
        description: "Memahami hubungan antara dua himpunan.",
        concepts: ["Diagram Panah", "Himpunan Pasangan Berurutan", "Rumus Fungsi", "Domain, Kodomain, Range"]
      },
      {
        id: "persamaan-garis",
        title: "Persamaan Garis Lurus",
        description: "Menggambar dan menentukan gradien garis.",
        concepts: ["Gradien", "Titik Potong", "Menggambar Grafik", "Persamaan Garis Melalui 2 Titik"]
      },
      {
        id: "pythagoras",
        title: "Teorema Pythagoras",
        description: "Hubungan sisi-sisi pada segitiga siku-siku.",
        concepts: ["Rumus Pythagoras", "Tripel Pythagoras", "Aplikasi Pythagoras", "Jenis Segitiga"]
      },
      {
        id: "lingkaran",
        title: "Lingkaran",
        description: "Mempelajari unsur-unsur dan luas/keliling lingkaran.",
        concepts: ["Unsur Lingkaran", "Keliling & Luas", "Sudut Pusat & Keliling", "Garis Singgung"]
      }
    ]
  }
];

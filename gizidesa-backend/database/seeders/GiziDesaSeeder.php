<?php

namespace Database\Seeders;

use App\Models\DataRisiko;
use App\Models\Intervensi;
use App\Models\PanganLokal;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GiziDesaSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@gizidesa.test'],
            [
                'name' => 'Admin Desa',
                'password' => Hash::make('password123'),
                'role' => 'admin_desa',
                'phone' => '081234567890',
                'address' => 'Desa Pilot GiziDesa',
            ]
        );

        $kader = User::updateOrCreate(
            ['email' => 'kader@gizidesa.test'],
            [
                'name' => 'Kader Posyandu',
                'password' => Hash::make('password123'),
                'role' => 'kader_posyandu',
                'phone' => '081234567891',
                'address' => 'Desa Pilot GiziDesa',
            ]
        );

        User::updateOrCreate(
            ['email' => 'bidan@gizidesa.test'],
            [
                'name' => 'Bidan Desa',
                'password' => Hash::make('password123'),
                'role' => 'bidan_desa',
                'phone' => '081234567892',
                'address' => 'Puskesmas Desa Pilot',
            ]
        );

        $wilayah = Wilayah::updateOrCreate(
            ['kode_wilayah' => 'DSN1-RT01'],
            [
                'nama_dusun' => 'Dusun I',
                'nama_rt' => 'RT 01',
                'keterangan' => 'Wilayah pilot pendataan risiko stunting.',
            ]
        );

        PanganLokal::updateOrCreate(
            ['nama_pangan' => 'Daun Kelor'],
            [
                'kategori' => 'sayur',
                'manfaat_gizi' => 'Mengandung zat besi, vitamin A, vitamin C, dan protein nabati yang dapat mendukung pemenuhan gizi keluarga.',
                'cara_pengolahan' => 'Dapat diolah menjadi sayur bening, campuran bubur, atau lauk pendamping.',
                'ketersediaan' => 'mudah_ditemukan',
                'estimasi_harga' => 5000,
                'catatan' => 'Cocok untuk edukasi pangan lokal di posyandu.',
                'is_active' => true,
            ]
        );

        $dataRisiko = DataRisiko::updateOrCreate(
            [
                'wilayah_id' => $wilayah->id,
                'periode' => '2026-05',
            ],
            [
                'created_by' => $kader->id,
                'jumlah_ibu_hamil' => 8,
                'jumlah_ibu_hamil_kek' => 2,
                'jumlah_ibu_hamil_anc_tidak_rutin' => 3,
                'akses_air_bersih' => 'cukup',
                'kondisi_sanitasi' => 'buruk',
                'tingkat_ekonomi' => 'sedang',
                'akses_layanan_kesehatan' => 'mudah',
                'pemanfaatan_pangan_lokal' => 'cukup',
                'skor_irs' => 42.50,
                'kategori_risiko' => 'sedang',
                'faktor_dominan' => 'sanitasi',
                'rekomendasi_awal' => 'Wilayah perlu pemantauan dan intervensi berkala. Prioritaskan edukasi PHBS, pendataan jamban sehat, dan intervensi sanitasi lingkungan.',
                'catatan' => 'Data awal untuk simulasi dashboard GiziDesa.',
            ]
        );

        Intervensi::updateOrCreate(
            [
                'data_risiko_id' => $dataRisiko->id,
                'judul' => 'Edukasi PHBS dan Pendataan Jamban Sehat',
            ],
            [
                'wilayah_id' => $wilayah->id,
                'created_by' => $admin->id,
                'jenis_intervensi' => 'perbaikan_sanitasi',
                'deskripsi' => 'Kegiatan edukasi perilaku hidup bersih dan sehat serta pendataan kondisi jamban keluarga pada wilayah prioritas.',
                'tanggal_rencana' => '2026-05-25',
                'tanggal_pelaksanaan' => null,
                'status' => 'direncanakan',
                'prioritas' => 'tinggi',
                'hasil_intervensi' => null,
                'catatan' => 'Intervensi dibuat berdasarkan faktor dominan sanitasi.',
            ]
        );
    }
}
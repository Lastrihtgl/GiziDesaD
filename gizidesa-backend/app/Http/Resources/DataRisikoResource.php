<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataRisikoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'wilayah_id' => $this->wilayah_id,
            'created_by_id' => $this->created_by,

            'wilayah' => [
                'id' => $this->wilayah?->id,
                'nama_dusun' => $this->wilayah?->nama_dusun,
                'nama_rt' => $this->wilayah?->nama_rt,
                'kode_wilayah' => $this->wilayah?->kode_wilayah,
                'keterangan' => $this->wilayah?->keterangan,
            ],

            'periode' => $this->periode,

            'jumlah_ibu_hamil' => $this->jumlah_ibu_hamil,
            'jumlah_ibu_hamil_kek' => $this->jumlah_ibu_hamil_kek,
            'jumlah_ibu_hamil_anc_tidak_rutin' => $this->jumlah_ibu_hamil_anc_tidak_rutin,

            'akses_air_bersih' => $this->akses_air_bersih,
            'kondisi_sanitasi' => $this->kondisi_sanitasi,
            'tingkat_ekonomi' => $this->tingkat_ekonomi,
            'akses_layanan_kesehatan' => $this->akses_layanan_kesehatan,
            'pemanfaatan_pangan_lokal' => $this->pemanfaatan_pangan_lokal,

            'skor_irs' => $this->skor_irs,
            'kategori_risiko' => $this->kategori_risiko,
            'faktor_dominan' => $this->faktor_dominan,
            'rekomendasi_awal' => $this->rekomendasi_awal,
            'catatan' => $this->catatan,

            'indikator' => [
                'jumlah_ibu_hamil' => $this->jumlah_ibu_hamil,
                'jumlah_ibu_hamil_kek' => $this->jumlah_ibu_hamil_kek,
                'jumlah_ibu_hamil_anc_tidak_rutin' => $this->jumlah_ibu_hamil_anc_tidak_rutin,
                'akses_air_bersih' => $this->akses_air_bersih,
                'kondisi_sanitasi' => $this->kondisi_sanitasi,
                'tingkat_ekonomi' => $this->tingkat_ekonomi,
                'akses_layanan_kesehatan' => $this->akses_layanan_kesehatan,
                'pemanfaatan_pangan_lokal' => $this->pemanfaatan_pangan_lokal,
            ],

            'irs' => [
                'skor_irs' => $this->skor_irs,
                'kategori_risiko' => $this->kategori_risiko,
                'faktor_dominan' => $this->faktor_dominan,
            ],

            'created_by' => [
                'id' => $this->pembuat?->id,
                'name' => $this->pembuat?->name,
                'role' => $this->pembuat?->role,
            ],

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
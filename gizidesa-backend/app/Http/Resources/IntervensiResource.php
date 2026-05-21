<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntervensiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'data_risiko' => [
                'id' => $this->dataRisiko?->id,
                'periode' => $this->dataRisiko?->periode,
                'skor_irs' => $this->dataRisiko?->skor_irs,
                'kategori_risiko' => $this->dataRisiko?->kategori_risiko,
                'faktor_dominan' => $this->dataRisiko?->faktor_dominan,
            ],

            'wilayah' => [
                'id' => $this->wilayah?->id,
                'nama_dusun' => $this->wilayah?->nama_dusun,
                'nama_rt' => $this->wilayah?->nama_rt,
                'kode_wilayah' => $this->wilayah?->kode_wilayah,
            ],

            'jenis_intervensi' => $this->jenis_intervensi,
            'judul' => $this->judul,
            'deskripsi' => $this->deskripsi,
            'tanggal_rencana' => $this->tanggal_rencana?->format('Y-m-d'),
            'tanggal_pelaksanaan' => $this->tanggal_pelaksanaan?->format('Y-m-d'),
            'status' => $this->status,
            'prioritas' => $this->prioritas,
            'hasil_intervensi' => $this->hasil_intervensi,
            'catatan' => $this->catatan,

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
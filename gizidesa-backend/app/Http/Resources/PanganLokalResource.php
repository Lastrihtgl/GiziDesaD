<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PanganLokalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_pangan' => $this->nama_pangan,
            'kategori' => $this->kategori,
            'manfaat_gizi' => $this->manfaat_gizi,
            'cara_pengolahan' => $this->cara_pengolahan,
            'ketersediaan' => $this->ketersediaan,
            'estimasi_harga' => $this->estimasi_harga,
            'catatan' => $this->catatan,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
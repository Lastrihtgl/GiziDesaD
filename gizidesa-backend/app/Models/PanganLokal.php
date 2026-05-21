<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PanganLokal extends Model
{
    protected $table = 'pangan_lokal';

    protected $fillable = [
        'nama_pangan',
        'kategori',
        'manfaat_gizi',
        'cara_pengolahan',
        'ketersediaan',
        'estimasi_harga',
        'catatan',
        'is_active',
    ];

    protected $casts = [
        'estimasi_harga' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected $fillable = [
        'nama_dusun',
        'nama_rt',
        'kode_wilayah',
        'latitude',
        'longitude',
        'keterangan',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function dataRisiko(): HasMany
    {
        return $this->hasMany(DataRisiko::class, 'wilayah_id');
    }

    public function intervensi(): HasMany
    {
        return $this->hasMany(Intervensi::class, 'wilayah_id');
    }
}
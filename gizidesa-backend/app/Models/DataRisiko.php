<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DataRisiko extends Model
{
    protected $table = 'data_risiko';

    protected $fillable = [
        'wilayah_id',
        'created_by',
        'periode',
        'jumlah_ibu_hamil',
        'jumlah_ibu_hamil_kek',
        'jumlah_ibu_hamil_anc_tidak_rutin',
        'akses_air_bersih',
        'kondisi_sanitasi',
        'tingkat_ekonomi',
        'akses_layanan_kesehatan',
        'pemanfaatan_pangan_lokal',
        'skor_irs',
        'kategori_risiko',
        'faktor_dominan',
        'rekomendasi_awal',
        'catatan',
    ];

    protected $casts = [
        'jumlah_ibu_hamil' => 'integer',
        'jumlah_ibu_hamil_kek' => 'integer',
        'jumlah_ibu_hamil_anc_tidak_rutin' => 'integer',
        'skor_irs' => 'decimal:2',
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function intervensi(): HasMany
    {
        return $this->hasMany(Intervensi::class, 'data_risiko_id');
    }
}   
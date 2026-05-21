<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Intervensi extends Model
{
    protected $table = 'intervensi';

    protected $fillable = [
        'data_risiko_id',
        'wilayah_id',
        'created_by',
        'jenis_intervensi',
        'judul',
        'deskripsi',
        'tanggal_rencana',
        'tanggal_pelaksanaan',
        'status',
        'prioritas',
        'hasil_intervensi',
        'catatan',
    ];

    protected $casts = [
        'tanggal_rencana' => 'date',
        'tanggal_pelaksanaan' => 'date',
    ];

    public function dataRisiko(): BelongsTo
    {
        return $this->belongsTo(DataRisiko::class, 'data_risiko_id');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
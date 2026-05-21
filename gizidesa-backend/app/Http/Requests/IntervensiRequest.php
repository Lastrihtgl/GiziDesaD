<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IntervensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin_desa', 'bidan_desa'], true);
    }

    public function rules(): array
    {
        return [
            'data_risiko_id' => ['required', 'exists:data_risiko,id'],
            'wilayah_id' => ['required', 'exists:wilayah,id'],

            'jenis_intervensi' => [
                'required',
                Rule::in([
                    'edukasi_gizi',
                    'kunjungan_rumah',
                    'pendampingan_ibu_hamil',
                    'perbaikan_sanitasi',
                    'bantuan_pangan',
                    'rujukan_layanan',
                    'lainnya',
                ]),
            ],

            'judul' => ['required', 'string', 'max:150'],
            'deskripsi' => ['required', 'string'],

            'tanggal_rencana' => ['nullable', 'date'],
            'tanggal_pelaksanaan' => ['nullable', 'date'],

            'status' => [
                'required',
                Rule::in(['direncanakan', 'berjalan', 'selesai', 'dibatalkan']),
            ],

            'prioritas' => [
                'required',
                Rule::in(['rendah', 'sedang', 'tinggi']),
            ],

            'hasil_intervensi' => ['nullable', 'string'],
            'catatan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'data_risiko_id.required' => 'Data risiko wajib dipilih.',
            'data_risiko_id.exists' => 'Data risiko tidak ditemukan.',
            'wilayah_id.required' => 'Wilayah wajib dipilih.',
            'wilayah_id.exists' => 'Wilayah tidak ditemukan.',
            'jenis_intervensi.required' => 'Jenis intervensi wajib dipilih.',
            'judul.required' => 'Judul intervensi wajib diisi.',
            'deskripsi.required' => 'Deskripsi intervensi wajib diisi.',
            'status.required' => 'Status intervensi wajib dipilih.',
            'prioritas.required' => 'Prioritas intervensi wajib dipilih.',
        ];
    }
}
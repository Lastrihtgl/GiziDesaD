<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PanganLokalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin_desa';
    }

    public function rules(): array
    {
        $panganLokalId = $this->route('pangan_lokal')?->id
            ?? $this->route('panganLokal')?->id;

        return [
            'nama_pangan' => [
                'required',
                'string',
                'max:100',
                Rule::unique('pangan_lokal', 'nama_pangan')->ignore($panganLokalId),
            ],
            'kategori' => [
                'required',
                Rule::in([
                    'karbohidrat',
                    'protein_hewani',
                    'protein_nabati',
                    'sayur',
                    'buah',
                    'lainnya',
                ]),
            ],
            'manfaat_gizi' => ['required', 'string'],
            'cara_pengolahan' => ['nullable', 'string'],
            'ketersediaan' => [
                'required',
                Rule::in(['mudah_ditemukan', 'musiman', 'terbatas']),
            ],
            'estimasi_harga' => ['nullable', 'numeric', 'min:0'],
            'catatan' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_pangan.required' => 'Nama pangan wajib diisi.',
            'nama_pangan.unique' => 'Nama pangan lokal sudah terdaftar.',
            'kategori.required' => 'Kategori pangan wajib dipilih.',
            'manfaat_gizi.required' => 'Manfaat gizi wajib diisi.',
            'ketersediaan.required' => 'Ketersediaan pangan wajib dipilih.',
        ];
    }
}
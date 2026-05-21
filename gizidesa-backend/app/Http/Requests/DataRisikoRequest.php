<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DataRisikoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin_desa', 'kader_posyandu'], true);
    }

    public function rules(): array
    {
        $dataRisikoId = $this->route('data_risiko')?->id
            ?? $this->route('dataRisiko')?->id;

        return [
            'wilayah_id' => ['required', 'exists:wilayah,id'],
            'periode' => [
                'required',
                'date_format:Y-m',
                Rule::unique('data_risiko')
                    ->where('wilayah_id', $this->input('wilayah_id'))
                    ->ignore($dataRisikoId),
            ],

            'jumlah_ibu_hamil' => ['required', 'integer', 'min:0'],
            'jumlah_ibu_hamil_kek' => ['required', 'integer', 'min:0'],
            'jumlah_ibu_hamil_anc_tidak_rutin' => ['required', 'integer', 'min:0'],

            'akses_air_bersih' => ['required', Rule::in(['baik', 'cukup', 'buruk'])],
            'kondisi_sanitasi' => ['required', Rule::in(['baik', 'cukup', 'buruk'])],
            'tingkat_ekonomi' => ['required', Rule::in(['baik', 'sedang', 'rendah'])],
            'akses_layanan_kesehatan' => ['required', Rule::in(['mudah', 'cukup', 'sulit'])],
            'pemanfaatan_pangan_lokal' => ['required', Rule::in(['baik', 'cukup', 'rendah'])],

            'catatan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'wilayah_id.required' => 'Wilayah wajib dipilih.',
            'wilayah_id.exists' => 'Wilayah tidak ditemukan.',
            'periode.required' => 'Periode wajib diisi.',
            'periode.date_format' => 'Format periode harus YYYY-MM, contoh 2026-05.',
            'periode.unique' => 'Data risiko untuk wilayah dan periode ini sudah tersedia.',

            'jumlah_ibu_hamil.required' => 'Jumlah ibu hamil wajib diisi.',
            'jumlah_ibu_hamil_kek.required' => 'Jumlah ibu hamil KEK wajib diisi.',
            'jumlah_ibu_hamil_anc_tidak_rutin.required' => 'Jumlah ibu hamil dengan ANC tidak rutin wajib diisi.',

            'akses_air_bersih.required' => 'Akses air bersih wajib dipilih.',
            'kondisi_sanitasi.required' => 'Kondisi sanitasi wajib dipilih.',
            'tingkat_ekonomi.required' => 'Tingkat ekonomi wajib dipilih.',
            'akses_layanan_kesehatan.required' => 'Akses layanan kesehatan wajib dipilih.',
            'pemanfaatan_pangan_lokal.required' => 'Pemanfaatan pangan lokal wajib dipilih.',
        ];
    }
}
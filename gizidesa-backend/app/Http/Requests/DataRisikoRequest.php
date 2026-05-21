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
            'jumlah_ibu_hamil_kek' => [
                'required',
                'integer',
                'min:0',
                'lte:jumlah_ibu_hamil',
            ],
            'jumlah_ibu_hamil_anc_tidak_rutin' => [
                'required',
                'integer',
                'min:0',
                'lte:jumlah_ibu_hamil',
            ],

            'akses_air_bersih' => [
                'required',
                Rule::in(['baik', 'terbatas']),
            ],

            'kondisi_sanitasi' => [
                'required',
                Rule::in(['layak', 'tidak_layak']),
            ],

            'tingkat_ekonomi' => [
                'required',
                Rule::in(['stabil', 'rentan']),
            ],

            'akses_layanan_kesehatan' => [
                'required',
                Rule::in(['mudah', 'sulit']),
            ],

            'pemanfaatan_pangan_lokal' => [
                'required',
                Rule::in(['optimal', 'belum_optimal']),
            ],

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
            'jumlah_ibu_hamil.integer' => 'Jumlah ibu hamil harus berupa angka.',
            'jumlah_ibu_hamil.min' => 'Jumlah ibu hamil tidak boleh bernilai negatif.',

            'jumlah_ibu_hamil_kek.required' => 'Jumlah ibu hamil KEK wajib diisi.',
            'jumlah_ibu_hamil_kek.integer' => 'Jumlah ibu hamil KEK harus berupa angka.',
            'jumlah_ibu_hamil_kek.min' => 'Jumlah ibu hamil KEK tidak boleh bernilai negatif.',
            'jumlah_ibu_hamil_kek.lte' => 'Jumlah ibu hamil KEK tidak boleh melebihi jumlah ibu hamil.',

            'jumlah_ibu_hamil_anc_tidak_rutin.required' => 'Jumlah ibu hamil dengan ANC tidak rutin wajib diisi.',
            'jumlah_ibu_hamil_anc_tidak_rutin.integer' => 'Jumlah ibu hamil dengan ANC tidak rutin harus berupa angka.',
            'jumlah_ibu_hamil_anc_tidak_rutin.min' => 'Jumlah ibu hamil dengan ANC tidak rutin tidak boleh bernilai negatif.',
            'jumlah_ibu_hamil_anc_tidak_rutin.lte' => 'Jumlah ibu hamil dengan ANC tidak rutin tidak boleh melebihi jumlah ibu hamil.',

            'akses_air_bersih.required' => 'Akses air bersih wajib dipilih.',
            'akses_air_bersih.in' => 'Akses air bersih harus bernilai baik atau terbatas.',

            'kondisi_sanitasi.required' => 'Kondisi sanitasi wajib dipilih.',
            'kondisi_sanitasi.in' => 'Kondisi sanitasi harus bernilai layak atau tidak layak.',

            'tingkat_ekonomi.required' => 'Tingkat ekonomi wajib dipilih.',
            'tingkat_ekonomi.in' => 'Tingkat ekonomi harus bernilai stabil atau rentan.',

            'akses_layanan_kesehatan.required' => 'Akses layanan kesehatan wajib dipilih.',
            'akses_layanan_kesehatan.in' => 'Akses layanan kesehatan harus bernilai mudah atau sulit.',

            'pemanfaatan_pangan_lokal.required' => 'Pemanfaatan pangan lokal wajib dipilih.',
            'pemanfaatan_pangan_lokal.in' => 'Pemanfaatan pangan lokal harus bernilai optimal atau belum optimal.',
        ];
    }
}
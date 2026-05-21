<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WilayahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $wilayahId = $this->route('wilayah')?->id;

        return [
            'nama_dusun' => ['required', 'string', 'max:100'],
            'nama_rt' => [
                'required',
                'string',
                'max:50',
                Rule::unique('wilayah', 'nama_rt')
                    ->where(fn ($query) => $query->where('nama_dusun', $this->nama_dusun))
                    ->ignore($wilayahId),
            ],
            'kode_wilayah' => [
                'required',
                'string',
                'max:50',
                Rule::unique('wilayah', 'kode_wilayah')->ignore($wilayahId),
            ],
            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_dusun.required' => 'Nama dusun wajib diisi.',
            'nama_rt.required' => 'Nama RT wajib diisi.',
            'kode_wilayah.required' => 'Kode wilayah wajib diisi.',
            'nama_rt.unique' => 'Kombinasi dusun dan RT sudah terdaftar.',
            'kode_wilayah.unique' => 'Kode wilayah sudah digunakan.',
        ];
    }
}
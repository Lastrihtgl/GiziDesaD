<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WilayahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin_desa', 'kader_posyandu'], true);
    }

    public function rules(): array
    {
        $wilayahId = $this->route('wilayah')?->id;

        return [
            'nama_dusun' => ['required', 'string', 'max:100'],
            'nama_rt' => ['required', 'string', 'max:50'],

            'kode_wilayah' => [
                'required',
                'string',
                'max:50',
                Rule::unique('wilayah', 'kode_wilayah')->ignore($wilayahId),
            ],

            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            'keterangan' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_dusun.required' => 'Nama dusun wajib diisi.',
            'nama_dusun.max' => 'Nama dusun maksimal 100 karakter.',

            'nama_rt.required' => 'Nama RT wajib diisi.',
            'nama_rt.max' => 'Nama RT maksimal 50 karakter.',

            'kode_wilayah.required' => 'Kode wilayah wajib diisi.',
            'kode_wilayah.unique' => 'Kode wilayah sudah digunakan.',
            'kode_wilayah.max' => 'Kode wilayah maksimal 50 karakter.',

            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus berada di antara -90 sampai 90.',

            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus berada di antara -180 sampai 180.',
        ];
    }
}   
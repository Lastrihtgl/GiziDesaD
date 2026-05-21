<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PanganLokalRequest;
use App\Http\Resources\PanganLokalResource;
use App\Models\PanganLokal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PanganLokalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('search');
        $kategori = $request->query('kategori');
        $activeOnly = $request->boolean('active_only');

        $panganLokal = PanganLokal::query()
            ->when($keyword, function ($query) use ($keyword) {
                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('nama_pangan', 'like', "%{$keyword}%")
                        ->orWhere('kategori', 'like', "%{$keyword}%")
                        ->orWhere('manfaat_gizi', 'like', "%{$keyword}%");
                });
            })
            ->when($kategori, function ($query) use ($kategori) {
                $query->where('kategori', $kategori);
            })
            ->when($activeOnly, function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('nama_pangan')
            ->get();

        return response()->json([
            'message' => 'Data pangan lokal berhasil diambil.',
            'data' => PanganLokalResource::collection($panganLokal),
        ]);
    }

    public function store(PanganLokalRequest $request): JsonResponse
    {
        $data = $request->validated();

        $panganLokal = PanganLokal::create([
            ...$data,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Data pangan lokal berhasil ditambahkan.',
            'data' => new PanganLokalResource($panganLokal),
        ], 201);
    }

    public function show(PanganLokal $panganLokal): JsonResponse
    {
        return response()->json([
            'message' => 'Detail pangan lokal berhasil diambil.',
            'data' => new PanganLokalResource($panganLokal),
        ]);
    }

    public function update(PanganLokalRequest $request, PanganLokal $panganLokal): JsonResponse
    {
        $data = $request->validated();

        $panganLokal->update([
            ...$data,
            'is_active' => $data['is_active'] ?? $panganLokal->is_active,
        ]);

        return response()->json([
            'message' => 'Data pangan lokal berhasil diperbarui.',
            'data' => new PanganLokalResource($panganLokal),
        ]);
    }

    public function destroy(PanganLokal $panganLokal): JsonResponse
    {
        $panganLokal->delete();

        return response()->json([
            'message' => 'Data pangan lokal berhasil dihapus.',
        ]);
    }
}
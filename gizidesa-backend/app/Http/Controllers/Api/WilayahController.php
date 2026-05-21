<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WilayahRequest;
use App\Http\Resources\WilayahResource;
use App\Models\Wilayah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wilayah = Wilayah::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('nama_dusun', 'like', "%{$search}%")
                        ->orWhere('nama_rt', 'like', "%{$search}%")
                        ->orWhere('kode_wilayah', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama_dusun')
            ->orderBy('nama_rt')
            ->paginate(10);

        return response()->json([
            'message' => 'Data wilayah berhasil diambil.',
            'data' => WilayahResource::collection($wilayah),
            'meta' => [
                'current_page' => $wilayah->currentPage(),
                'last_page' => $wilayah->lastPage(),
                'per_page' => $wilayah->perPage(),
                'total' => $wilayah->total(),
            ],
        ]);
    }

    public function store(WilayahRequest $request): JsonResponse
    {
        $wilayah = Wilayah::create($request->validated());

        return response()->json([
            'message' => 'Data wilayah berhasil ditambahkan.',
            'data' => new WilayahResource($wilayah),
        ], 201);
    }

    public function show(Wilayah $wilayah): JsonResponse
    {
        return response()->json([
            'message' => 'Detail wilayah berhasil diambil.',
            'data' => new WilayahResource($wilayah),
        ]);
    }

    public function update(WilayahRequest $request, Wilayah $wilayah): JsonResponse
    {
        $wilayah->update($request->validated());

        return response()->json([
            'message' => 'Data wilayah berhasil diperbarui.',
            'data' => new WilayahResource($wilayah),
        ]);
    }

    public function destroy(Wilayah $wilayah): JsonResponse
    {
        $wilayah->delete();

        return response()->json([
            'message' => 'Data wilayah berhasil dihapus.',
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IntervensiRequest;
use App\Http\Resources\IntervensiResource;
use App\Models\DataRisiko;
use App\Models\Intervensi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntervensiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('search');
        $status = $request->query('status');
        $prioritas = $request->query('prioritas');
        $jenis = $request->query('jenis_intervensi');
        $wilayahId = $request->query('wilayah_id');

        $intervensi = Intervensi::with(['dataRisiko', 'wilayah', 'pembuat'])
            ->when($keyword, function ($query) use ($keyword) {
                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('judul', 'like', "%{$keyword}%")
                        ->orWhere('deskripsi', 'like', "%{$keyword}%")
                        ->orWhere('hasil_intervensi', 'like', "%{$keyword}%");
                });
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($prioritas, function ($query) use ($prioritas) {
                $query->where('prioritas', $prioritas);
            })
            ->when($jenis, function ($query) use ($jenis) {
                $query->where('jenis_intervensi', $jenis);
            })
            ->when($wilayahId, function ($query) use ($wilayahId) {
                $query->where('wilayah_id', $wilayahId);
            })
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Data intervensi berhasil diambil.',
            'data' => IntervensiResource::collection($intervensi),
        ]);
    }

    public function store(IntervensiRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $dataRisiko = DataRisiko::findOrFail($validated['data_risiko_id']);

        if ((int) $dataRisiko->wilayah_id !== (int) $validated['wilayah_id']) {
            return response()->json([
                'message' => 'Wilayah tidak sesuai dengan data risiko yang dipilih.',
            ], 422);
        }

        $intervensi = Intervensi::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        $intervensi->load(['dataRisiko', 'wilayah', 'pembuat']);

        return response()->json([
            'message' => 'Data intervensi berhasil ditambahkan.',
            'data' => new IntervensiResource($intervensi),
        ], 201);
    }

    public function show(Intervensi $intervensi): JsonResponse
    {
        $intervensi->load(['dataRisiko', 'wilayah', 'pembuat']);

        return response()->json([
            'message' => 'Detail intervensi berhasil diambil.',
            'data' => new IntervensiResource($intervensi),
        ]);
    }

    public function update(IntervensiRequest $request, Intervensi $intervensi): JsonResponse
    {
        $validated = $request->validated();

        $dataRisiko = DataRisiko::findOrFail($validated['data_risiko_id']);

        if ((int) $dataRisiko->wilayah_id !== (int) $validated['wilayah_id']) {
            return response()->json([
                'message' => 'Wilayah tidak sesuai dengan data risiko yang dipilih.',
            ], 422);
        }

        $intervensi->update($validated);

        $intervensi->load(['dataRisiko', 'wilayah', 'pembuat']);

        return response()->json([
            'message' => 'Data intervensi berhasil diperbarui.',
            'data' => new IntervensiResource($intervensi),
        ]);
    }

    public function destroy(Intervensi $intervensi): JsonResponse
    {
        $intervensi->delete();

        return response()->json([
            'message' => 'Data intervensi berhasil dihapus.',
        ]);
    }
}
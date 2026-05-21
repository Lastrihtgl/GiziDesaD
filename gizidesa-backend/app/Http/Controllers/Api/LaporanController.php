<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataRisiko;
use App\Models\Intervensi;
use App\Models\PanganLokal;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function ringkasan(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin_desa') {
            return response()->json([
                'message' => 'Akses laporan hanya diperbolehkan untuk Admin Desa.',
            ], 403);
        }

        $periode = $request->query('periode');
        $kategoriRisiko = $request->query('kategori_risiko');
        $statusIntervensi = $request->query('status_intervensi');

        $dataRisikoQuery = DataRisiko::with(['wilayah', 'pembuat'])
            ->when($periode, function ($query) use ($periode) {
                $query->where('periode', $periode);
            })
            ->when($kategoriRisiko, function ($query) use ($kategoriRisiko) {
                $query->where('kategori_risiko', $kategoriRisiko);
            });

        $intervensiQuery = Intervensi::with(['wilayah', 'dataRisiko', 'pembuat'])
            ->when($periode, function ($query) use ($periode) {
                $query->whereHas('dataRisiko', function ($dataRisikoQuery) use ($periode) {
                    $dataRisikoQuery->where('periode', $periode);
                });
            })
            ->when($statusIntervensi, function ($query) use ($statusIntervensi) {
                $query->where('status', $statusIntervensi);
            });

        $dataRisiko = $dataRisikoQuery
            ->clone()
            ->orderByDesc('skor_irs')
            ->get();

        $intervensi = $intervensiQuery
            ->clone()
            ->latest()
            ->get();

        $summary = [
            'total_wilayah' => Wilayah::count(),
            'total_pengguna' => User::count(),
            'total_admin' => User::where('role', 'admin_desa')->count(),
            'total_kader' => User::where('role', 'kader_posyandu')->count(),
            'total_bidan' => User::where('role', 'bidan_desa')->count(),

            'total_data_risiko' => $dataRisikoQuery->clone()->count(),
            'risiko_rendah' => $dataRisikoQuery->clone()->where('kategori_risiko', 'rendah')->count(),
            'risiko_sedang' => $dataRisikoQuery->clone()->where('kategori_risiko', 'sedang')->count(),
            'risiko_tinggi' => $dataRisikoQuery->clone()->where('kategori_risiko', 'tinggi')->count(),

            'total_pangan_lokal_aktif' => PanganLokal::where('is_active', true)->count(),

            'total_intervensi' => $intervensiQuery->clone()->count(),
            'intervensi_direncanakan' => $intervensiQuery->clone()->where('status', 'direncanakan')->count(),
            'intervensi_berjalan' => $intervensiQuery->clone()->where('status', 'berjalan')->count(),
            'intervensi_selesai' => $intervensiQuery->clone()->where('status', 'selesai')->count(),
            'intervensi_dibatalkan' => $intervensiQuery->clone()->where('status', 'dibatalkan')->count(),
        ];

        $wilayahPrioritas = $dataRisiko
            ->take(10)
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'wilayah' => [
                        'id' => $item->wilayah?->id,
                        'nama_dusun' => $item->wilayah?->nama_dusun,
                        'nama_rt' => $item->wilayah?->nama_rt,
                        'kode_wilayah' => $item->wilayah?->kode_wilayah,
                    ],
                    'periode' => $item->periode,
                    'skor_irs' => $item->skor_irs,
                    'kategori_risiko' => $item->kategori_risiko,
                    'faktor_dominan' => $item->faktor_dominan,
                    'rekomendasi_awal' => $item->rekomendasi_awal,
                ];
            })
            ->values();

        $rekapIntervensi = $intervensi
            ->take(10)
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'judul' => $item->judul,
                    'jenis_intervensi' => $item->jenis_intervensi,
                    'status' => $item->status,
                    'prioritas' => $item->prioritas,
                    'tanggal_rencana' => $item->tanggal_rencana?->format('Y-m-d'),
                    'tanggal_pelaksanaan' => $item->tanggal_pelaksanaan?->format('Y-m-d'),
                    'wilayah' => [
                        'id' => $item->wilayah?->id,
                        'nama_dusun' => $item->wilayah?->nama_dusun,
                        'nama_rt' => $item->wilayah?->nama_rt,
                        'kode_wilayah' => $item->wilayah?->kode_wilayah,
                    ],
                    'data_risiko' => [
                        'id' => $item->dataRisiko?->id,
                        'periode' => $item->dataRisiko?->periode,
                        'skor_irs' => $item->dataRisiko?->skor_irs,
                        'kategori_risiko' => $item->dataRisiko?->kategori_risiko,
                    ],
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Laporan ringkasan berhasil diambil.',
            'filter' => [
                'periode' => $periode,
                'kategori_risiko' => $kategoriRisiko,
                'status_intervensi' => $statusIntervensi,
            ],
            'summary' => $summary,
            'wilayah_prioritas' => $wilayahPrioritas,
            'rekap_intervensi' => $rekapIntervensi,
        ]);
    }
}
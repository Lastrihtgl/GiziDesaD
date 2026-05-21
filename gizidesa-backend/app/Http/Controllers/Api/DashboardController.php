<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataRisiko;
use App\Models\Intervensi;
use App\Models\PanganLokal;
use App\Models\Wilayah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalWilayah = Wilayah::count();
        $totalDataRisiko = DataRisiko::count();
        $totalPanganLokal = PanganLokal::where('is_active', true)->count();
        $totalIntervensi = Intervensi::count();

        $risikoRendah = DataRisiko::where('kategori_risiko', 'rendah')->count();
        $risikoSedang = DataRisiko::where('kategori_risiko', 'sedang')->count();
        $risikoTinggi = DataRisiko::where('kategori_risiko', 'tinggi')->count();

        $intervensiDirencanakan = Intervensi::where('status', 'direncanakan')->count();
        $intervensiBerjalan = Intervensi::where('status', 'berjalan')->count();
        $intervensiSelesai = Intervensi::where('status', 'selesai')->count();
        $intervensiDibatalkan = Intervensi::where('status', 'dibatalkan')->count();

        $wilayahPrioritas = DataRisiko::with(['wilayah', 'pembuat'])
            ->orderByDesc('skor_irs')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
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
            });

        $intervensiTerbaru = Intervensi::with(['wilayah', 'dataRisiko', 'pembuat'])
            ->latest()
            ->limit(5)
            ->get()
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
            });

        return response()->json([
            'message' => 'Dashboard berhasil diambil.',
            'role' => $user->role,
            'summary' => [
                'total_wilayah' => $totalWilayah,
                'total_data_risiko' => $totalDataRisiko,
                'total_pangan_lokal' => $totalPanganLokal,
                'total_intervensi' => $totalIntervensi,

                'risiko_rendah' => $risikoRendah,
                'risiko_sedang' => $risikoSedang,
                'risiko_tinggi' => $risikoTinggi,

                'intervensi_direncanakan' => $intervensiDirencanakan,
                'intervensi_berjalan' => $intervensiBerjalan,
                'intervensi_selesai' => $intervensiSelesai,
                'intervensi_dibatalkan' => $intervensiDibatalkan,
            ],
            'wilayah_prioritas' => $wilayahPrioritas,
            'intervensi_terbaru' => $intervensiTerbaru,
        ]);
    }
}
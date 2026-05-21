<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DataRisikoRequest;
use App\Http\Resources\DataRisikoResource;
use App\Models\DataRisiko;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataRisikoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $keyword = $request->query('search');
        $kategori = $request->query('kategori');
        $periode = $request->query('periode');

        $dataRisiko = DataRisiko::with(['wilayah', 'pembuat'])
            ->when($keyword, function ($query) use ($keyword) {
                $query->whereHas('wilayah', function ($wilayahQuery) use ($keyword) {
                    $wilayahQuery
                        ->where('nama_dusun', 'like', "%{$keyword}%")
                        ->orWhere('nama_rt', 'like', "%{$keyword}%")
                        ->orWhere('kode_wilayah', 'like', "%{$keyword}%");
                });
            })
            ->when($kategori, function ($query) use ($kategori) {
                $query->where('kategori_risiko', $kategori);
            })
            ->when($periode, function ($query) use ($periode) {
                $query->where('periode', $periode);
            })
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Data risiko berhasil diambil.',
            'data' => DataRisikoResource::collection($dataRisiko),
        ]);
    }

    public function store(DataRisikoRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $hasilIrs = $this->hitungIrs($validated);

        $dataRisiko = DataRisiko::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'skor_irs' => $hasilIrs['skor_irs'],
            'kategori_risiko' => $hasilIrs['kategori_risiko'],
            'faktor_dominan' => $hasilIrs['faktor_dominan'],
            'rekomendasi_awal' => $hasilIrs['rekomendasi_awal'],
        ]);

        $dataRisiko->load(['wilayah', 'pembuat']);

        return response()->json([
            'message' => 'Data risiko berhasil ditambahkan.',
            'data' => new DataRisikoResource($dataRisiko),
        ], 201);
    }

    public function show(DataRisiko $dataRisiko): JsonResponse
    {
        $dataRisiko->load(['wilayah', 'pembuat']);

        return response()->json([
            'message' => 'Detail data risiko berhasil diambil.',
            'data' => new DataRisikoResource($dataRisiko),
        ]);
    }

    public function update(DataRisikoRequest $request, DataRisiko $dataRisiko): JsonResponse
    {
        $validated = $request->validated();
        $hasilIrs = $this->hitungIrs($validated);

        $dataRisiko->update([
            ...$validated,
            'skor_irs' => $hasilIrs['skor_irs'],
            'kategori_risiko' => $hasilIrs['kategori_risiko'],
            'faktor_dominan' => $hasilIrs['faktor_dominan'],
            'rekomendasi_awal' => $hasilIrs['rekomendasi_awal'],
        ]);

        $dataRisiko->load(['wilayah', 'pembuat']);

        return response()->json([
            'message' => 'Data risiko berhasil diperbarui.',
            'data' => new DataRisikoResource($dataRisiko),
        ]);
    }

    public function destroy(DataRisiko $dataRisiko): JsonResponse
    {
        $dataRisiko->delete();

        return response()->json([
            'message' => 'Data risiko berhasil dihapus.',
        ]);
    }

    private function hitungIrs(array $data): array
    {
        $detailSkor = [
            'ibu_hamil_kek' => $this->hitungSkorProporsi(
                $data['jumlah_ibu_hamil_kek'],
                $data['jumlah_ibu_hamil']
            ),
            'anc_tidak_rutin' => $this->hitungSkorProporsi(
                $data['jumlah_ibu_hamil_anc_tidak_rutin'],
                $data['jumlah_ibu_hamil']
            ),
            'air_bersih' => $this->skorKategori($data['akses_air_bersih'], [
                'baik' => 0,
                'cukup' => 5,
                'buruk' => 10,
            ]),
            'sanitasi' => $this->skorKategori($data['kondisi_sanitasi'], [
                'baik' => 0,
                'cukup' => 5,
                'buruk' => 10,
            ]),
            'ekonomi' => $this->skorKategori($data['tingkat_ekonomi'], [
                'baik' => 0,
                'sedang' => 5,
                'rendah' => 10,
            ]),
            'akses_layanan' => $this->skorKategori($data['akses_layanan_kesehatan'], [
                'mudah' => 0,
                'cukup' => 5,
                'sulit' => 10,
            ]),
            'pangan_lokal' => $this->skorKategori($data['pemanfaatan_pangan_lokal'], [
                'baik' => 0,
                'cukup' => 5,
                'rendah' => 10,
            ]),
        ];

        $bobot = [
            'ibu_hamil_kek' => 0.20,
            'anc_tidak_rutin' => 0.15,
            'air_bersih' => 0.15,
            'sanitasi' => 0.15,
            'ekonomi' => 0.15,
            'akses_layanan' => 0.10,
            'pangan_lokal' => 0.10,
        ];

        $skorAkhir = 0;

        foreach ($detailSkor as $indikator => $skor) {
            $skorAkhir += $skor * $bobot[$indikator];
        }

        $skorAkhir = round($skorAkhir * 10, 2);

        $kategori = match (true) {
            $skorAkhir >= 70 => 'tinggi',
            $skorAkhir >= 40 => 'sedang',
            default => 'rendah',
        };

        $faktorDominan = array_search(max($detailSkor), $detailSkor, true);

        return [
            'skor_irs' => $skorAkhir,
            'kategori_risiko' => $kategori,
            'faktor_dominan' => $faktorDominan,
            'rekomendasi_awal' => $this->buatRekomendasi($faktorDominan, $kategori),
        ];
    }

    private function hitungSkorProporsi(int $jumlahMasalah, int $total): float
    {
        if ($total <= 0) {
            return 0;
        }

        $proporsi = ($jumlahMasalah / $total) * 100;

        return match (true) {
            $proporsi >= 50 => 10,
            $proporsi >= 25 => 5,
            default => 0,
        };
    }

    private function skorKategori(string $nilai, array $petaSkor): int
    {
        return $petaSkor[$nilai] ?? 0;
    }

    private function buatRekomendasi(string $faktorDominan, string $kategori): string
    {
        $rekomendasi = [
            'ibu_hamil_kek' => 'Prioritaskan pendampingan ibu hamil KEK, edukasi gizi, dan pemantauan konsumsi pangan bergizi.',
            'anc_tidak_rutin' => 'Dorong pemeriksaan ANC rutin melalui koordinasi kader dan bidan desa.',
            'air_bersih' => 'Prioritaskan edukasi penggunaan air bersih dan koordinasi perbaikan akses air layak.',
            'sanitasi' => 'Prioritaskan edukasi PHBS, pendataan jamban sehat, dan intervensi sanitasi lingkungan.',
            'ekonomi' => 'Dorong pemanfaatan bantuan sosial, pangan lokal, dan pendampingan keluarga rentan.',
            'akses_layanan' => 'Perkuat jadwal layanan posyandu, kunjungan rumah, dan koordinasi dengan bidan desa.',
            'pangan_lokal' => 'Optimalkan edukasi pangan lokal bergizi sesuai potensi desa.',
        ];

        $awalan = match ($kategori) {
            'tinggi' => 'Wilayah membutuhkan prioritas intervensi tinggi. ',
            'sedang' => 'Wilayah perlu pemantauan dan intervensi berkala. ',
            default => 'Wilayah berada pada risiko rendah, tetapi edukasi pencegahan tetap perlu dilakukan. ',
        };

        return $awalan . ($rekomendasi[$faktorDominan] ?? 'Lakukan pemantauan berkala berdasarkan kondisi wilayah.');
    }
}
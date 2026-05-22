<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DataRisikoController;
use App\Http\Controllers\Api\IntervensiController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\PanganLokalController;
use App\Http\Controllers\Api\WilayahController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'message' => 'GiziDesa API aktif.',
        'status' => 'ok',
    ]);
});

/* Public Authentication Routes */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*Protected Routes */
Route::middleware(['auth:sanctum'])->group(function () {

    /*Authenticated User*/
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /* Dashboard
    Dashboard boleh diakses semua role karena isi dashboard dapat disesuaikan berdasarkan role user yang sedang login. */
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('role:admin_desa,kader,bidan');

    /* Laporan
    Laporan utama hanya untuk admin desa karena berkaitan dengan rekapitulasi data program dan evaluasi keseluruhan. */
    Route::get('/laporan/ringkasan', [LaporanController::class, 'ringkasan'])
        ->middleware('role:admin_desa');

    /* Wilayah
    Semua role boleh membaca data wilayah karena wilayah dipakai untuk peta, input data, dan pemantauan. Namun tambah, ubah, dan hapus wilayah hanya dilakukan oleh admin desa. */
    Route::get('/wilayah', [WilayahController::class, 'index'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::get('/wilayah/{wilayah}', [WilayahController::class, 'show'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::post('/wilayah', [WilayahController::class, 'store'])
        ->middleware('role:admin_desa');

    Route::put('/wilayah/{wilayah}', [WilayahController::class, 'update'])
        ->middleware('role:admin_desa');

    Route::patch('/wilayah/{wilayah}', [WilayahController::class, 'update'])
        ->middleware('role:admin_desa');

    Route::delete('/wilayah/{wilayah}', [WilayahController::class, 'destroy'])
        ->middleware('role:admin_desa');

    /*
    Data Risiko
    Data risiko dapat dibaca oleh admin, kader, dan bidan.
    Kader dapat menambahkan data risiko karena kader bertugas mencatat data lapangan. 
    Admin juga dapat mengelola data. Bidan dapat membaca data untukvalidasi dan pemantauan kesehatan.
   */
    Route::get('/data-risiko', [DataRisikoController::class, 'index'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::get('/data-risiko/{data_risiko}', [DataRisikoController::class, 'show'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::post('/data-risiko', [DataRisikoController::class, 'store'])
        ->middleware('role:admin_desa,kader');

    Route::put('/data-risiko/{data_risiko}', [DataRisikoController::class, 'update'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::patch('/data-risiko/{data_risiko}', [DataRisikoController::class, 'update'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::delete('/data-risiko/{data_risiko}', [DataRisikoController::class, 'destroy'])
        ->middleware('role:admin_desa');

    /* Pangan Lokal
    Semua role boleh membaca pangan lokal karena dipakai untuk edukasi. Pengelolaan data pangan lokal hanya dilakukan oleh admin desa. */
    Route::get('/pangan-lokal', [PanganLokalController::class, 'index'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::get('/pangan-lokal/{pangan_lokal}', [PanganLokalController::class, 'show'])
        ->middleware('role:admin_desa,kader,bidan');

    Route::post('/pangan-lokal', [PanganLokalController::class, 'store'])
        ->middleware('role:admin_desa');

    Route::put('/pangan-lokal/{pangan_lokal}', [PanganLokalController::class, 'update'])
        ->middleware('role:admin_desa');

    Route::patch('/pangan-lokal/{pangan_lokal}', [PanganLokalController::class, 'update'])
        ->middleware('role:admin_desa');

    Route::delete('/pangan-lokal/{pangan_lokal}', [PanganLokalController::class, 'destroy'])
        ->middleware('role:admin_desa');

    /* Intervensi
    Intervensi dapat dibaca oleh admin dan bidan. Admin memantau program, sedangkan bidan mencatat dan menindaklanjuti pemantauan kesehatan. */
    Route::get('/intervensi', [IntervensiController::class, 'index'])
        ->middleware('role:admin_desa,bidan');

    Route::get('/intervensi/{intervensi}', [IntervensiController::class, 'show'])
        ->middleware('role:admin_desa,bidan');

    Route::post('/intervensi', [IntervensiController::class, 'store'])
        ->middleware('role:admin_desa,bidan');

    Route::put('/intervensi/{intervensi}', [IntervensiController::class, 'update'])
        ->middleware('role:admin_desa,bidan');

    Route::patch('/intervensi/{intervensi}', [IntervensiController::class, 'update'])
        ->middleware('role:admin_desa,bidan');

    Route::delete('/intervensi/{intervensi}', [IntervensiController::class, 'destroy'])
        ->middleware('role:admin_desa');
});
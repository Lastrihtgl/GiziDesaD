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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/laporan/ringkasan', [LaporanController::class, 'ringkasan']);

    Route::apiResource('/wilayah', WilayahController::class);
    Route::apiResource('/data-risiko', DataRisikoController::class);
    Route::apiResource('/pangan-lokal', PanganLokalController::class);
    Route::apiResource('/intervensi', IntervensiController::class);
});
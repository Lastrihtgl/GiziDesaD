<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pangan_lokal', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pangan', 100);
            $table->string('kategori', 50);
            $table->text('manfaat_gizi');
            $table->text('cara_pengolahan')->nullable();
            $table->string('ketersediaan', 50)->default('mudah_ditemukan');
            $table->decimal('estimasi_harga', 12, 2)->nullable();
            $table->text('catatan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('nama_pangan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pangan_lokal');
    }
};
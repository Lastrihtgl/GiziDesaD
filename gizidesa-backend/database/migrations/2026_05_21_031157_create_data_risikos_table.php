<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_risiko', function (Blueprint $table) {
            $table->id();

            $table->foreignId('wilayah_id')
                ->constrained('wilayah')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('periode', 7);

            $table->unsignedInteger('jumlah_ibu_hamil')->default(0);
            $table->unsignedInteger('jumlah_ibu_hamil_kek')->default(0);
            $table->unsignedInteger('jumlah_ibu_hamil_anc_tidak_rutin')->default(0);

            $table->string('akses_air_bersih', 20);
            $table->string('kondisi_sanitasi', 20);
            $table->string('tingkat_ekonomi', 20);
            $table->string('akses_layanan_kesehatan', 20);
            $table->string('pemanfaatan_pangan_lokal', 20);

            $table->decimal('skor_irs', 6, 2)->default(0);
            $table->string('kategori_risiko', 20)->default('rendah');
            $table->string('faktor_dominan', 50)->nullable();

            $table->text('rekomendasi_awal')->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->unique(['wilayah_id', 'periode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_risiko');
    }
};
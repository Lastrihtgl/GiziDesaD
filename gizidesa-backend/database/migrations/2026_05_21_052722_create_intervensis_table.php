<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intervensi', function (Blueprint $table) {
            $table->id();

            $table->foreignId('data_risiko_id')
                ->constrained('data_risiko')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('wilayah_id')
                ->constrained('wilayah')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('jenis_intervensi', 50);
            $table->string('judul', 150);
            $table->text('deskripsi');
            $table->date('tanggal_rencana')->nullable();
            $table->date('tanggal_pelaksanaan')->nullable();

            $table->string('status', 30)->default('direncanakan');
            $table->string('prioritas', 20)->default('sedang');

            $table->text('hasil_intervensi')->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->index(['wilayah_id', 'status']);
            $table->index(['data_risiko_id', 'jenis_intervensi']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intervensi');
    }
};
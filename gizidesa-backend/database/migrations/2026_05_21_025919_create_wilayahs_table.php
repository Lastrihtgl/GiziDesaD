<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wilayah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_dusun', 100);
            $table->string('nama_rt', 50);
            $table->string('kode_wilayah', 50)->unique();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['nama_dusun', 'nama_rt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wilayah');
    }
};
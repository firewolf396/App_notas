<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\EstudianteController;

class CreateNotasTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('notas')) {
            Schema::create('notas', function (Blueprint $table) {
                $table->id();
                $table->string('actividad', 100);
                $table->decimal('nota', 5, 2);
                $table->unsignedBigInteger('codEstudiante');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('notas');
    }
}
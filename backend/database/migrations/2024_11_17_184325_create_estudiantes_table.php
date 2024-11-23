<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\NotaController;
use App\Http\Controllers\EstudianteController;

class CreateEstudiantesTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('estudiantes')) {
            Schema::create('estudiantes', function (Blueprint $table) {
                $table->id('cod');
                $table->string('nombres', 250);
                $table->string('email', 250);
                $table->timestamps();
            });
        }
    }
    

    public function down()
    {
        Schema::dropIfExists('estudiantes');
    }
}
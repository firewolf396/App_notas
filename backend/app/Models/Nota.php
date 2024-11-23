<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nota extends Model
{
    use HasFactory;

    protected $fillable = ['actividad', 'nota', 'codEstudiante'];

    public $timestamps = false;


    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'codEstudiante');
    }
}

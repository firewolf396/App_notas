<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiantes';
    protected $primaryKey = 'cod';
    public $incrementing = false;
    protected $keyType = 'string'; 

    protected $fillable = ['cod', 'nombres', 'email'];
    
    public $timestamps = false;
    

    

    public function notas()
    {
        return $this->hasMany(Nota::class, 'codEstudiante');
    }
}
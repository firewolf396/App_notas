<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteNotaController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::get('/estudiantes', [EstudianteNotaController::class, 'indexEstudiantes']);
Route::get('/estudiantes/{id}', [EstudianteNotaController::class, 'showEstudiante']);
Route::post('/estudiantes', [EstudianteNotaController::class, 'storeEstudiante']);
Route::put('/estudiantes/{id}', [EstudianteNotaController::class, 'updateEstudiante']);
Route::delete('/estudiantes/{id}', [EstudianteNotaController::class, 'destroyEstudiante']);
Route::get('/estudiantes/filter', [EstudianteNotaController::class, 'filterEstudiantes']);

Route::get('/notas/{estudiante_id}', [EstudianteNotaController::class, 'indexNotas']);
Route::post('/notas/{estudiante_id}', [EstudianteNotaController::class, 'storeNota']);
Route::put('/notas/{id}', [EstudianteNotaController::class, 'updateNota']);
Route::delete('/notas/{id}', [EstudianteNotaController::class, 'destroyNota']);
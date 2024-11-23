<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\Nota;
use Illuminate\Http\Request;

class EstudianteNotaController extends Controller
{
    // === Estudiantes ===
    public function indexEstudiantes()
    {
        $estudiantes = Estudiante::all();
        return response()->json($estudiantes);
    }

    public function showEstudiante($id)
    {
        $estudiante = Estudiante::findOrFail($id);
        $notas = Nota::where('codEstudiante', $id)->get();

        $promedio = $notas->avg('nota');
        $estado = $promedio >= 3 ? 'Aprobado' : 'Perdió';

        return response()->json([
            'estudiante' => $estudiante,
            'notas' => $notas,
            'promedio' => $promedio,
            'estado' => $estado
        ]);
    }

    public function storeEstudiante(Request $request)
    {
        $request->validate([
            'cod' => 'required|unique:estudiantes,cod',
            'email' => 'required|email|unique:estudiantes,email',
            'nombres' => 'required|string|max:255',
        ]);

        $estudiante = Estudiante::create([
            'cod' => $request->cod,
            'email' => $request->email,
            'nombres' => $request->nombres,
        ]);

        return response()->json([
            'message' => 'Estudiante registrado con éxito',
            'data' => $estudiante
        ]);
    }

    public function updateEstudiante(Request $request, $id)
    {
        $estudiante = Estudiante::findOrFail($id);
    
        $request->validate([
            'cod' => 'required|unique:estudiantes,cod,' . $estudiante->cod . ',cod',
            'email' => 'required|email|unique:estudiantes,email,' . $estudiante->cod . ',cod',
            'nombres' => 'required|string|max:255',
        ]);
    
        $estudiante->update([
            'cod' => $request->cod,
            'email' => $request->email,
            'nombres' => $request->nombres,
        ]);
    
        return response()->json([
            'message' => 'Estudiante actualizado con éxito',
            'data' => $estudiante
        ]);
    }
    public function destroyEstudiante($id)
    {
        $estudiante = Estudiante::findOrFail($id);
        $notas = Nota::where('codEstudiante', $id)->count();

        if ($notas > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el estudiante porque tiene notas registradas.'
            ], 400);
        }

        $estudiante->delete();

        return response()->json(['message' => 'Estudiante eliminado con éxito']);
    }

    public function filterEstudiantes(Request $request)
    {
        $query = Estudiante::query();

        if ($request->has('codigo')) {
            $query->where('cod', $request->codigo);
        }
        if ($request->has('nombre')) {
            $query->where('nombres', 'like', '%' . $request->nombre . '%');
        }
        if ($request->has('email')) {
            $query->where('email', 'like', '%' . $request->email . '%');
        }
        if ($request->has('estado')) {
            $estado = $request->estado == 'Aprobado' ? 3 : 0;
            $query->whereHas('notas', function ($q) use ($estado) {
                $q->havingRaw('AVG(nota) >= ?', [$estado]);
            });
        }

        $estudiantes = $query->get();
        return response()->json($estudiantes);
    }

    // === Notas ===
    public function indexNotas($estudiante_id)
    {
        $notas = Nota::where('codEstudiante', $estudiante_id)->get();

        if ($notas->isEmpty()) {
            return response()->json(['message' => 'No hay notas registradas para este estudiante.'], 404);
        }

        return response()->json($notas);
    }

    public function storeNota(Request $request, $estudiante_id)
    {
        $request->validate([
            'actividad' => 'required',
            'nota' => 'required|numeric|min:0|max:5',
        ]);

        $estudiante = Estudiante::find($estudiante_id);
        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $nota = Nota::create([
            'actividad' => $request->actividad,
            'nota' => $request->nota,
            'codEstudiante' => $estudiante_id,
        ]);

        return response()->json(['message' => 'Nota registrada con éxito', 'data' => $nota], 201);
    }

    public function updateNota(Request $request, $id)
    {
        $nota = Nota::find($id);
        if (!$nota) {
            return response()->json(['message' => 'Nota no encontrada'], 404);
        }

        $request->validate([
            'actividad' => 'required',
            'nota' => 'required|numeric|min:0|max:5',
        ]);

        $nota->update([
            'actividad' => $request->actividad,
            'nota' => $request->nota,
        ]);

        return response()->json(['message' => 'Nota actualizada con éxito', 'data' => $nota]);
    }

    public function destroyNota($id)
    {
        $nota = Nota::find($id);
        if (!$nota) {
            return response()->json(['message' => 'Nota no encontrada'], 404);
        }

        $nota->delete();
        return response()->json(['message' => 'Nota eliminada con éxito']);
    }
}
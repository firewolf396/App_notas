// Referencias al DOM
const inputStudentCode = document.getElementById('input-student-code');
const searchStudentBtn = document.getElementById('search-student');
const studentSearchSection = document.getElementById('student-search');
const notesSection = document.getElementById('notes-section');
const studentCode = document.getElementById('student-code');
const studentName = document.getElementById('student-name');
const studentEmail = document.getElementById('student-email');
const studentStatus = document.getElementById('student-status');
const studentAverage = document.getElementById('student-average');
const notesList = document.getElementById('notes-list');
const belowThree = document.getElementById('below-three');
const aboveThree = document.getElementById('above-three');
const searchButton = document.getElementById('search-student-button');

const API_BASE_URL = "http://localhost:8000/api"; // Base URL de la API
let currentStudent = null; // Código del estudiante actual
let notes = []; // Lista de notas actual del estudiante

// Función para buscar un estudiante por código
async function searchStudent() {
    const studentId = inputStudentCode.value.trim(); // Obtén el código del input

    if (!studentId) {
        alert('Por favor ingrese un código de estudiante.');
        return;
    }

    try {
        // Obtener información del estudiante
        const response = await fetch(`${API_BASE_URL}/estudiantes/${studentId}`);
        if (!response.ok) throw new Error('No se encontró información para este estudiante.');

        const studentData = await response.json();

        // Actualizar información del estudiante
        studentCode.textContent = studentData.estudiante.cod;
        studentName.textContent = studentData.estudiante.nombres;
        studentEmail.textContent = studentData.estudiante.email;

        // Guarda el código del estudiante actual
        currentStudent = studentData.estudiante.cod;

        // Cargar notas del estudiante
        await loadStudentNotes(currentStudent);

        // Mostrar la sección de notas
        studentSearchSection.style.display = 'none';
        notesSection.style.display = 'block';
    } catch (error) {
        console.error(error);
        alert(error.message || 'Error al buscar el estudiante.');
    }
}


// Función para cargar las notas de un estudiante
async function loadStudentNotes(studentId) {
    try {
        // Asegúrate de que el studentId no sea undefined
        if (!studentId) {
            throw new Error('El código del estudiante no está definido.');
        }

        const response = await fetch(`${API_BASE_URL}/notas/${studentId}`);
        console.log('Cargando notas para:', studentId);
        console.log('Respuesta del servidor:', response);

        if (!response.ok) {
            throw new Error('No se pudieron cargar las notas del estudiante.');
        }

        notes = await response.json();

        // Convertir las notas a números si llegan como cadenas
        notes = notes.map(note => ({
            ...note,
            nota: parseFloat(note.nota)
        }));

        updateNotesTable();
        updateSummary();
    } catch (error) {
        console.error('Error al cargar las notas:', error);
        alert(error.message || 'Error al cargar las notas.');
    }
}



// Función para actualizar la tabla de notas
function updateNotesTable() {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${note.actividad}</td>
            <td class="${getHighlightClass(note.nota)}">${note.nota.toFixed(2)}</td>
            <td>
                <button onclick="editNote(${note.id})">Editar</button>
                <button onclick="deleteNote(${note.id})">Eliminar</button>
            </td>
        `;
        notesList.appendChild(row);
    });
}
let currentEditNoteId = null;  // Almacena el ID de la nota que se va a editar

// Función para abrir el formulario de edición con los datos de la nota
function editNote(noteId) {
    // Buscar la nota por su ID
    const note = notes.find(n => n.id === noteId);
    if (!note) {
        alert('Nota no encontrada');
        return;
    }

    // Rellenar los campos del formulario con los datos actuales de la nota
    document.getElementById('new-note-activity').value = note.actividad;
    document.getElementById('new-note-grade').value = note.nota.toFixed(2);

    // Cambiar el título del formulario a "Editar Nota"
    document.querySelector('h3').textContent = 'Editar Nota';
    
    // Guardar el ID de la nota que se va a editar
    currentEditNoteId = noteId;
}

// Función para manejar el envío del formulario de edición
document.getElementById('id-note-form').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevenir la recarga de la página al enviar el formulario

    const activity = document.getElementById('new-note-activity').value.trim();  // Cambié el ID
    const grade = parseFloat(document.getElementById('new-note-grade').value.trim());  // Cambié el ID

    // Validación básica
    if (!activity || isNaN(grade) || grade < 0 || grade > 5) {
        alert('Por favor ingrese una actividad válida y una nota entre 0 y 5.');
        return;
    }

    const noteData = {
        actividad: activity,
        nota: grade
    };

    try {
        // Si currentEditNoteId no es null, es una actualización, no una creación
        if (currentEditNoteId !== null) {
            // Realizar la solicitud PUT para actualizar la nota
            const response = await fetch(`${API_BASE_URL}/notas/${currentEditNoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) {
                throw new Error('No se pudo actualizar la nota.');
            }

            // Mostrar mensaje de éxito
            alert('Nota actualizada con éxito.');
            
            // Recargar las notas del estudiante después de actualizar
            await loadStudentNotes(currentStudent);

            // Limpiar el formulario después de guardar
            document.getElementById('note-form').reset();
            document.querySelector('h3').textContent = 'Agregar Nota'; // Restaurar el título
            currentEditNoteId = null;  // Restablecer el ID de edición

        } else {
            // Si currentEditNoteId es null, se está creando una nueva nota
            const response = await fetch(`${API_BASE_URL}/notas/${currentStudent}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) {
                throw new Error('No se pudo agregar la nota.');
            }

            // Mostrar mensaje de éxito
            alert('Nota agregada con éxito.');

            // Recargar las notas del estudiante después de agregar
            await loadStudentNotes(currentStudent);

            // Limpiar el formulario después de guardar
            document.getElementById('note-form').reset();
        }

    } catch (error) {
        console.error('Error al guardar la nota:', error);
        alert(error.message || 'Hubo un error al intentar guardar la nota.');
    }
});

// Función para eliminar la nota
async function deleteNote(noteId) {
    const confirmation = confirm('¿Estás seguro de que deseas eliminar esta nota?');

    if (!confirmation) return;

    try {
        // Realizar la solicitud DELETE
        const response = await fetch(`${API_BASE_URL}/notas/${noteId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('No se pudo eliminar la nota.');
        }

        // Mostrar mensaje de éxito
        alert('Nota eliminada con éxito.');

        // Recargar las notas del estudiante después de eliminar
        await loadStudentNotes(currentStudent);
    } catch (error) {
        console.error('Error al eliminar la nota:', error);
        alert(error.message || 'Hubo un error al intentar eliminar la nota.');
    }
}

// Event listener para cada botón de eliminar
document.querySelectorAll('.delete-note-btn').forEach(button => {
    button.addEventListener('click', function() {
        const noteId = this.closest('tr').dataset.id;  // Obtener el ID de la nota desde el atributo 'data-id'
        deleteNote(noteId);
    });
});


// Función para determinar el estilo de resaltado según la nota
function getHighlightClass(grade) {
    if (grade >= 0 && grade <= 2) return 'highlight-red';
    if (grade > 2 && grade < 3) return 'highlight-orange';
    if (grade >= 3 && grade < 4) return 'highlight-yellow';
    if (grade >= 4) return 'highlight-green';
    return '';
}

// Función para actualizar el resumen
function updateSummary() {
    const below = notes.filter(note => note.nota < 3).length;
    const above = notes.filter(note => note.nota >= 3).length;
    belowThree.textContent = below;
    aboveThree.textContent = above;

    // Actualizar el promedio
    const average = notes.reduce((sum, note) => sum + note.nota, 0) / notes.length || 0;
    studentAverage.textContent = average.toFixed(2);
    studentStatus.textContent = average < 3 ? 'Perdido' : 'Aprobado';
}

// Listener para el botón de búsqueda
searchStudentBtn.addEventListener('click', searchStudent);

document.getElementById('note-form').addEventListener('submit', async function(event) {
    event.preventDefault();  // Previene la recarga de la página al enviar el formulario

    const activity = document.getElementById('note-activity').value.trim();
    const grade = parseFloat(document.getElementById('note-grade').value.trim());

    // Validación básica
    if (!activity || isNaN(grade) || grade < 0 || grade > 5) {
        alert('Por favor ingrese una actividad válida y una nota entre 0 y 5.');
        return;
    }

    const noteData = {
        actividad: activity,
        nota: grade
    };

    try {
        const response = await fetch(`${API_BASE_URL}/notas/${currentStudent}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            throw new Error('Hubo un problema al guardar la nota.');
        }

        // Limpiar el formulario
        document.getElementById('note-form').reset();

        // Cargar las notas de nuevo
        await loadStudentNotes(currentStudent);

        // Mostrar un mensaje de éxito
        alert('Nota guardada con éxito.');

    } catch (error) {
        console.error('Error al guardar la nota:', error);
        alert(error.message || 'Hubo un error al intentar guardar la nota.');
    }
});

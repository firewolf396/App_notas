const API_URL = "http://localhost:8000/api/estudiantes";

// Referencias al DOM
const studentsTableBody = document.querySelector("#students-table tbody");
const approvedCount = document.getElementById("approved-count");
const failedCount = document.getElementById("failed-count");
const noNotesCount = document.getElementById("no-notes-count");
const registerForm = document.getElementById("register-form");
const updateForm = document.getElementById("update-form");
const filterInput = document.getElementById("filter-input");
const registerErrors = document.getElementById("register-errors");
const updateErrors = document.getElementById("update-errors");
// Botón de "Actualizar Lista"
document.getElementById("btn-refresh").addEventListener("click", () => {
    loadStudents();
});


// Función para obtener las notas de un estudiante y calcular su nota definitiva y estado
async function getStudentNotes(codigo) {
    let sumaNotas = 0; 
    let aux = 0;
    
    const notasIndividuales = [];
    try {
        const response = await fetch(`http://localhost:8000/api/notas/${codigo}`);
        const notas = await response.json();
        if (notas.length === 0) {
            return { finalNote: "No hay nota", status: "Sin notas" };
        }
        if (notas.length > 0) 
            { 
                
                
             // Array para almacenar solo las notas 
             notas.forEach(nota => { 
                const valorNota = parseFloat(nota.nota);
                sumaNotas += valorNota;
                notasIndividuales.push(valorNota);
                aux = aux + 1 ;
                  });};
        const finalNote = sumaNotas / aux;
        const status = finalNote >= 3 ? "Aprobó" : "Perdió";
       
        return { finalNote, status };
    } catch (error) {
        console.error(`Error al obtener las notas del estudiante ${codigo}:`, error);
        return { finalNote: "Error", status: "Error" };
    }

}

// Función para cargar la lista de estudiantes
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        // Limpiar tabla
        studentsTableBody.innerHTML = "";

        // Contadores
        let approved = 0, failed = 0, noNotes = 0;

        for (const student of students) {
            const { finalNote, status } = await getStudentNotes(student.cod);

            if (status === "Aprobó") approved++;
            else if (status === "Perdió") failed++;
            else noNotes++;

            // Crear fila para la tabla
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.cod}</td>
                <td>${student.nombres}</td>
                <td>${student.email}</td>
                <td>${finalNote}</td>
                <td>${status}</td>
                <td>
                    <button onclick="deleteStudent('${student.cod}')">Eliminar</button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        }

        // Actualizar estadísticas
        approvedCount.textContent = approved;
        failedCount.textContent = failed;
        noNotesCount.textContent = noNotes;
    } catch (error) {
        console.error("Error al cargar estudiantes:", error);
    }
}


// Función para registrar un estudiante
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cod = document.getElementById("register-code").value;
    const nombres = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;

    // Validación del email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        registerErrors.textContent = "El formato del correo electrónico es inválido.";
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cod, nombres, email }),
        });

        if (!response.ok) {
            const error = await response.json();
            registerErrors.textContent = error.message;
            return;
        }

        registerErrors.textContent = "";
        alert("Estudiante registrado correctamente.");
        loadStudents();
    } catch (error) {
        console.error("Error al registrar estudiante:", error);
    }
});

// Función para actualizar un estudiante
updateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cod = document.getElementById("update-code").value;
    const nombres = document.getElementById("update-name").value;
    const email = document.getElementById("update-email").value;

    // Validación del email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        updateErrors.textContent = "El formato del correo electrónico es inválido.";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${cod}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cod, nombres, email }),
        });

        if (!response.ok) {
            const error = await response.json();
            updateErrors.textContent = error.message;
            return;
        }

        updateErrors.textContent = "";
        alert("Estudiante actualizado correctamente.");
        loadStudents();
    } catch (error) {
        console.error("Error al actualizar estudiante:", error);
    }
});

// Función para eliminar un estudiante
async function deleteStudent(cod) {
    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar este estudiante?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${cod}`, { method: "DELETE" });

        if (!response.ok) {
            alert("No se puede eliminar un estudiante con notas registradas.");
            return;
        }

        alert("Estudiante eliminado.");
        loadStudents();
    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
    }
}

// Función para filtrar estudiantes
document.getElementById("btn-filter").addEventListener("click", () => {
    const filter = filterInput.value.toLowerCase();
    const rows = studentsTableBody.querySelectorAll("tr");

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
});

// Cargar lista al inicio
loadStudents();

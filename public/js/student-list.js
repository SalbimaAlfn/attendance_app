console.log("student-list.js is loaded")
async function loadStudents(search = "") {

    const response =
    await fetch(
        `/api/students?search=${search}`
    );
    const students =
        await response.json();

    const table =
        document.getElementById("studentTable");

    table.innerHTML = "";

    students.forEach(student => {

        table.innerHTML += `
    <tr>
        <td>${student.id}</td>
        <td>${student.student_code}</td>
        <td>${student.name}</td>
        <td>${student.class_name}</td>
        <td>

    <button
        onclick="editStudent(${student.id})"
    >
        Edit
    </button>

    <button
        onclick="generateQR(${student.id})"
    >
        QR
    </button>

    <button
        onclick="deleteStudent(${student.id})"
    >
        Delete
    </button>

</td>
    </tr>
`;

    });

}

loadStudents();
async function deleteStudent(id) {

    const confirmDelete =
        confirm("Delete this student?");

    if (!confirmDelete) {
        return;
    }

    const response =
        await fetch(
            `/api/students/${id}`,
            {
                method: "DELETE"
            }
        );

    const result =
        await response.json();

    alert(result.message);

    loadStudents();

}

function editStudent(id) {

    window.location.href =
        `/edit-student/${id}`;

}
async function generateQR(id) {

    const response =
        await fetch(
            `/api/students/${id}/generate-qr`,
            {
                method: "POST"
            }
        );

    console.log("Status:", response.status);

    const result =
        await response.json();

    console.log("Result:", result);

    alert(
        result.message ||
        result.error ||
        "No message returned"
    );

}

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        (e) => {

            loadStudents(
                e.target.value
            );

        }
    );
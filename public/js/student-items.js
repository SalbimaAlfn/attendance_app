const studentId =
    window.location.pathname
    .split("/")
    .pop();

async function loadStudent() {

    const response =
        await fetch(
            `/api/students/${studentId}`
        );

    const student =
        await response.json();

    document.getElementById(
        "studentName"
    ).innerText =
        `${student.name} (${student.class_name})`;

}

async function loadItemTypes() {

    const response =
        await fetch("/api/items");

    const items =
        await response.json();

    const select =
        document.getElementById(
            "itemSelect"
        );

    select.innerHTML = "";

    items.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.item_name}
            </option>
        `;

    });

}


async function loadStudentItems() {

    const response =
        await fetch(
            `/api/student-items/${studentId}`
        );

    const items =
        await response.json();

    const table =
        document.getElementById(
            "itemsTable"
        );

    table.innerHTML = "";

    items.forEach(item => {

     table.innerHTML += `
    <tr>
        <td>${item.id}</td>
        <td>${item.item_name}</td>
        <td>${item.item_label || ""}</td>
       <td>

<select
    onchange="
        updateStatus(
            ${item.id},
            this.value
        )
    "
>

<option
    value="Owned"
    ${item.status === "Owned"
        ? "selected"
        : ""}
>
    Owned
</option>

<option
    value="Lost"
    ${item.status === "Lost"
        ? "selected"
        : ""}
>
    Lost
</option>

<option
    value="Damaged"
    ${item.status === "Damaged"
        ? "selected"
        : ""}
>
    Damaged
</option>

<option
    value="Replaced"
    ${item.status === "Replaced"
        ? "selected"
        : ""}
>
    Replaced
</option>

</select>

</td>
        <td>
            <button
                onclick="deleteItem(${item.id})"
            >
                Delete
            </button>
        </td>
    </tr>
`;

    });

}

async function updateStatus(
    id,
    status
) {

    const response =
        await fetch(
            `/api/student-items/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        status
                    })
            }
        );

    const result =
        await response.json();

    console.log(result);

}

async function deleteItem(id) {

    const confirmDelete =
        confirm("Delete this item?");

    if (!confirmDelete) {
        return;
    }

    const response =
        await fetch(
            `/api/student-items/${id}`,
            {
                method: "DELETE"
            }
        );

    const result =
        await response.json();

    alert(result.message);

    loadStudentItems();

}

async function addItem() {

    const data = {

        student_id:
            studentId,

        item_type_id:
            document.getElementById(
                "itemSelect"
            ).value,

        item_label:
            document.getElementById(
                "itemLabel"
            ).value

    };
    console.log(data);

    const response =
        await fetch(
            "/api/student-items",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(data)
            }
        );

    const result =
        await response.json();

    alert(result.message);

    document.getElementById(
        "itemLabel"
    ).value = "";

    loadStudentItems();

}

loadStudent();
loadItemTypes();
loadStudentItems();
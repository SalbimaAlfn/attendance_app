const id =
    window.location.pathname.split("/").pop();

async function loadStudent() {

    const response =
        await fetch(`/api/students/${id}`);

    const student =
        await response.json();

    document.getElementById(
        "student_code"
    ).value = student.student_code;

    document.getElementById(
        "name"
    ).value = student.name;

    document.getElementById(
        "class_name"
    ).value = student.class_name;

}

loadStudent();

document
    .getElementById("editForm")
    .addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const data = {

                name:
                    document.getElementById("name").value,

                class_name:
                    document.getElementById("class_name").value

            };

            const response =
                await fetch(
                    `/api/students/${id}`,
                    {
                        method: "PUT",
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

            window.location.href =
                "/students";

        }
    );
const form =
    document.getElementById("studentForm");

if (form) {

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const data = {
                student_code:
                    document.getElementById("student_code").value,

                name:
                    document.getElementById("name").value,

                class_name:
                    document.getElementById("class_name").value
            };

            const response =
                await fetch("/students", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(data)
                });

            const result =
                await response.json();

            alert(result.message);

        }
    );

}
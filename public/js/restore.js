document
.getElementById("restoreForm")
.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        if (
            !confirm(
                "This will replace the current database. Continue?"
            )
        ) {
            return;
        }

        const formData =
            new FormData();

        formData.append(
            "backup",
            document
                .getElementById(
                    "backupFile"
                )
                .files[0]
        );

        const response =
            await fetch(
                "/api/restore-database",
                {
                    method: "POST",
                    body: formData
                }
            );

        const result =
            await response.json();

        alert(result.message);

    }
);
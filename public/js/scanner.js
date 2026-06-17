function onScanSuccess(decodedText) {

    fetch(
        "/api/attendance/scan",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                student_code:
                    decodedText
            })
        }
    )
    .then(res => res.json())
    .then(data => {

        const result =
            document.getElementById(
                "result"
            );

        if (
            data.alreadyPresent
        ) {

            result.innerHTML = `
                <h3>
                    Already Present Today
                </h3>

                <p>
                    ${data.student.name}
                </p>

                <p>
                    Class:
                    ${data.student.class_name}
                </p>
            `;

            return;
        }

        result.innerHTML = `
            <h3>
                Attendance Saved
            </h3>

            <p>
                ${data.student.name}
            </p>

            <p>
                Class:
                ${data.student.class_name}
            </p>
        `;

    });

}

const html5QrCode =
    new Html5Qrcode(
        "reader"
    );

html5QrCode.start(
    {
        facingMode: "environment"
    },
    {
        fps: 10,
        qrbox: 250
    },
    onScanSuccess
);
function manualScan() {

    const code =
        document.getElementById(
            "manualCode"
        ).value;

    onScanSuccess(code);

}
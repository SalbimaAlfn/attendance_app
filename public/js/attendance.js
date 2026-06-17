async function loadAttendance() {

    const response =
        await fetch(
            "/api/attendance"
        );

    const attendance =
        await response.json();

    const table =
        document.getElementById(
            "attendanceTable"
        );

    table.innerHTML = "";

    attendance.forEach(record => {

        table.innerHTML += `
            <tr>
                <td>
                    ${record.attendance_date}
                </td>

                <td>
                    ${record.attendance_time}
                </td>

                <td>
                    ${record.name}
                </td>

                <td>
                    ${record.class_name}
                </td>

                <td>
                    ${record.status}
                </td>
            </tr>
        `;

    });

}


function exportAttendance() {

    const date =
        document.getElementById(
            "filterDate"
        ).value;

    let url =
        "/api/attendance/export";

    if (date) {

        url +=
            `?date=${date}`;

    }

    window.location.href =
        url;

}
async function loadAttendance(date = "") {

    let url =
        "/api/attendance";

    if (date) {

        url +=
            `?date=${date}`;

    }

    const response =
        await fetch(url);

    const attendance =
        await response.json();

    const table =
        document.getElementById(
            "attendanceTable"
        );

    table.innerHTML = "";

    attendance.forEach(record => {

        table.innerHTML += `
            <tr>
                <td>${record.attendance_date}</td>
                <td>${record.attendance_time}</td>
                <td>${record.name}</td>
                <td>${record.class_name}</td>
                <td>${record.status}</td>
            </tr>
        `;

    });

}
function searchAttendance() {

    const date =
        document.getElementById(
            "filterDate"
        ).value;

    loadAttendance(date);

}

function clearFilter() {

    document.getElementById(
        "filterDate"
    ).value = "";

    loadAttendance();

}
loadAttendance();

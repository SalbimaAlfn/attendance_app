async function loadDashboard() {

    const response =
        await fetch(
            "/api/dashboard"
        );

    const data =
        await response.json();

    document.getElementById(
        "totalStudents"
    ).textContent =
        data.totalStudents;

    document.getElementById(
        "presentToday"
    ).textContent =
        data.presentToday;

    document.getElementById(
        "absentToday"
    ).textContent =
        data.absentToday;

}

loadDashboard();
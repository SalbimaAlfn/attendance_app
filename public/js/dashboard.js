async function loadDashboard() {

    const response =
        await fetch("/api/dashboard");

    const data =
        await response.json();

    document.getElementById(
        "totalStudents"
    ).innerText =
        `Total Students: ${data.totalStudents}`;

    document.getElementById(
        "presentToday"
    ).innerText =
        `Present Today: ${data.presentToday}`;

    document.getElementById(
        "absentToday"
    ).innerText =
        `Absent Today: ${data.absentToday}`;

    document.getElementById(
        "lostItems"
    ).innerText =
        `Lost Items: ${data.lostItems}`;

    document.getElementById(
        "damagedItems"
    ).innerText =
        `Damaged Items: ${data.damagedItems}`;

}

loadDashboard();
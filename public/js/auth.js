if (
    localStorage.getItem("loggedIn")
    !== "true"
) {

    window.location.href =
        "/login";

}

function logout() {

    localStorage.removeItem(
        "loggedIn"
    );

    window.location.href =
        "/login";

}
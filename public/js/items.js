async function loadItems() {

    const response =
        await fetch("/api/items");

    const items =
        await response.json();

    const table =
        document.getElementById(
            "itemTable"
        );

    table.innerHTML = "";

    items.forEach(item => {

        table.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.item_name}</td>
                <td>${item.description || ""}</td>
                <td>
    <button
        onclick="editItem(${item.id})"
    >
        Edit
    </button>

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

loadItems();

document
    .getElementById("itemForm")
    .addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const data = {

                item_name:
                    document.getElementById(
                        "item_name"
                    ).value,

                description:
                    document.getElementById(
                        "description"
                    ).value

            };

            const response =
                await fetch(
                    "/api/items",
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

            loadItems();

            document
                .getElementById(
                    "itemForm"
                )
                .reset();

        }
    );

    async function deleteItem(id) {

    const confirmDelete =
        confirm("Delete this item type?");

    if (!confirmDelete) {
        return;
    }

    const response =
        await fetch(
            `/api/items/${id}`,
            {
                method: "DELETE"
            }
        );

    const result =
        await response.json();

    alert(result.message);

    loadItems();

}
async function editItem(id) {

    const newName =
        prompt("New item name:");

    if (!newName) {
        return;
    }

    const response =
        await fetch(
            `/api/items/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        item_name:
                            newName
                    })
            }
        );

    const result =
        await response.json();

    alert(result.message);

    loadItems();

}
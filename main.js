fetch("http://localhost:3000/users")
    .then(response => response.json())
    .then(data => adatbetoltes(data))
    .catch(error => console.error("Hiba az adatok betöltésekor:", error));

let kivalasztottFelhasznaloId = null;

function adatbetoltes(data){
    console.table(data)

    const tbody = document.getElementById("users-body");
    const mezok = ["name", "email", "phone", "city", "role"];

    tbody.replaceChildren();
    kivalasztottFelhasznaloId = null;
    document.getElementById("delete-user").hidden = true;

    data.forEach(felhasznalo => {
        const sor = document.createElement("tr");
        sor.dataset.userId = felhasznalo.id;
        sor.addEventListener("click", () => {
            kivalasztottFelhasznaloId = felhasznalo.id;
            document.getElementById("delete-user").hidden = false;
            document.getElementById("name").value = felhasznalo.name;
            document.getElementById("email").value = felhasznalo.email;
            document.getElementById("phone").value = felhasznalo.phone;
            document.getElementById("city").value = felhasznalo.city;
            document.getElementById("role").value = felhasznalo.role;

            tbody.querySelectorAll("tr").forEach(elem => elem.classList.remove("table-active"));
            sor.classList.add("table-active");
        });

        mezok.forEach(mezo => {
            const cella = document.createElement("td");
            cella.textContent = felhasznalo[mezo] ?? "-";
            sor.appendChild(cella);
        });

        tbody.appendChild(sor);
    });
}

async function addUser(){
    const felhasznalo = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        city: document.getElementById("city").value.trim(),
        role: document.getElementById("role").value.trim()
    };

    if (Object.values(felhasznalo).every(ertek => ertek === "")) {
        alert("Adj meg legalább egy adatot a felhasználó hozzáadásához.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(felhasznalo)
        });

        if (!response.ok) {
            throw new Error(`A felhasználó mentése sikertelen: ${response.status}`);
        }

        const usersResponse = await fetch("http://localhost:3000/users");
        if (!usersResponse.ok) {
            throw new Error(`Az adatok frissítése sikertelen: ${usersResponse.status}`);
        }

        adatbetoltes(await usersResponse.json());
    } catch (error) {
        console.error("Hiba a felhasználó hozzáadásakor:", error);
    }
}

async function editUser(){
    const felhasznalo = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        city: document.getElementById("city").value.trim(),
        role: document.getElementById("role").value.trim()
    };

    if (kivalasztottFelhasznaloId === null || kivalasztottFelhasznaloId === undefined) {
        alert("Szerkesztés előtt válassz ki egy felhasználót a táblázatból.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/${kivalasztottFelhasznaloId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(felhasznalo)
        });

        if (!response.ok) {
            throw new Error(`A felhasználó módosítása sikertelen: ${response.status}`);
        }

        const usersResponse = await fetch("http://localhost:3000/users");
        if (!usersResponse.ok) {
            throw new Error(`Az adatok frissítése sikertelen: ${usersResponse.status}`);
        }

        adatbetoltes(await usersResponse.json());
    } catch (error) {
        console.error("Hiba a felhasználó módosításakor:", error);
    }
}

async function deleteUser(){
    if (kivalasztottFelhasznaloId === null || kivalasztottFelhasznaloId === undefined) {
        console.error("Törlés előtt válassz ki egy felhasználót a táblázatból.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/users/${kivalasztottFelhasznaloId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`A felhasználó törlése sikertelen: ${response.status}`);
        }

        const usersResponse = await fetch("http://localhost:3000/users");
        if (!usersResponse.ok) {
            throw new Error(`Az adatok frissítése sikertelen: ${usersResponse.status}`);
        }

        adatbetoltes(await usersResponse.json());
    } catch (error) {
        console.error("Hiba a felhasználó törlésekor:", error);
    }
}

function urites(){
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("city").value = "";
    document.getElementById("role").value = "";

    document.querySelectorAll("#users-body tr.table-active").forEach(sor => {
        sor.classList.remove("table-active");
    });
    kivalasztottFelhasznaloId = null;
    document.getElementById("delete-user").hidden = true;
}
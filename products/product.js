const termekUrl = "http://localhost:3000/products";

document.getElementById("product-form").addEventListener("submit", ujTermekHozzaadasa);
termekekBetoltese();

async function termekekBetoltese() {
    try {
        const response = await fetch(termekUrl);

        if (!response.ok) {
            throw new Error("A termékek betöltése nem sikerült.");
        }

        const data = await response.json();
        adatbetoltes(data);
    } catch (error) {
        console.error("Hiba az adatok betöltésekor:", error);
    }
}

async function ujTermekHozzaadasa(event) {
    event.preventDefault();

    const ujTermek = {
        name: document.getElementById("product-name").value.trim(),
        price: Number(document.getElementById("product-price").value),
        stock: Number(document.getElementById("product-stock").value),
        rating: Number(document.getElementById("product-rating").value),
        manufacturer: {
            name: document.getElementById("manufacturer-name").value.trim(),
            country: document.getElementById("manufacturer-country").value.trim()
        },
        image: document.getElementById("product-image").value.trim(),
        features: document.getElementById("product-features").value
            .split(",")
            .map(function (jellemzo) {
                return jellemzo.trim();
            })
            .filter(function (jellemzo) {
                return jellemzo !== "";
            })
    };

    const uzenet = document.getElementById("product-form-message");

    try {
        const response = await fetch(termekUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ujTermek)
        });

        if (!response.ok) {
            throw new Error("A termék mentése nem sikerült.");
        }

        document.getElementById("product-form").reset();
        await termekekBetoltese();
        uzenet.textContent = "A termék sikeresen hozzáadva.";
    } catch (error) {
        console.error("Hiba a termék hozzáadásakor:", error);
        uzenet.textContent = "A terméket nem sikerült hozzáadni.";
    }
}

async function termekTorlese(product) {
    const biztosTorles = confirm("Biztosan törlöd ezt a terméket: " + product.name + "?");

    if (!biztosTorles) {
        return;
    }

    try {
        const response = await fetch(termekUrl + "/" + product.id, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("A termék törlése nem sikerült.");
        }

        document.getElementById("product-details").hidden = true;
        await termekekBetoltese();
    } catch (error) {
        console.error("Hiba a termék törlésekor:", error);
        alert("A terméket nem sikerült törölni.");
    }
}

function adatbetoltes(data) {
    console.log(data)
    const termekLista = document.getElementById("product-list");
    const reszletekPanel = document.getElementById("product-details");
    const reszletekCim = document.getElementById("product-details-title");
    const reszletekTartalom = document.getElementById("product-details-content");
    let kivalasztottTermekId = null;
    const mezokNevei = {
        price: "Ár (Ft)",
        stock: "Készlet (db)",
        rating: "Értékelés",
        manufacturer: "Gyártó",
        features: "Jellemzők"
    };

    termekLista.replaceChildren();

    data.forEach(product => {
        const oszlop = document.createElement("div");
        oszlop.className = "product-column";

        const kartya = document.createElement("article");
        kartya.className = "card h-100";

        const kep = document.createElement("img");
        kep.className = "card-img-top product-image";
        kep.src = product.image;
        kep.alt = product.name;

        const kartyaTorzs = document.createElement("div");
        kartyaTorzs.className = "card-body d-flex flex-column";

        const cim = document.createElement("h2");
        cim.className = "card-title h5";
        cim.textContent = product.name || "Névtelen termék";

        const ar = document.createElement("p");
        ar.className = "fw-bold";
        ar.textContent = product.price != null ? `${product.price} Ft` : "Ár nincs megadva";

        const reszletek = document.createElement("button");
        reszletek.type = "button";
        reszletek.className = "btn btn-primary product-details-button";
        reszletek.textContent = "Részletek";
        reszletek.setAttribute("aria-controls", "product-details");
        reszletek.setAttribute("aria-expanded", "false");

        reszletek.addEventListener("click", function () {
            if (kivalasztottTermekId === product.id && !reszletekPanel.hidden) {
                reszletekPanel.hidden = true;
                kivalasztottTermekId = null;
                reszletek.textContent = "Részletek";
                reszletek.setAttribute("aria-expanded", "false");
                return;
            }

            document.querySelectorAll(".product-details-button").forEach(function (gomb) {
                gomb.textContent = "Részletek";
                gomb.setAttribute("aria-expanded", "false");
            });

            kivalasztottTermekId = product.id;
            reszletekCim.textContent = "Részletek: " + product.name;
            reszletekTartalom.replaceChildren();

            Object.entries(mezokNevei).forEach(function ([kulcs, mezoNev]) {
                const sor = document.createElement("p");
                sor.className = "mb-2";

                const cimke = document.createElement("strong");
                cimke.textContent = mezoNev + ": ";

                const adat = document.createElement("span");
                adat.textContent = ertekSzoveggeAlakitasa(product[kulcs]);

                sor.append(cimke, adat);
                reszletekTartalom.append(sor);
            });

            reszletekPanel.hidden = false;
            reszletek.textContent = "Elrejtés";
        });

        const torles = document.createElement("button");
        torles.type = "button";
        torles.className = "btn btn-danger";
        torles.textContent = "Törlés";
        torles.addEventListener("click", function () {
            termekTorlese(product);
        });

        const gombok = document.createElement("div");
        gombok.className = "d-flex gap-2 mt-auto";
        gombok.append(reszletek, torles);

        kartyaTorzs.append(cim, ar, gombok);
        kartya.append(kep, kartyaTorzs);
        oszlop.append(kartya);
        termekLista.append(oszlop);
    });
}

function ertekSzoveggeAlakitasa(ertek) {
    if (ertek === null || ertek === undefined || ertek === "") {
        return "Nincs adat";
    }

    if (Array.isArray(ertek)) {
        return ertek.length > 0 ? ertek.join(", ") : "Nincs adat";
    }

    if (typeof ertek === "object") {
        return Object.entries(ertek)
            .map(function ([kulcs, adat]) {
                return kulcs + ": " + adat;
            })
            .join(", ");
    }

    return String(ertek);
}
const popupDialog = document.getElementById("popupDialog");
const closePopUp = document.getElementById("closePopUp");
const newsTitle = document.getElementById("newsTitle");
const newsContent = document.getElementById("newsContent");
const newsAuthor = document.getElementById("newsAuthor");
const newsPublish = document.getElementById("newsDate");
const newsCategory = document.getElementById("newsCategory");

closePopUp.addEventListener("click", () => {
    popupDialog.close(); // Menutup pop-up
});

document.getElementById("inputForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Mencegah pengiriman formulir standar
    const dataTable = document.getElementById("data-table");
    const pages = document.getElementById("pages").value;
    const date1 = document.getElementById("date1").value;
    const date2 = document.getElementById("date2").value;
    const dateNow = new Date();
    const dateElem = document.getElementById("dateShow");

    function getMonth(date10) {
        var date1 = new Date(date10);
        var options = { year: "numeric", month: "long", day: "numeric" };
        var month = date1.toLocaleDateString("en-US", options); // Menggunakan 'id-ID' untuk menampilkan nama bulan dalam bahasa Indonesia
        return month.split(" ")[0];
    }

    const mth1 = getMonth(date1);
    const mth2 = getMonth(date2);
    if (date1 === "" || date2 === "") {
        var konfirm = confirm("Data shown will be the latest");

        if (konfirm === true) {
            const dateShow = (dateElem.textContent = "Crawl Data Date :" + dateNow.toLocaleString());
            fetch("/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                mode: "cors",
                body: JSON.stringify({ pages, date1, date2, mth1, mth2 }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data === false) {
                        alert("Pages yang Anda masukkan melebihi dari yang tersedia");
                    }
                    data.forEach((result) => {
                        const row = dataTable.insertRow();
                        const URL = result.url;
                        let getNews, getTitle, getAuthor, getDate, getCategory;
                        row.insertCell(0).textContent = result.id;
                        row.insertCell(1).textContent = result.title;
                        row.insertCell(2).textContent = result.category;
                        row.insertCell(3).textContent = result.date;
                        row.insertCell(4).innerHTML = `<a href="${result.url}" target="_blank">${result.url}</a>`;
                        const contentBtn = row.insertCell(5);
                        const btn = document.createElement("button");
                        btn.textContent = "View Content";
                        btn.addEventListener("click", function () {

                            fetch("/content", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                mode: "cors",
                                body: JSON.stringify({ URL }),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    data.forEach((result) => {
                                        getNews = result.content;
                                        getTitle = result.title;
                                        getAuthor = result.author;
                                        getDate = result.date;
                                        getCategory = result.category;
                                        newsTitle.textContent = getTitle;
                                        newsContent.textContent = getNews;
                                        newsAuthor.textContent = getAuthor;
                                        newsPublish.textContent = getDate;
                                        newsCategory.textContent = getCategory;
                                        popupDialog.showModal();
                                    });
                                })
                                .catch((error) => {
                                    console.error("Terjadi kesalahan:", error);
                                });
                        });
                        contentBtn.appendChild(btn);
                    });
                })
                .catch((error) => {
                    console.error("Terjadi kesalahan:", error);
                });
        }
    } else {
        const dateShow = (dateElem.textContent = `Data Crawl Date : ${date2} - ${date1}`);
        fetch("/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            body: JSON.stringify({ pages, date1, date2, mth1, mth2 }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === false) {
                    alert("Pages yang Anda masukkan melebihi dari yang tersedia");
                }
                data.forEach((result) => {
                    const row = dataTable.insertRow();
                    const URL = result.url;
                    let getNews, getTitle, getAuthor, getDate, getCategory;
                    row.insertCell(0).textContent = result.id;
                    row.insertCell(1).textContent = result.title;
                    row.insertCell(2).textContent = result.category;
                    row.insertCell(3).textContent = result.date;
                    row.insertCell(4).innerHTML = `<a href="${result.url}" target="_blank">${result.url}</a>`;
                    const contentBtn = row.insertCell(5);
                    const btn = document.createElement("button");
                    btn.id = "popUpContent";
                    btn.textContent = "View Content";
                    btn.addEventListener("click", function () {
                        fetch("/content", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            mode: "cors",
                            body: JSON.stringify({ URL }),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                data.forEach((result) => {
                                    getNews = result.content;
                                    getTitle = result.title;
                                    getAuthor = result.author;
                                    getDate = result.date;
                                    getCategory = result.category;
                                    newsTitle.textContent = getTitle;
                                    newsContent.textContent = getNews;
                                    newsAuthor.textContent = getAuthor;
                                    newsPublish.textContent = getDate;
                                    newsCategory.textContent = getCategory;
                                    popupDialog.showModal();
                                });
                            })
                            .catch((error) => {
                                console.error("Terjadi kesalahan:", error);
                            });
                    });
                    contentBtn.appendChild(btn);
                });
            })
            .catch((error) => {
                console.error("Terjadi kesalahan:", error);
            });
    }
});
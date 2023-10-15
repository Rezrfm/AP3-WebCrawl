const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const port = 3000;
let nomor = 0;

app.use(express.static("public")); // Menggunakan folder 'public' untuk file statis (HTML, CSS, JS)
app.use(express.json());

const headers = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
};

// URL artikel yang akan di-crawl
async function crawlPage(url) {
	try {
		let data = [];
		const response = await axios.get(url, { headers });
		const $ = cheerio.load(response.data);
		$(
			"body > div:nth-child(5) > div > div > div.col-bs10-7 > section > div.latest__wrap  div.latest__right",
		).each((index, element) => {
			const href = $(element).find("h2 > a").attr("href");
			const title = $(element).find("h2 > a").text().trim();
			const cat = $(element).find("h4 > a").text().trim();
			const date = $(element).find("date").text().trim();
			data.push({
				id: (nomor = nomor + 1),
				url: href,
				title: title,
				category: cat,
				date: date,
			});
		});
		return data;
	} catch (error) {
		console.error("Terjadi kesalahan pada saat mengambil data :", error);
		return null;
	}
}

async function pageCheck(url) {
	let checkPage;
	const response = await axios.get(url, { headers });
	const $ = cheerio.load(response.data);
	$(
		"body > div:nth-child(5) > div > div > div.col-bs10-7 > section > div.paging.paging--page.clearfix > div > div:nth-child(9)",
	).each((index, element) => {
		checkPage = $(element).find("a").text().trim();
	});
	return checkPage;
}

// Fungsi untuk mengambil data artikel
app.post("/data", (req, res) => {
	const { pages, date1, date2, mth1, mth2 } = req.body;
	let validate;

	if (date1.type === undefined && date2.type === undefined) {
		validate = false;
	} else {
		validate = true;
	}
	const links = [];
	let page = 1;
	let Url;
	async function crawlNext(validate) {
		try {
			if (validate) {
				Url = `https://www.jawapos.com/indeks-berita?daterange=${date2.split("-")[2]
					}%20${mth2}%20${date2.split("-")[0]}%20-%20${date1.split("-")[2]
					}%20${mth1}%20${date1.split("-")[0]}&page=${page}`;
			} else {
				Url = `https://www.jawapos.com/indeks-berita?daterange=&page=${page}`;
			}

			if (page <= pages) {
				const datas = await crawlPage(Url);
				if (datas) {
					console.log(`Masuk page ${page}`);
					links.push(...datas);
					page = page + 1;
					crawlNext();
				}
			} else {
				res.json(links);
				nomor = 0;
			}
		} catch (error) {
			console.error("Error pada saat post url : ", error);
		}
	}

	crawlNext(validate);
});

app.post("/content", async (req, res) => {
	const { URL } = req.body;
	let author, date, category;
	try {
		const response = await axios.get(URL, { headers });
		const $ = cheerio.load(response.data);
		// Menggunakan selector yang Anda sebutkan untuk mengambil href
		const links = [];
		$("body div > div > div.col-bs10-7 > div > div.col-bs10-7.col-offset-0 > article").each((index, element) => {
			$(element).find("strong").remove();
			let content = $(element).find("div").text();
			if (content.includes("googletag.cmd.push(function() { googletag.display('div-gpt-ad-desktopInArticle')")) {
				content = $(element).find("p").text();
			}

			if (content.includes(" - ")) {
				content = content.replace(" - ", "");
			} else if (content[1] === "–") {
				content = content[1].replace(" – ", "");
			}

			$("body div > div > div.col-bs10-7 > section > div.read__header.mt2.clearfix > div.read__info").each((index, element) => {
				author = $(element).find("div.read__info__author").text().trim();
				date = $(element).find("div.read__info__date").text().trim();
				date = date.slice(2, date.length);
			});

			$("body div > div > div.col-bs10-7 > section > div.breadcrumb.clearfix").each((index, element) => {
				category = $(element).find("ul").text().trim();
			});

			$("body div > div > div.col-bs10-7 > section > div.read__header.mt2.clearfix").each((index, element) => {
				const title = $(element).find("h1").text().trim();
				links.push({ id: index + 1, title: title, content: content, author: author, date: date, category: category });
			});
		});
		// console.log(links);
		res.json(links);
	} catch (error) {
		console.error("Error di server woy", error);
		res.status(500).send("Terjadi kesalahan dalam server.");
	}
});

app.listen(port, () => {
	console.log(`Aplikasi berjalan di http://localhost:${port}`);
});

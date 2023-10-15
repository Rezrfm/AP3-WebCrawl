const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const port = 3000;

app.use(express.static("public")); // Menggunakan folder 'public' untuk file statis (HTML, CSS, JS)
app.use(express.json());

// URL artikel yang akan di-crawl
const baseUrl =
	"https://www.jawapos.com/sepak-bola-indonesia/013075424/transfer-pemain-persebaya-sho-yamamoto-bertahan-jika-ze-valente-pergi";
const headers = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
};

// Fungsi untuk mengambil data artikel
app.post("/data", async (req, res) => {
	try {
		const response = await axios.get(baseUrl, { headers });
		const $ = cheerio.load(response.data);
		// Menggunakan selector yang Anda sebutkan untuk mengambil href
		const links = [];
		$("body div > div > div.col-bs10-7 > div > div.col-bs10-7.col-offset-0 > article").each((index, element) => {
			$(element).find("strong").remove();
			let content = $(element).find("div").text();
			if (content.includes("googletag.cmd.push(function() { googletag.display('div-gpt-ad-desktopInArticle')")) {
				content = $(element).find("p").text();
			}
			$("body div > div > div.col-bs10-7 > section > div.read__header.mt2.clearfix").each((index, element) => {
				const title = $(element).find("h1").text().trim();
				links.push({ id: index + 1, title: title, url: content });
			});
			console.log(links);

		});
		
		console.log(links);
		res.json(links); // Mengirim data sebagai respons
	} catch (error) {
		console.error("Error di server woy", error);
		res.status(500).send("Terjadi kesalahan dalam server.");
	}
});

app.listen(port, () => {
	console.log(`Aplikasi berjalan di http://localhost:${port}`);
});

const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const port = 3000;

app.use(express.static("public")); // Menggunakan folder 'public' untuk file statis (HTML, CSS, JS)
app.use(express.json());

// URL artikel yang akan di-crawl
const baseUrl = "https://www.jawapos.com/berita-sekitar-anda/013076039/kpu-batam-koordinasikan-status-warga-rempang-terdampak-relokasi";
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
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
      const content = $(element).find("p").text().trim();
      // const title = $(element).find("div.col-md-9 > div > h3 > span").text().trim();
      // const cat = $(element).find("div.col-md-9 > div > div").text().trim().split(" - ");
      console.log(content);
      if (content) {
      }
      links.push({ id: index + 1, url: content });
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

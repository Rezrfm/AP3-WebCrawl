const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const port = 3000;
let nomor = 0;

app.use(express.static("public")); // Menggunakan folder 'public' untuk file statis (HTML, CSS, JS)
app.use(express.json());

// URL artikel yang akan di-crawl
async function crawlPage(url) {
  try {
    let data = [];
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);
    $("body > div:nth-child(5) > div > div > div.col-bs10-7 > section > div.latest__wrap  div.latest__right").each((index, element) => {
      const href = $(element).find("h2 > a").attr("href");
      const title = $(element).find("h2 > a").text().trim();
      const cat = $(element).find("h4 > a").text().trim();
      const date = $(element).find("date").text().trim();
      data.push({ id: (nomor = nomor + 1), url: href, title: title, category: cat, date: date });
    });
    return data;
  } catch (error) {
    console.error("Terjadi kesalahan pada saat mengambil data :", error);
    return null;
  }
}

async function pageCheck(url) {
  let checkPage;
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    },
  });
  const $ = cheerio.load(response.data);
  $("body > div:nth-child(5) > div > div > div.col-bs10-7 > section > div.paging.paging--page.clearfix > div > div:nth-child(9)").each((index, element) => {
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
        Url = `https://www.jawapos.com/indeks-berita?daterange=${date2.split("-")[2]}%20${mth2}%20${date2.split("-")[0]}%20-%20${date1.split("-")[2]}%20${mth1}%20${date1.split("-")[0]}&page=${page}`;
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

app.listen(port, () => {
  console.log(`Aplikasi berjalan di http://localhost:${port}`);
});
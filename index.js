require("dotenv").config();
const db = require("./config/dbMysql");
const mysql = require("mysql");
const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const port = parseInt(process.env.PORT) || 4000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json(), router, bodyParser);

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Sever is running on http://localhost:${port}`);
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views", "/index.html"));
});

router.get("/error", (req, res) => {
  res.sendFile(path.join(__dirname, "./views", "/404.html"));
});

// ================== Product data ==================== //

router.get("/products", (req, res) => {
  let gettingProducts = `Select * from products;`;

  db.query(gettingProducts, (err, products) => {
    if (err) {
      res.redirect("/error");
      console.log(err);
    } else {
      res.json({
        status: 200,
        results: products,
      });
    }
  });
});

router.get(`/products/:id`, (req, res) => {
  let getSingleProduct = `Select * from products Where gpu_id = ${req.params.id};`;

  db.query(getSingleProduct, (err, product) => {
    if (err) {
      res.redirect("/error");
      console.log(err);
    } else if (product == "" || null) {
      res.redirect("/error");
      console.log(err);
    } else {
      res.json({
        status: 200,
        results: product,
      });
    }
  });
});

router.post("/product", bodyParser.json(), (req, res) => {
  let {
    gpuNoA,
    gpuNrAr,
    gpuGen,
    gpuChip,
    released,
    memoryGb,
    memoryType,
    memoryBit,
    gpuClock,
    memoryClock,
  } = req.body;
  let newProduct = `Insert into products(gpuNoA,gpuNrAr,gpuGen,gpuChip,released,memoryGb,memoryType,memoryBit,gpuClock,memoryClock)
                    Values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  db.query(newProduct,{gpuNoA,gpuNrAr,gpuGen,gpuChip,released,memoryGb,memoryType,memoryBit,gpuClock,memoryClock})
});
// ========================================================= //

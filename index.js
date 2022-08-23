require("dotenv").config();
const db = require("./config/dbMysql");
const mysql = require("mysql");
const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt')
const port = parseInt(process.env.PORT) || 4000;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(
    express.json(),
    cors(),
    router,
    express.urlencoded({
        extended: true,
    })
);

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

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "/register.html"));
});

// ================== Product data ==================== //

// Get all products
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

// Get Single Product
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

// Add product
router.post("/products", bodyParser.json(), (req, res) => {
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

    db.query(newProduct, [
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
    ], (err, newProduct) => {
        if (err) {
            res.redirect("/error");
            console.log(err);
        }
        console.log(newProduct.affectedRows)
    });
});

// Edit product
router.put('/products/:id', bodyParser.json(), (req, res) => {
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
    } = req.body
    let editProduct = `Update products SET
        gpuNoA = ? ,
        gpuNrAr = ? ,
        gpuGen = ? ,
        gpuChip = ? ,
        released = ? ,
        memoryGb = ? ,
        memoryType = ? ,
        memoryBit = ? ,
        gpuClock = ? ,
        memoryClock = ?
        Where gpu_id = ${req.params.id}
    `
    db.query(editProduct, [
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
    ], (err, editedProduct) => {
        if (err) {
            res.redirect("/error");
            console.log(err);
        }
        res.end(JSON.stringify(editedProduct))
    })
})

router.delete('/products/:id', (req, res) => {
    let deleteProduct = `delete from products where gpu_id = ${req.params.id}`
    db.query(deleteProduct, (err) => {
        if (err) {
            res.redirect('/error')
            console.log(err)
        }
    })
})
// ========================================================= //

// Register
router.post('/register',bodyParser.json(),(req, res) => {
    let checkEmail = {
        email: req.body.email
    }
    let checkEmail1 = `Select * from users where email = ?`
    db.query(checkEmail1, checkEmail.email, async (err, emails) => {
        if (err) throw err
        if (emails.length > 0) {
            res.json({
                status: 400,
                msg: 'This email already exist'
            })
        }else {
            let {
                userFName,
                userLName,
                email,
                userPassword,
            } = req.body
            let hash = await bcrypt.hash(userPassword, 10)
            let register = `Insert into users(userFName,userLName,email,userPassword)
                            Values(?,?,?,?)`

            db.query(register, [
                userFName,
                userLName,
                email,
                hash,
            ], (err, registered) => {
                if (err) throw err
                    res.json({
                        status: 200,
                        msg: 'You are successfully registered'
                    })
            })
        }
    })
})
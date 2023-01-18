const express = require('express');
const config = require('./config.js');
const shortids = require('shortid');
const path = require("path")
const db = require("knex")({
    client: "mysql",
    connection: {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    }
})

const app = express();

const public = path.join(__dirname, "public")

app.use(express.static(public));

app.use(express.urlencoded({ extended: false }));




app.get('/', async (req, res) => {
    res.send(`
        <link rel="stylesheet" type="text/css" href="index.css"/>
        <title>lobisco's shortener</title>
        <header><h1>lobisco's shortener</h1></header>
        <form action="/upload" method="POST">
            <input type="text" name="full">
            <button type="submit">send</button>
        </form>`);
});


app.post("/upload", async (req, res) => {

    if (!req.body.full) return res.sendStatus(400)

    const short = await shortids.generate();

    if (!req.body.full.startsWith("http")) req.body.full = "http://" + req.body.full;

    await db("urls").insert({ full: req.body.full, short: short });
    res.send(`${config.domain}/${short}`)

})

app.get("/:short", async (req, res) => {

    const short = req.params.short;

    if (!req.params.short) return res.sendStatus(400)

    const url = await db("urls").where({ short: short }).select("full")

    if (url.length == 0) return res.sendStatus(404)

    res.redirect(url[0].full)
})

app.listen(9003)
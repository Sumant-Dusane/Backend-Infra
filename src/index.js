const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("SHREE SWAMI SAMARTHA")
})

app.post("/", (req, res) => {
  const { a, b } = req.body;
  res.status(200).send({ result: a + b });
});

app.listen(3000, () => console.log("Server listening on 3000"));

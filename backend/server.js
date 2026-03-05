require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Hello from Workly backend!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running http://localhost:${PORT}`));
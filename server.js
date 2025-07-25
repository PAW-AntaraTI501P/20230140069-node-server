const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
app.use(cors());
app.get("/", (req, res) => {
  res.json({ message: "Hello from Node.js Server!" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
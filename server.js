const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

//user routes
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

//candidate routes
const candidateRoutes = require("./routes/candidateRoutes"); // import the router files
app.use("/candidate", candidateRoutes); // use the router

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

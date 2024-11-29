const mongoose = require("mongoose");
require("dotenv").config();
//define  connection

const mongoURL = process.env.MONGODB_LOCAL_URL;


// const mongoURL = process.env.MONGODB_URL;

// established connection
mongoose.connect(mongoURL);
// mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// get the default connection
const db = mongoose.connection;

// define event listner for database connection
db.on("connected", () => {
  console.log("Connected to MongoDB Server");
});

db.on("error", (err) => {
  console.log("MongoDb connection error" + err);
});

db.on("disconnected", () => {
  console.log("MongoDb connection disconnected");
});

// export to server.js file

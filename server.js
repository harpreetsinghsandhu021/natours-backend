const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

mongoose.set("strictQuery", false);

mongoose.connect(process.env.DB, {}).then(() => {
  console.log("DB connected succesfully!!");
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(
    "server is up on port " + port + " in " + process.env.NODE_ENV + " mode"
  );
});

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
// const Tour = require("../../models/tourModel");
// const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");
dotenv.config({ path: `../../config.env` });

const tours = JSON.parse(fs.readFileSync("./reviews.json", "utf-8"));

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB, {}).then(() => {
  console.log("Db connected successfully!!");
});

const importData = async () => {
  try {
    await Review.create(tours, {});
    console.log("data uploaded successfully!!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Review.deleteMany();
    console.log("data deleted successfully!!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") importData();
if (process.argv[2] === "--delete") deleteData();

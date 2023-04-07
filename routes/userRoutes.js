const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post(
  "/signup",
  userController.uploadSingle,
  userController.resizePhoto,
  authController.signup
);
router.post("/login", authController.login);
router.route("/").get(userController.getAllUsers);

router.patch(
  "/updateme",
  authController.protect,
  userController.uploadSingle,
  userController.resizePhoto,
  userController.updateMe
);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updateMyPassword
);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;

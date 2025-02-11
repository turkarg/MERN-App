const express = require("express");
const { check } = require("express-validator");

const UsersController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", UsersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(), //normalizeEmail : Test@test.com => test@test.com
    check("password").isLength({ min: 5 }),
  ],
  UsersController.signup
);

router.post("/login", UsersController.login);

module.exports = router;

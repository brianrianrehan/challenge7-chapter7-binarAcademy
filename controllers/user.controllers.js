const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const nodemailer = require("../utils/nodemailer");
const imagekit = require("../libs/imagekit");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Register User
  register: async (req, res, next) => {
    try {
      let { first_name, last_name, email, password, password_confirmation } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        req.flash("msg1", "Email already exists");
        res.redirect("/register");
      }

      if (password != password_confirmation) {
        req.flash("msg2", "please ensure that the password and password confirmation match!");
        res.redirect("/register");
      }

      let encryptedPassword = await bcrypt.hash(password, 10);
      let newUser = await prisma.user.create({
        data: {
          email,
          password: encryptedPassword,
        },
      });

      await prisma.userProfile.create({
        data: {
          first_name,
          last_name,
          birth_date: "",
          profile_picture: "",
          userId: newUser.id,
        },
      });

      await prisma.notification.create({
        data: {
          message: `Welcome ${first_name}, thank you for creating a new account`,
          userId: newUser.id,
        },
      });

      let token = jwt.sign({ email: newUser.email }, JWT_SECRET_KEY);
      const html = await nodemailer.getHtml("activation-email.ejs", { email, token });
      nodemailer.sendEmail(email, "Email Activation", html);

      req.flash("msg3", "Register Successfully");
      res.redirect("/login");
    } catch (err) {
      next(err);
    }
  },

  // Login User
  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        req.flash("msg1", "Invalid Email or Password!");
        res.redirect("/login");
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        req.flash("msg2", "please ensure that the password and password confirmation match!");
        res.redirect("/login");
      }

      let token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);

      req.flash("msg3", "Login Successfully!");
      res.cookie("token", token);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },

  // activation email
  activate: async (req, res, next) => {
    try {
      let { token } = req.query;

      jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
          return res.status(400).json({
            status: false,
            message: "Bad request",
            err: err.message,
            data: null,
          });
        }

        let updated = await prisma.user.update({
          where: { email: decoded.email },
          data: { is_verified: true },
        });

        res.redirect("/activation-email-success");
      });
    } catch (err) {
      next(err);
    }
  },

  // forget password
  forgetPasswordUser: async (req, res, next) => {
    try {
      let { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        req.flash("msg1", "Email not found");
        res.redirect("/forget-password");
      }

      let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
      const html = await nodemailer.getHtml("email-password-reset.ejs", { email, token });
      nodemailer.sendEmail(email, "Reset Password", html);

      req.flash("msg2", "Email sent successfully.");
      res.redirect("/forget-password");
    } catch (err) {
      next(err);
    }
  },

  // update password
  updatePasswordUser: async (req, res, next) => {
    try {
      let { token } = req.query;
      let { password, passwordConfirmation } = req.body;

      if (password != passwordConfirmation) {
        req.flash("msg1", "please ensure that the password and password confirmation match!");
        res.redirect(`/update-password?token=${token}`);
      }

      let encryptedPassword = await bcrypt.hash(password, 10);

      jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
          return res.status(400).json({
            status: false,
            message: "Bad request",
            err: err.message,
            data: null,
          });
        }

        let updateUser = await prisma.user.update({
          where: { email: decoded.email },
          data: { password: encryptedPassword },
        });

        await prisma.notification.create({
          data: {
            message: "Your password has been updated successfully. Well done!",
            userId: updateUser.id,
          },
        });

        req.flash("msg2", "Your password has been updated successfully!");
        res.redirect("/login");
      });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { first_name, last_name, birth_date } = req.body;
      const file = req.file;
      let imageURL;

      if (file) {
        const strFile = file.buffer.toString("base64");

        const { url } = await imagekit.upload({
          fileName: Date.now() + path.extname(req.file.originalname),
          file: strFile,
        });

        imageURL = url;
      }

      const newUserProfile = await prisma.userProfile.update({
        where: {
          userId: Number(req.user.id),
        },
        data: { first_name, last_name, birth_date, profile_picture: imageURL },
      });

      return res.status(200).json({
        status: true,
        message: "OK",
        data: { newUserProfile },
      });
    } catch (err) {
      next(err);
    }
  },

  authenticateUser: async (req, res, next) => {
    try {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: Number(req.user.id) },
      });

      return res.status(200).json({
        status: true,
        message: "OK",
        data: {
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          email: req.user.email,
          birth_date: userProfile.birth_date,
          profile_picture: userProfile.profile_picture,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

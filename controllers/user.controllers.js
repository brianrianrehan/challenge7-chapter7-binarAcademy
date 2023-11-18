const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("../utils/nodemailer");
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
        res.redirect("/register");
      }

      if (password != password_confirmation) {
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
        res.redirect("/login");
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        res.redirect("/login");
      }

      let token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);

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
        return res.status(404).json({
          status: false,
          message: "Email not found",
          data: null,
        });
      }

      let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
      const html = await nodemailer.getHtml("email-password-reset.ejs", { email, token });
      nodemailer.sendEmail(email, "Reset Password", html);

      res.redirect("http://localhost:3000/forget-password");
    } catch (err) {
      next(err);
    }
  },

  // update password
  updatePasswordUser: async (req, res, next) => {
    try {
      let { token } = req.query;
      let { password, password_confirmation } = req.body;

      if (password != password_confirmation) {
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

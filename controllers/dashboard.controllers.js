const { default: axios } = require("axios");

module.exports = {
  register: (req, res, next) => {
    try {
      res.render("register", { msg1: req.flash("msg1"), msg2: req.flash("msg2"), msg3: req.flash("msg3") });
    } catch (err) {
      next(err);
    }
  },

  login: (req, res, next) => {
    try {
      res.render("login", { msg1: req.flash("msg1"), msg2: req.flash("msg2"), msg3: req.flash("msg3") });
    } catch (err) {
      next(err);
    }
  },

  activationEmailSuccess: (req, res, next) => {
    try {
      res.render("activation-email-success");
    } catch (err) {
      next(err);
    }
  },

  forgetPassword: (req, res, next) => {
    try {
      res.render("forget-password", { msg1: req.flash("msg1"), msg2: req.flash("msg2") });
    } catch (err) {
      next(err);
    }
  },

  updatePassword: (req, res, next) => {
    try {
      const { token } = req.query;
      res.render("update-password", { token, msg1: req.flash("msg1"), msg2: req.flash("msg2") });
    } catch (err) {
      next(err);
    }
  },

  dashboard: async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.redirect("/login");
      }

      const response = await axios.get("http://localhost:3000/api/v1/users/authenticate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      res.render("dashboard-user", { user: response.data.data });
    } catch (err) {
      next(err);
    }
  },

  getNotificationsUser: async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.redirect("/login");
      }

      await axios.get("http://localhost:3000/api/v1/notifications/markIsRead", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.get("http://localhost:3000/api/v1/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      res.render("notification", { notification: response.data.data });
    } catch (err) {
      next(err);
    }
  },

  logout: (req, res, next) => {
    try {
      res.clearCookie("token");
      res.redirect("/login");
    } catch (err) {
      next(err);
    }
  },
};

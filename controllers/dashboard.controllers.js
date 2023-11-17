module.exports = {
  register: (req, res, next) => {
    try {
      res.render("register");
    } catch (err) {
      next(err);
    }
  },

  login: (req, res, next) => {
    try {
      res.render("login");
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

  forgotPassword: (req, res, next) => {
    try {
      res.render("forgot-password");
    } catch (err) {
      next(err);
    }
  },

  updatePassword: (req, res, next) => {
    try {
      const { token } = req.query;
      res.render("update-password", { token });
    } catch (err) {
      next(err);
    }
  },
};

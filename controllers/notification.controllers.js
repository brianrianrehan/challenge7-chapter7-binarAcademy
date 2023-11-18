const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  getNotifications: async (req, res, next) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: Number(req.user.id) },
      });

      res.status(200).json({
        status: true,
        message: "OK",
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllNotifications: async (req, res, next) => {
    try {
      const notifications = await prisma.notification.findMany();

      res.status(200).json({
        status: true,
        message: "OK",
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  },

  createNotification: async (req, res, next) => {
    try {
      console.log("run");
      let { userId, message } = req.body;

      const newNotification = await prisma.notification.create({
        data: {
          message,
          userId,
        },
      });

      res.status(201).json({
        status: true,
        message: "OK",
        data: newNotification,
      });

      // kirimkan notifikasi baru
      io.emit(`user-${userId}`, newNotification);
    } catch (err) {
      next(err);
    }
  },

  markNotificationAsRead: async (req, res, next) => {
    try {
      const updateNotification = await prisma.notification.updateMany({
        where: { userId: Number(req.user.id) },
        data: {
          is_read: true,
        },
      });

      res.status(200).json({
        status: true,
        message: "OK",
        data: updateNotification,
      });
    } catch (err) {
      next(err);
    }
  },
};

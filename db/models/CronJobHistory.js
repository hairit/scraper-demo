const mongoose = require("mongoose");

const create = () =>
  mongoose.Schema({
    taskId: {
      type: String,
      require: true,
    },
    taskName: {
      type: String,
      require: true,
    },
    startedDate: {
      type: Date,
      require: true,
    },
    completedDate: {
      type: Date,
    },
    message: {
      type: String,
    },
    runTimeLog: {
      type: String,
    },
    status: {
      type: String,
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  });

module.exports =
  mongoose.models.cronjobhistories ||
  mongoose.model("cronjobhistories", create());

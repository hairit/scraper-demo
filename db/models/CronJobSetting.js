const mongoose = require("mongoose");

const create = () =>
  mongoose.Schema({
    cronStyle: {
      type: String,
      require: true,
    },
    taskName: {
      type: String,
      require: true,
    },
    typeCronJob: {
      type: String,
      require: true,
    },
    startDateTime: {
      type: Date,
      require: true,
    },
    startTime: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    description: {
      type: String,
    },
    updatedDate: {
      type: Date,
    },
    linkToReport: {
      type: String,
    },
    stepSize: {
      type: Number,
      required: true,
      default: 1,
    },
    timeRun: {
      type: Number,
      required: true,
      default: 0,
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  });

module.exports =
  mongoose.models.cronjobsettings ||
  mongoose.model("cronjobsettings", create());

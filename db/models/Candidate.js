const mongoose = require("mongoose");

const create = () => mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  positionApply: {
    type: String,
  },
  description: {
    type: String,
    default: ``,
  },
  salary: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: `Pending`,
  },
  interviewDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.models.candidates || mongoose.model("candidates", create());

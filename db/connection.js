const mongoose = require("mongoose");

let connected = false;

const connect = async () => {
  mongoose
    .connect(
      `mongodb+srv://tuonghaiwork:tuonghaimdb@tuonghaiwork.gaaubic.mongodb.net/?retryWrites=true&w=majority&appName=tuonghaiwork`
    )
    .then(() => {
      connected = true;
      console.log("Contected to DB!");
    })
    .catch((err) => {
      console.log("DB Connection Error: " + err);
    });
};

const close = async () => {
  mongoose.disconnect().then(() => (connected = false));
};

module.exports = { connect, close, connected };

const mongoose = require("mongoose");

let connected = false;

const connect = async () => {
  mongoose
    .connect(`mongodb://0.0.0.0:27017/iwsp`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
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

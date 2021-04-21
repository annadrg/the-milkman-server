const moment = require("moment");

function formatMessage(playername, text) {
  return {
    playername,
    text,
    time: moment().format("H:mm"),
  };
}

module.exports = formatMessage;

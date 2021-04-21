const moment = require("moment");

function formatMessage(playername, text) {
  return {
    playername,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;

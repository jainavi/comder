let interval = "";
const start = (channel, arg = "Comdeeeerrrrr !!!") => {
  interval = setInterval(() => {
    channel.send(arg);
  }, 1000);
};

const stop = () => {
  clearInterval(interval);
};

module.exports = {
  start: start,
  stop: stop,
};

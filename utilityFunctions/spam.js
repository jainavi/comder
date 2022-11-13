let interval = "";
const start = (channel, arg = "Comdeeeerrrrr !!!") => {
  interval = setInterval(async () => {
    const msgRef = await channel.send(arg);
    msgRef.edit("edited");
  }, 1000);
};

const stop = () => {
  clearInterval(interval);
};

module.exports = {
  start: start,
  stop: stop,
};

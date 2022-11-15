const intervalsArr = [];

const send = async (channel, arg = "Comdeeeerrrrr !!!", spam = false) => {
  if (spam) {
    intervalsArr.push(
      setInterval(async () => {
        await channel.send(arg);
      }, 1000)
    );
    return;
  }
  await channel.send(arg);
};

const stopSpamming = () => {
  for (let i = 0; i < intervalsArr.length; i++) {
    clearInterval(intervalsArr[i]);
  }
};

module.exports = {
  send,
  stopSpamming,
};

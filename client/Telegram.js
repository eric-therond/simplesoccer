'use strict';

class Telegram
{
  constructor(time = -1, sender = -1, receiver = -1, msg = -1, info = null)
  {
    this.DispatchTime = time;
    this.Sender = sender;
    this.Receiver = receiver;
    this.Msg = msg;
    this.ExtraInfo = info;
  }
}

module.exports.Telegram = Telegram;

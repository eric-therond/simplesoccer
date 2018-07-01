'use strict';

var MessageType = {
  Msg_ReceiveBall: 1,
  Msg_PassToMe: 2,
  Msg_SupportAttacker: 3,
  Msg_GoHome: 4,
  Msg_Wait: 5,
};

class SoccerMessages
{
  constructor()
  {
  }

  MessageToString(msg)
  {
    switch (msg)
    {
    case MessageType.Msg_ReceiveBall:
      return 'Msg_ReceiveBall';

    case MessageType.Msg_PassToMe:
      return 'Msg_PassToMe';

    case MessageType.Msg_SupportAttacker:
      return 'Msg_SupportAttacker';

    case MessageType.Msg_GoHome:
      return 'Msg_GoHome';

    case MessageType.Msg_Wait:
      return 'Msg_Wait';

    default:
      return 'INVALID MESSAGE!!';
  }
  }
}

module.exports.SoccerMessages = SoccerMessages;
module.exports.MessageType = MessageType;

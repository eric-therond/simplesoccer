'use strict';

var EntityManagerExports = require('./EntityManager');
var EntityManager = EntityManagerExports.EntityManager;
var GLOBAL_EntityManager = EntityManagerExports.GLOBAL_EntityManager;

var TelegramExports = require('./Telegram');
var Telegram = TelegramExports.Telegram;

var SEND_MSG_IMMEDIATELY = 0.0;
var NO_ADDITIONAL_INFO   = 0;
var SENDER_ID_IRRELEVANT = -1;

class MessageDispatcher
{
  constructor()
  {
    this.PriorityQ = null;
  }

  Discharge(pReceiver, telegram)
  {
    if (!pReceiver.HandleMessage(telegram))
    {

    }
  }

  DispatchMsg(delay, sender, receiver, msg, AdditionalInfo = null)
  {

    //get a pointer to the receiver
    var pReceiver = GLOBAL_EntityManager.GetEntityFromID(receiver);

    //make sure the receiver is valid
    if (pReceiver == null)
    {
      return;
    }

    //create the telegram
    var telegram = new Telegram(0, sender, receiver, msg, AdditionalInfo);

    //if there is no delay, route telegram immediately
    if (delay <= 0.0)
    {
      //send the telegram to the recipient
      this.Discharge(pReceiver, telegram);
    }

    //else calculate the time when the telegram should be dispatched
    else
    {
      var CurrentTime = TickCounter.GetCurrentFrame();

      telegram.DispatchTime = CurrentTime + delay;

      this.PriorityQ.push(telegram);
    }
  }

  //---------------------- DispatchDelayedMessages -------------------------
  //
  //  This function dispatches any telegrams with a timestamp that has
  //  expired. Any dispatched telegrams are removed from the queue
  //------------------------------------------------------------------------
  DispatchDelayedMessages()
  {
    //first get current time
    var CurrentTime = TickCounter.GetCurrentFrame();

    //now peek at the queue to see if any telegrams need dispatching.
    //remove all telegrams from the front of the queue that have gone
    //past their sell by date
    while (this.PriorityQ.length != 0 &&
        (this.PriorityQ[0].DispatchTime < CurrentTime) &&
           (this.PriorityQ[0].DispatchTime > 0))
    {
      //read the telegram from the front of the queue
      var telegram = PriorityQ[0];

      //find the recipient
      var pReceiver = GLOBAL_EntityManager.GetEntityFromID(telegram.Receiver);

      //send the telegram to the recipient
      this.Discharge(pReceiver, telegram);

      //remove it from the queue
      this.PriorityQ.pop();
    }
  }
}

if (typeof GLOBAL_MessageDispatcher === 'undefined')
    var GLOBAL_MessageDispatcher = new MessageDispatcher;

module.exports.MessageDispatcher = MessageDispatcher;
module.exports.SEND_MSG_IMMEDIATELY = SEND_MSG_IMMEDIATELY;
module.exports.NO_ADDITIONAL_INFO = NO_ADDITIONAL_INFO;
module.exports.SENDER_ID_IRRELEVANT = SENDER_ID_IRRELEVANT;
module.exports.GLOBAL_MessageDispatcher = GLOBAL_MessageDispatcher;

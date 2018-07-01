'use strict';

var StateExports = require('./State');
var State = StateExports.State;

var MessageDispatcherExports = require('./MessageDispatcher');
var MessageDispatcher = MessageDispatcherExports.MessageDispatcher;
var SEND_MSG_IMMEDIATELY = MessageDispatcherExports.SEND_MSG_IMMEDIATELY;
var NO_ADDITIONAL_INFO = MessageDispatcherExports.NO_ADDITIONAL_INFO;
var SENDER_ID_IRRELEVANT = MessageDispatcherExports.SENDER_ID_IRRELEVANT;
var GLOBAL_MessageDispatcher = MessageDispatcherExports.GLOBAL_MessageDispatcher;

var SoccerMessagesExports = require('./SoccerMessages');
var SoccerMessages = SoccerMessagesExports.SoccerMessages;
var MessageType = SoccerMessagesExports.MessageType;

var Params = require('./Params');

class GoalkeeperStates extends State
{
  constructor()
  {
    super('GoalkeeperStates');
  }

  Enter(keeper)
  {

  }

  Execute(keeper)
  {

  }

  Exit(keeper)
  {

  }

  OnMessage(keeper, telegram)
  {
    switch (telegram.Msg)
    {
    case MessageType.Msg_GoHome:
      {
        keeper.SetDefaultHomeRegion();
        
        keeper.GetFSM().ChangeState(new ReturnHome());
      }

    break;

    case MessageType.Msg_ReceiveBall:
      {
        keeper.GetFSM().ChangeState(new InterceptBall());
      }

    break;

  }//end switch

    return false;
  }

  name()
  {
    return 'GoalkeeperStates';
  }
}

//--------------------------- TendGoal -----------------------------------
//
//  This is the main state for the goalkeeper. When in this state he will
//  move left to right across the goalmouth using the 'interpose' steering
//  behavior to put himself between the ball and the back of the net.
//
//  If the ball comes within the 'goalkeeper range' he moves out of the
//  goalmouth to attempt to intercept it. (see next state)
//------------------------------------------------------------------------

class TendGoal extends State
{
  constructor()
  {
    super('TendGoal');
  }

  Enter(keeper)
  {
    //turn interpose on
    keeper.Steering().InterposeOn(Params.GoalKeeperTendingDistance);

    //interpose will position the agent between the ball position and a target
    //position situated along the goal mouth. This call sets the target
    keeper.Steering().SetTarget(keeper.GetRearInterposeTarget());
  }

  Execute(keeper)
  {
    //the rear interpose target will change as the ball's position changes
    //so it must be updated each update-step
    keeper.Steering().SetTarget(keeper.GetRearInterposeTarget());

    //if the ball comes in range the keeper traps it and then changes state
    //to put the ball back in play
    if (keeper.BallWithinKeeperRange())
    {
      keeper.Ball().Trap();

      keeper.Pitch().SetGoalKeeperHasBall(true);

      keeper.GetFSM().ChangeState(new PutBallBackInPlay());

      return;
    }

    //if ball is within a predefined distance, the keeper moves out from
    //position to try and intercept it.
    if (keeper.BallWithinRangeForIntercept() && !keeper.Team().InControl())
    {
      keeper.GetFSM().ChangeState(new InterceptBall());
    }

    //if the keeper has ventured too far away from the goal-line and there
    //is no threat from the opponents he should move back towards it
    if (keeper.TooFarFromGoalMouth() && keeper.Team().InControl())
    {
      keeper.GetFSM().ChangeState(new ReturnHome());

      return;
    }
  }

  Exit(keeper)
  {
    keeper.Steering().InterposeOff();
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'TendGoal';
  }
}

//------------------------- ReturnHome: ----------------------------------
//
//  In this state the goalkeeper simply returns back to the center of
//  the goal region before changing state back to TendGoal
//------------------------------------------------------------------------

class ReturnHome extends State
{
  constructor()
  {
    super('ReturnHome');
  }

  Enter(keeper)
  {
    keeper.Steering().ArriveOn();
  }

  Execute(keeper)
  {
    keeper.Steering().SetTarget(keeper.HomeRegion().Center());

    //if close enough to home or the opponents get control over the ball,
    //change state to tend goal
    if (keeper.InHomeRegion() || !keeper.Team().InControl())
    {
      keeper.GetFSM().ChangeState(new TendGoal());
    }
  }

  Exit(keeper)
  {
    keeper.Steering().ArriveOff();
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'ReturnHome';
  }
}


//----------------- InterceptBall ----------------------------------------
//
//  In this state the GP will attempt to intercept the ball using the
//  pursuit steering behavior, but he only does so so long as he remains
//  within his home region.
//------------------------------------------------------------------------
class InterceptBall extends State
{
  constructor()
  {
    super('InterceptBall');
  }

  Enter(keeper)
  {
    keeper.Steering().PursuitOn();
  }

  Execute(keeper)
  {
    //if the goalkeeper moves to far away from the goal he should return to his
    //home region UNLESS he is the closest player to the ball, in which case,
    //he should keep trying to intercept it.
    if (keeper.TooFarFromGoalMouth() && !keeper.isClosestPlayerOnPitchToBall())
    {
      keeper.GetFSM().ChangeState(new ReturnHome());

      return;
    }

    //if the ball becomes in range of the goalkeeper's hands he traps the
    //ball and puts it back in play
    if (keeper.BallWithinKeeperRange())
    {
      keeper.Ball().Trap();

      keeper.Pitch().SetGoalKeeperHasBall(true);

      keeper.GetFSM().ChangeState(new PutBallBackInPlay());

      return;
    }
  }

  Exit(keeper)
  {
    keeper.Steering().PursuitOff();
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'InterceptBall';
  }
}


//--------------------------- PutBallBackInPlay --------------------------
//
//------------------------------------------------------------------------
class PutBallBackInPlay extends State
{
  constructor()
  {
    super('PutBallBackInPlay');
  }

  Enter(keeper)
  {
    //let the team know that the keeper is in control
    keeper.Team().SetControllingPlayer(keeper);

    //send all the players home
    keeper.Team().Opponents().ReturnAllFieldPlayersToHome();
    keeper.Team().ReturnAllFieldPlayersToHome();
  }

  Execute(keeper)
  {
    //test if there are players further forward on the field we might
    //be able to pass to. If so, make a pass.
    var ret = keeper.Team().FindPass(keeper,
                                Params.MaxPassingForce,
                                Params.GoalkeeperMinPassDist);

    if (ret[0])
    {
      var receiver = ret[1];
      var BallTarget = ret[2];

      //make the pass
      keeper.Ball().Kick(new Phaser.Point(BallTarget.x - keeper.Ball().Pos().x, BallTarget.y - keeper.Ball().Pos().y).normalize(), Params.MaxPassingForce);

      //goalkeeper no longer has ball
      keeper.Pitch().SetGoalKeeperHasBall(false);

      //let the receiving player know the ball's comin' at him
      GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
                             keeper.ID(),
                             receiver.ID(),
                             MessageType.Msg_ReceiveBall,
                             BallTarget);

      //go back to tending the goal
      keeper.GetFSM().ChangeState(new TendGoal());

      return;
    }

    keeper.SetVelocity(new Phaser.Point(0, 0));
  }

  Exit(keeper)
  {
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'PutBallBackInPlay';
  }
}

module.exports.GoalkeeperStates = GoalkeeperStates;
module.exports.TendGoal = TendGoal;
module.exports.ReturnHome = ReturnHome;
module.exports.InterceptBall = InterceptBall;
module.exports.PutBallBackInPlay = PutBallBackInPlay;

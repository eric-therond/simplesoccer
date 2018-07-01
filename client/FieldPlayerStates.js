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

var RegionExports = require('./Region');
var region_modifier = RegionExports.region_modifier;

var SoccerBallExports = require('./SoccerBall');
var SoccerBall = SoccerBallExports.SoccerBall;

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

var Params = require('./Params');

class FieldPlayerStates extends State
{
  constructor()
  {
    super('FieldPlayerStates');
  }

  Enter(player)
  {

  }

  Execute(player)
  {
    //if a player is in possession and close to the ball reduce his max speed
    if ((player.BallWithinReceivingRange()) && (player.isControllingPlayer()))
    {
      player.SetMaxSpeed(Params.PlayerMaxSpeedWithBall);
    } else
    {
      player.SetMaxSpeed(Params.PlayerMaxSpeedWithoutBall);
    }
  }

  Exit(player)
  {

  }

  OnMessage(player, telegram)
  {
    switch (telegram.Msg)
    {
    case MessageType.Msg_ReceiveBall:
      {
       //set the target
       player.Steering().SetTarget(telegram.ExtraInfo);

       //change state
       player.GetFSM().ChangeState(new ReceiveBall());

       return true;
      }

    case MessageType.Msg_SupportAttacker:
      {
       //if already supporting just return
       if (player.GetFSM().isInState(new SupportAttacker()))
       {
        return true;
       }
         
       //set the target to be the best supporting position
       player.Steering().SetTarget(player.Team().GetSupportSpot());

       //change the state
       player.GetFSM().ChangeState(new SupportAttacker());

       return true;
      }

    case MessageType.Msg_Wait:
      {
       //change the state
       player.GetFSM().ChangeState(new Wait());

       return true;
      }

    case MessageType.Msg_GoHome:
      {
       player.SetDefaultHomeRegion();
        
       player.GetFSM().ChangeState(new ReturnToHomeRegion());

       return true;
      }

    case MessageType.Msg_PassToMe:
      {  
       //get the position of the player requesting the pass
       //FieldPlayer* receiver = static_cast<FieldPlayer*>(telegram.ExtraInfo);
       var receiver = telegram.ExtraInfo;

       //if the ball is not within kicking range or their is already a
       //receiving player, this player cannot pass the ball to the player
       //making the request.
       if (player.Team().Receiver() != null ||
        !player.BallWithinKickingRange())
       {
        return true;
       }
        
       //make the pass
       player.Ball().Kick(new Phaser.Point(receiver.Pos().x - player.Ball().Pos().x, receiver.Pos().y - player.Ball().Pos().y),
              Params.MaxPassingForce);
       
       //let the receiver know a pass is coming
       GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
              player.ID(),
              receiver.ID(),
              MessageType.Msg_ReceiveBall,
              receiver.Pos());

       //change state
       player.GetFSM().ChangeState(new Wait());

       player.FindSupport();

       return true;
      }

  }//end switch

    return false;
  }

  name()
  {
    return 'FieldPlayerStates';
  }
}

//***************************************************************************** CHASEBALL

class ChaseBall extends State
{
  constructor()
  {
    super('ChaseBall');
  }

  Enter(player)
  {
    player.Steering().SeekOn();
  }

  Execute(player)
  {
    //if the ball is within kicking range the player changes state to KickBall.
    if (player.BallWithinKickingRange())
    {
      player.GetFSM().ChangeState(new KickBall());

      return;
    }

    //if the player is the closest player to the ball then he should keep
    //chasing it
    if (player.isClosestTeamMemberToBall())
    {
      player.Steering().SetTarget(player.Ball().Pos());

      return;
    }

    //if the player is not closest to the ball anymore, he should return back
    //to his home region and wait for another opportunity

    player.GetFSM().ChangeState(new ReturnToHomeRegion());
  }

  Exit(player)
  {
    player.Steering().SeekOff();
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'ChaseBall';
  }
}


//*****************************************************************************SUPPORT ATTACKING PLAYER

class SupportAttacker extends State
{
  constructor()
  {
    super('SupportAttacker');
  }

  Enter(player)
  {
    player.Steering().ArriveOn();

    player.Steering().SetTarget(player.Team().GetSupportSpot());
  }

  Execute(player)
  {
    //if his team loses control go back home
    if (!player.Team().InControl())
    {
      player.GetFSM().ChangeState(new ReturnToHomeRegion());
      return;
    }


    //if the best supporting spot changes, change the steering target
    if (player.Team().GetSupportSpot() != player.Steering().Target())
    {
      player.Steering().SetTarget(player.Team().GetSupportSpot());

      player.Steering().ArriveOn();
    }

    //if this player has a shot at the goal AND the attacker can pass
    //the ball to him the attacker should pass the ball to this player
    var ret_canshoot = player.Team().CanShoot(player.Pos(),
                                 Params.MaxShootingForce);
    if (ret_canshoot[0])
    {
      player.Team().RequestPass(player);
    }

    //if this player is located at the support spot and his team still have
    //possession, he should remain still and turn to face the ball
    if (player.AtTarget())
    {
      player.Steering().ArriveOff();

      //the player should keep his eyes on the ball!
      player.TrackBall();

      player.SetVelocity(new Phaser.Point(0, 0));

      //if not threatened by another player request a pass
      if (!player.isThreatened())
      {
        player.Team().RequestPass(player);
      }
    }
  }

  Exit(player)
  {
    //set supporting player to null so that the team knows it has to
    //determine a new one.
    player.Team().SetSupportingPlayer(null);

    player.Steering().ArriveOff();
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'SupportAttacker';
  }
}



//************************************************************************ RETURN TO HOME REGION

class ReturnToHomeRegion extends State
{
  constructor()
  {
    super('ReturnToHomeRegion');
  }

  Enter(player)
  {
    player.Steering().ArriveOn();

    if (!player.HomeRegion().Inside(player.Steering().Target(), region_modifier.halfsize))
    {
      player.Steering().SetTarget(player.HomeRegion().Center());
    }
  }

  Execute(player)
  {
    if (player.Pitch().GameOn())
    {
      //if the ball is nearer this player than any other team member  &&
      //there is not an assigned receiver && the goalkeeper does not gave
      //the ball, go chase it
      if (player.isClosestTeamMemberToBall() &&
        (player.Team().Receiver() == null) &&
        !player.Pitch().GoalKeeperHasBall())
      {
        player.GetFSM().ChangeState(new ChaseBall());

        return;
      }
    }

    //if game is on and close enough to home, change state to wait and set the
    //player target to his current position.(so that if he gets jostled out of
    //position he can move back to it)
    if (player.Pitch().GameOn() && player.HomeRegion().Inside(player.Pos(),
                   region_modifier.halfsize))
    {
      player.Steering().SetTarget(player.Pos());
      player.GetFSM().ChangeState(new Wait());
    }
    //if game is not on the player must return much closer to the center of his
    //home region
    else if (!player.Pitch().GameOn() && player.AtTarget())
    {
      player.GetFSM().ChangeState(new Wait());
    }
  }

  Exit(player)
  {
    player.Steering().ArriveOff();
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'ReturnToHomeRegion';
  }
}



//***************************************************************************** WAIT

class Wait extends State
{
  constructor()
  {
    super('Wait');
  }

  Enter(player)
  {
    //if the game is not on make sure the target is the center of the player's
    //home region. This is ensure all the players are in the correct positions
    //ready for kick off
    if (!player.Pitch().GameOn())
    {
      player.Steering().SetTarget(player.HomeRegion().Center());
    }
  }

  Execute(player)
  {
    //if the player has been jostled out of position, get back in position
    if (!player.AtTarget())
    {
      player.Steering().ArriveOn();
      return;
    } else
    {
      player.Steering().ArriveOff();

      player.SetVelocity(new Phaser.Point(0, 0));

      //the player should keep his eyes on the ball!
      player.TrackBall();
    }

    //if this player's team is controlling AND this player is not the attacker
    //AND is further up the field than the attacker he should request a pass.
    if (player.Team().InControl()    &&
     (!player.isControllingPlayer()) &&
       player.isAheadOfAttacker())
    {
      player.Team().RequestPass(player);

      return;
    }

    if (player.Pitch().GameOn())
    {
      //if the ball is nearer this player than any other team member  AND
      //there is not an assigned receiver AND neither goalkeeper has
      //the ball, go chase it
      if (player.isClosestTeamMemberToBall() &&
       player.Team().Receiver() == null  &&
        !player.Pitch().GoalKeeperHasBall())
      {
        player.GetFSM().ChangeState(new ChaseBall());

        return;
      }
    }
  }

  Exit(player) {}

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'Wait';
  }
}




//************************************************************************ KICK BALL

class KickBall extends State
{
  constructor()
  {
    super('KickBall');
  }

  Enter(player)
  {
    //let the team know this player is controlling
    player.Team().SetControllingPlayer(player);

    //the player can only make so many kick attempts per second.
    if (!player.isReadyForNextKick())
    {
      player.GetFSM().ChangeState(new ChaseBall());
    }
  }

  Execute(player)
  {
    //calculate the dot product of the vector pointing to the ball
    //and the player's heading

    var ToBall = new Phaser.Point(player.Ball().Pos().x - player.Pos().x,
     player.Ball().Pos().y - player.Pos().y);
    var dot    = player.Heading().dot(ToBall.normalize());

    //cannot kick the ball if the goalkeeper is in possession or if it is
    //behind the player or if there is already an assigned receiver. So just
    //continue chasing the ball
    if (player.Team().Receiver() != null   ||
     player.Pitch().GoalKeeperHasBall() || (dot < 0))
    {
      player.GetFSM().ChangeState(new ChaseBall());

      return;
    }

    // Attempt a shot at the goal

    //the dot product is used to adjust the shooting force. The more
    //directly the ball is ahead, the more forceful the kick
    var power = Params.MaxShootingForce * dot;

    //if it is determined that the player could score a goal from this position
    //OR if he should just kick the ball anyway, the player will attempt
    //to make the shot

    var ret_canshoot = player.Team().CanShoot(player.Ball().Pos(), power);

    if (ret_canshoot[0] ||
     (Math.random() < Params.ChancePlayerAttemptsPotShot))
    {
      //if a shot is possible, this vector will hold the position along the
      //opponent's goal line the player should aim for.
      var BallTarget = ret_canshoot[1];
      //add some noise to the kick. We don't want players who are
      //too accurate! The amount of noise can be adjusted by altering
      //Prm.PlayerKickingAccuracy
      BallTarget = SoccerBall.AddNoiseToKick(player.Ball().Pos(), BallTarget);

      //this is the direction the ball will be kicked in
      var KickDirection = new Phaser.Point(BallTarget.x - player.Ball().Pos().x, BallTarget.y - player.Ball().Pos().y);

      player.Ball().Kick(KickDirection, power);

      //change state
      player.GetFSM().ChangeState(new Wait());

      player.FindSupport();

      return;
    }

    /* Attempt a pass to a player */

    //if a receiver is found this will point to it

    var receiver = null;

    power = Params.MaxPassingForce * dot;

    var ret_findpass = player.Team().FindPass(player, power, Params.MinPassDist);

    //test if there are any potential candidates available to receive a pass
    if (player.isThreatened() && ret_findpass[0])
    {
      var receiver = ret_findpass[1];
      var BallTarget = ret_findpass[2];

      //add some noise to the kick
      BallTarget = SoccerBall.AddNoiseToKick(player.Ball().Pos(), BallTarget);

      var KickDirection = new Phaser.Point(BallTarget.x - player.Ball().Pos().x, BallTarget.y - player.Ball().Pos().y);

      player.Ball().Kick(KickDirection, power);

      //let the receiver know a pass is coming
      GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
                               player.ID(),
                               receiver.ID(),
                               MessageType.Msg_ReceiveBall,
                               BallTarget);


      //the player should wait at his current position unless instruced
      //otherwise
      player.GetFSM().ChangeState(new Wait());

      player.FindSupport();

      return;
    }

    //cannot shoot or pass, so dribble the ball upfield
    else
    {
      player.FindSupport();

      player.GetFSM().ChangeState(new Dribble());
    }
  }

  Exit(player)
  {
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'KickBall';
  }
}

class Dribble extends State
{
  constructor()
  {
    super('Dribble');
  }

  Enter(player)
  {
    //let the team know this player is controlling
    player.Team().SetControllingPlayer(player);
  }

  Execute(player)
  {
    var dot = player.Team().HomeGoal().Facing().dot(player.Heading());

    //if the ball is between the player and the home goal, it needs to swivel
    // the ball around by doing multiple small kicks and turns until the player
    //is facing in the correct direction
    if (dot < 0)
    {
      //the player's heading is going to be rotated by a small amount (Pi/4)
      //and then the ball will be kicked in that direction
      var direction = player.Heading();

      //calculate the sign (+/-) of the angle between the player heading and the
      //facing direction of the goal so that the player rotates around in the
      //correct direction
      var angle = (Math.PI / 4) * -1 * Transformations.PointsSign(player.Team().HomeGoal().Facing(), player.Heading());

      direction.rotate(direction.x, direction.y, angle);

      //this value works well whjen the player is attempting to control the
      //ball and turn at the same time
      var KickingForce = 0.8;

      player.Ball().Kick(direction, KickingForce);
    }

    //kick the ball down the field
    else
    {
      player.Ball().Kick(player.Team().HomeGoal().Facing(),
                            Params.MaxDribbleForce);
    }

    //the player has kicked the ball so he must now change state to follow it
    player.GetFSM().ChangeState(new ChaseBall());

    return;
  }

  Exit(player)
  {
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'Dribble';
  }
}

class ReceiveBall extends State
{
  constructor()
  {
    super('ReceiveBall');
  }

  Enter(player)
  {
    //let the team know this player is receiving the ball
    player.Team().SetReceiver(player);

    //this player is also now the controlling player
    player.Team().SetControllingPlayer(player);

    //there are two types of receive behavior. One uses arrive to direct
    //the receiver to the position sent by the passer in its telegram. The
    //other uses the pursuit behavior to pursue the ball.
    //This statement selects between them dependent on the probability
    //ChanceOfUsingArriveTypeReceiveBehavior, whether or not an opposing
    //player is close to the receiving player, and whether or not the receiving
    //player is in the opponents 'hot region' (the third of the pitch closest
    //to the opponent's goal
    var PassThreatRadius = 70.0;

    if ((player.InHotRegion() ||
     Math.random() < Params.ChanceOfUsingArriveTypeReceiveBehavior) &&
      !player.Team().isOpponentWithinRadius(player.Pos(), PassThreatRadius))
    {
      player.Steering().ArriveOn();
    } else
    {
      player.Steering().PursuitOn();
    }
  }

  Execute(player)
  {
    //if the ball comes close enough to the player or if his team lose control
    //he should change state to chase the ball
    if (player.BallWithinReceivingRange() || !player.Team().InControl())
    {
      player.GetFSM().ChangeState(new ChaseBall());

      return;
    }

    if (player.Steering().PursuitIsOn())
    {
      player.Steering().SetTarget(player.Ball().Pos());
    }

    //if the player has 'arrived' at the steering target he should wait and
    //turn to face the ball
    if (player.AtTarget())
    {
      player.Steering().ArriveOff();
      player.Steering().PursuitOff();
      player.TrackBall();
      player.SetVelocity(new Phaser.Point(0, 0));
    }
  }

  Exit(player)
  {
    player.Steering().ArriveOff();
    player.Steering().PursuitOff();

    player.Team().SetReceiver(null);
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'ReceiveBall';
  }
}

module.exports.FieldPlayerStates = FieldPlayerStates;
module.exports.ChaseBall = ChaseBall;
module.exports.SupportAttacker = SupportAttacker;
module.exports.ReturnToHomeRegion = ReturnToHomeRegion;
module.exports.Wait = Wait;
module.exports.KickBall = KickBall;
module.exports.Dribble = Dribble;
module.exports.ReceiveBall = ReceiveBall;

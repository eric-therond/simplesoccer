'use strict';

var Params = require('./Params');

var SoccerMessagesExports = require('./SoccerMessages');
var SoccerMessages = SoccerMessagesExports.SoccerMessages;
var MessageType = SoccerMessagesExports.MessageType;

var MessageDispatcherExports = require('./MessageDispatcher');
var MessageDispatcher = MessageDispatcherExports.MessageDispatcher;
var SEND_MSG_IMMEDIATELY = MessageDispatcherExports.SEND_MSG_IMMEDIATELY;
var NO_ADDITIONAL_INFO = MessageDispatcherExports.NO_ADDITIONAL_INFO;
var SENDER_ID_IRRELEVANT = MessageDispatcherExports.SENDER_ID_IRRELEVANT;
var GLOBAL_MessageDispatcher = MessageDispatcherExports.GLOBAL_MessageDispatcher;

var MovingEntityExports = require('./MovingEntity');
var MovingEntity = MovingEntityExports.MovingEntity;

var SteeringBehaviorsExports = require('./SteeringBehaviors');
var SteeringBehaviors = SteeringBehaviorsExports.SteeringBehaviors;

var AutoListExports = require('./AutoList');
var ListMembers = AutoListExports.AutoList;

var PlayerBaseEnum = {
  ATTACKER: 1,
  DEFENDER: 2,
  GOALKEEPER: 3,
};

var region_modifier = {
  halfsize: 1,
  normal: 2,
};

class PlayerBase extends MovingEntity
{
  // hometeam type SoccerTeam
  constructor(game, home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role)
  {

    super(game, home_team.Pitch().GetRegionFromIndex(home_region).Center(), scale * 10.0, velocity, max_speed, heading, mass, Phaser.Point(scale, scale), max_turn_rate, max_force);

    ListMembers.push(this);

    Object.defineProperty(this, 'm_pTeam', {
      value: home_team,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_iDefaultRegion', {
      value: home_region,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    this.m_dDistSqToBall = Number.MAX_VALUE;
    this.m_iHomeRegion = home_region;
    this.m_PlayerRole = role;
    this.m_vecPlayerVB = [];
    this.m_vecPlayerVBTrans = [];

    var NumPlayerVerts = 4;
    var player = [new Phaser.Point(-3, 8), new Phaser.Point(3, 10), new Phaser.Point(3, -10), new Phaser.Point(-3, -8)];

    for (var vtx = 0; vtx < NumPlayerVerts; ++vtx)
    {
      this.m_vecPlayerVB.push(player[vtx]);

      //set the bounding radius to the length of the
      //greatest extent
      if (Math.abs(player[vtx].x) > this.m_dBoundingRadius)
      {
        this.m_dBoundingRadius = Math.abs(player[vtx].x);
      }

      if (Math.abs(player[vtx].y) > this.m_dBoundingRadius)
      {
        this.m_dBoundingRadius = Math.abs(player[vtx].y);
      }
    }

    //set up the steering behavior class
    this.m_pSteering = new SteeringBehaviors(this,
                                        this.m_pTeam.Pitch(),
                                        this.Ball());

    //a player's start target is its start position (because it's just waiting)
    this.m_pSteering.SetTarget(home_team.Pitch().GetRegionFromIndex(home_region).Center());
  }

  TrackBall()
  {
    this.RotateHeadingToFacePosition(this.Ball().Pos());
  }

  TrackTarget()
  {
    var diffx = this.Steering().Target().x - this.Pos().x;
    var diffy = this.Steering().Target().y - this.Pos().y;

    var newp = new Phaser.Point(diffx, diffy);

    this.SetHeading(newp.normalize());
  }

  SetDefaultHomeRegion()
  {this.m_iHomeRegion = this.m_iDefaultRegion;}

  SortByDistanceToOpponentsGoal(p1, p2)
  {
    return (p1.DistToOppGoal() < p2.DistToOppGoal());
  }

  SortByReversedDistanceToOpponentsGoal(p1, p2)
  {
    return (p1.DistToOppGoal() > p2.DistToOppGoal());
  }

  PositionInFrontOfPlayer(position)
  {
    var diffx = position.x - this.Pos().x;
    var diffy = position.y - this.Pos().y;
    var ToSubject = new Phaser.Point(diffx, diffy);

    if (ToSubject.dot(this.Heading()) > 0)
    {
      return true;
    } else
    {
      return false;
    }
  }

  isThreatened()
  {
    var opp = this.Team().Opponents().Members();

    for (var i = 0; i < opp.length; i++)
    {
      var currOpp = opp[i];

      var distsq = this.Pos().distance(currOpp.Pos()) * this.Pos().distance(currOpp.Pos());

      if (this.PositionInFrontOfPlayer(currOpp.Pos()) &&
       (distsq < Params.PlayerComfortZoneSq))
      {
        return true;
      }

    }// next opp

    return false;
  }

  FindSupport()
  {
    if (this.Team().SupportingPlayer() == null)
    {
      var BestSupportPly = this.Team().DetermineBestSupportingAttacker();

      this.Team().SetSupportingPlayer(BestSupportPly);

      GLOBAL_MessageDispatcher.DispatchMsg(
         SEND_MSG_IMMEDIATELY,
                              this.ID(),
                              this.Team().SupportingPlayer().ID(),
                              MessageType.Msg_SupportAttacker,
                              null);
    }

    var BestSupportPly = this.Team().DetermineBestSupportingAttacker();

    if (BestSupportPly && (BestSupportPly != this.Team().SupportingPlayer()))
    {

      if (this.Team().SupportingPlayer())
      {
        GLOBAL_MessageDispatcher.DispatchMsg(
           SEND_MSG_IMMEDIATELY,
                                this.ID(),
                                this.Team().SupportingPlayer().ID(),
                                MessageType.Msg_GoHome,
                                null);
      }

      this.Team().SetSupportingPlayer(BestSupportPly);

      GLOBAL_MessageDispatcher.DispatchMsg(
         SEND_MSG_IMMEDIATELY,
                              this.ID(),
                              this.Team().SupportingPlayer().ID(),
                              MessageType.Msg_SupportAttacker,
                              null);
    }
  }

  DistToOppGoal()
  {
    return Math.abs(this.Pos().x - this.Team().OpponentsGoal().Center().x);
  }

  DistToHomeGoal()
  {
    return Math.abs(this.Pos().x - this.Team().HomeGoal().Center().x);
  }

  AtTarget()
  {
    var distsq = this.Pos().distance(this.Steering().Target()) * this.Pos().distance(this.Steering().Target());
    return (distsq < Params.PlayerInTargetRangeSq);
  }

  InHotRegion()
  {
    return Math.abs(this.Pos().y - this.Team().OpponentsGoal().Center().y) <
           this.Pitch().PlayingArea().Length() / 3.0;
  }

  isAheadOfAttacker()
  {
    return Math.abs(this.Pos().x - this.Team().OpponentsGoal().Center().x) <
           Math.abs(this.Team().ControllingPlayer().Pos().x - this.Team().OpponentsGoal().Center().x);
  }

  Role()
  {
    return this.m_PlayerRole;
  }

  Team()
  {
    return this.m_pTeam;
  }

  InHomeRegion()
  {
    if (this.m_PlayerRole == PlayerBaseEnum.GOALKEEPER)
    {
      return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion).Inside(this.Pos(), region_modifier.normal);
    } else
    {
      return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion).Inside(this.Pos(), region_modifier.halfsize);
    }
  }

  isControllingPlayer()
  {
    return this.Team().ControllingPlayer() === this;
  }

  isClosestTeamMemberToBall()
  {
    return this.Team().PlayerClosestToBall() === this;
  }

  isClosestPlayerOnPitchToBall()
  {
    return this.isClosestTeamMemberToBall() &&
     (this.DistSqToBall() < this.Team().Opponents().ClosestDistToBallSq());
  }

  BallWithinKeeperRange()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.Ball().Pos().x, this.Ball().Pos().y) < Params.KeeperInBallRangeSq);
  }

  BallWithinReceivingRange()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.Ball().Pos().x, this.Ball().Pos().y) < Params.BallWithinReceivingRangeSq);
  }

  BallWithinKickingRange()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.Ball().Pos().x, this.Ball().Pos().y) < Params.PlayerKickingDistanceSq);
  }

  SetDistSqToBall(val)
  {
    this.m_dDistSqToBall = val;
  }

  DistSqToBall()
  {
    return this.m_dDistSqToBall;
  }

  Ball()
  {
    return this.Team().Pitch().Ball();
  }

  Pitch()
  {
    return this.Team().Pitch();
  }

  HomeRegion()
  {
    return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion);
  }

  SetHomeRegion(NewRegion)
  {
    this.m_iHomeRegion = NewRegion;
  }

  Steering()
  {
    return this.m_pSteering;
  }

  render()
  {
  }
}

module.exports.PlayerBase = PlayerBase;
module.exports.PlayerBaseEnum = PlayerBaseEnum;

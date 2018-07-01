'use strict';

var PlayerBaseExports = require('./PlayerBase');
var PlayerBase = PlayerBaseExports.PlayerBase;

var ColorTeamExports = require('./ColorTeam');
var ColorTeam = ColorTeamExports.ColorTeam;

var StateMachineExports = require('./StateMachine');
var StateMachine = StateMachineExports.StateMachine;

var RegulatorExports = require('./Regulator');
var Regulator = RegulatorExports.Regulator;

var GoalkeeperStatesExports = require('./GoalkeeperStates');
var GoalkeeperStates = GoalkeeperStatesExports.GoalkeeperStates;
var TendGoal = GoalkeeperStatesExports.TendGoal;
var ReturnHome = GoalkeeperStatesExports.ReturnHome;
var InterceptBall = GoalkeeperStatesExports.InterceptBall;
var PutBallBackInPlay = GoalkeeperStatesExports.PutBallBackInPlay;

var Params = require('./Params');

class Goalkeeper extends PlayerBase
{
  constructor(game, home_team, home_region, start_state, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role)
  {
    super(game, home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role);

    this.m_pStateMachine =  new StateMachine(this);

    //if (start_state)
    //{
    this.m_pStateMachine.SetCurrentState(start_state);
    this.m_pStateMachine.SetPreviousState(start_state);
    this.m_pStateMachine.SetGlobalState(new GoalkeeperStates());
    this.m_pStateMachine.CurrentState().Enter(this);
    //}
  }

  LookAt()
  {
    return new Phaser.Point(this.m_vLookAt.x, this.m_vLookAt.y);
  }

  SetLookAt(v)
  {
    this.m_vLookAt = new Phaser.Point(v.x, v.y);
  }

  HandleMessage(msg)
  {
    return this.m_pStateMachine.HandleMessage(msg);
  }

  Update(game)
  {
    this.text1.destroy();
    this.text2.destroy();

    this.text1 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 10, 'Neuer', { font: '12px Verdana', fill: '#ffffff' });
    this.text2 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 20, this.m_pStateMachine.GetNameOfCurrentState(), { font: '12px Verdana', fill: '#ffffff' });

    this.sprite.x = this.m_vPosition.x;
    this.sprite.y = this.m_vPosition.y;

    this.sprite_heading.x = this.m_vPosition.x;
    this.sprite_heading.y = this.m_vPosition.y;

    //run the logic for the current state
    this.m_pStateMachine.Update();

    //calculate the combined force from each steering behavior
    var SteeringForce = this.m_pSteering.Calculate();

    //Acceleration = Force/Mass
    var Accelerationx = SteeringForce.x / this.m_dMass;
    var Accelerationy = SteeringForce.y / this.m_dMass;

    //update velocity
    this.m_vVelocity.add(Accelerationx, Accelerationy);

    //make sure player does not exceed maximum velocity
    //this.m_vVelocity.Truncate(m_dMaxSpeed);

    if (this.m_vVelocity.getMagnitude() > this.m_dMaxSpeed)
   {
      this.m_vVelocity.normalize();
      this.m_vVelocity.x = this.m_vVelocity.x * this.m_dMaxSpeed;
      this.m_vVelocity.y = this.m_vVelocity.y * this.m_dMaxSpeed;
    }

    //update the position
    this.m_vPosition.add(this.m_vVelocity.x, this.m_vVelocity.y);


    //enforce a non-penetration constraint if desired
    if (Params.bNonPenetrationConstraint)
    {
      //EnforceNonPenetrationContraint(this, AutoList<PlayerBase>::GetAllMembers());
    }

    //update the heading if the player has a non zero velocity
    if (!this.m_vVelocity.isZero())
    {
      this.m_vHeading = new Phaser.Point(this.m_vVelocity.x, this.m_vVelocity.y).normalize();

      this.m_vSide = new Phaser.Point(this.m_vHeading.x, this.m_vHeading.y).perp();
    }

    //look-at vector always points toward the ball
    if (!this.Pitch().GoalKeeperHasBall())
    {
      var tempvec = new Phaser.Point(this.Ball().Pos().x - this.Pos().x, this.Ball().Pos().y - this.Pos().y);
      this.m_vLookAt = tempvec.normalize();
    }
  }

  BallWithinRangeForIntercept()
  {
    return (this.game.math.distanceSq(this.Team().HomeGoal().Center().x, this.Team().HomeGoal().Center().y, this.Ball().Pos().x, this.Ball().Pos().y) <= Params.GoalKeeperInterceptRangeSq);
  }

  TooFarFromGoalMouth()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.GetRearInterposeTarget().x, this.GetRearInterposeTarget().y) > Params.GoalKeeperInterceptRangeSq);
  }

  GetRearInterposeTarget()
  {
    var xPosTarget = this.Team().HomeGoal().Center().x;
    var yPosTarget = this.Pitch().PlayingArea().Center().y -
                       Params.GoalWidth * 0.5 + (this.Ball().Pos().y * Params.GoalWidth) /
                       this.Pitch().PlayingArea().Height();

    return new Phaser.Point(xPosTarget, yPosTarget);
  }

  GetFSM()
  {
    return this.m_pStateMachine;
  }

  Render(game)
  {
    this.sprite = game.add.sprite(this.m_vPosition.x, this.m_vPosition.y, 'ball');
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.scale.setTo(0.2, 0.2);

    if (this.m_pTeam.Color() == ColorTeam.RED)
     this.sprite.tint = 0xB40404;
    else
     this.sprite.tint = 0x0404B4;

    this.sprite_heading = game.add.sprite(this.m_vPosition.x, this.m_vPosition.y, 'arrow');
    this.sprite_heading.anchor.setTo(0.5, 0.5);
    this.sprite_heading.scale.setTo(0.2, 0.2);

    this.text1 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 10, 'neur', { font: '12px Verdana', fill: '#ffffff' });
    this.text2 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 20, this.m_pStateMachine.GetNameOfCurrentState(), { font: '12px Verdana', fill: '#ffffff' });
  }
}

module.exports.Goalkeeper = Goalkeeper;

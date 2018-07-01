'use strict';

var PlayerBaseExports = require('./PlayerBase');
var PlayerBase = PlayerBaseExports.PlayerBase;

var StateMachineExports = require('./StateMachine');
var StateMachine = StateMachineExports.StateMachine;

var ColorTeamExports = require('./ColorTeam');
var ColorTeam = ColorTeamExports.ColorTeam;

var RegulatorExports = require('./Regulator');
var Regulator = RegulatorExports.Regulator;

var FieldPlayerStatesExports = require('./FieldPlayerStates');
var FieldPlayerStates = FieldPlayerStatesExports.FieldPlayerStates;

var ChaseBall = FieldPlayerStatesExports.ChaseBall;
var SupportAttacker = FieldPlayerStatesExports.SupportAttacker;
var ReturnToHomeRegion = FieldPlayerStatesExports.ReturnToHomeRegion;
var Wait = FieldPlayerStatesExports.Wait;
var KickBall = FieldPlayerStatesExports.KickBall;
var Dribble = FieldPlayerStatesExports.Dribble;
var ReceiveBall = FieldPlayerStatesExports.ReceiveBall;

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

var Params = require('./Params');

function listener()
{
  document.getElementById('player').style.display = 'block';
}

function clamp(val, min, max)
{
  return Math.max(min, Math.min(max, val));
}

class FieldPlayer extends PlayerBase
{
  constructor(game, home_team, home_region, start_state, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role)
  {
    super(game, home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role);

    this.m_pStateMachine =  new StateMachine(this);

    if (start_state)
    {
      this.m_pStateMachine.SetCurrentState(start_state);
      this.m_pStateMachine.SetPreviousState(start_state);
      this.m_pStateMachine.SetGlobalState(new FieldPlayerStates());
      this.m_pStateMachine.CurrentState().Enter(this);
    }

    this.m_pSteering.SeparationOn();

    //set up the kick regulator
    this.m_pKickLimiter = new Regulator(Params.PlayerKickFrequency);
  }

  HandleMessage(msg)
  {
    return this.m_pStateMachine.HandleMessage(msg);
  }

  GetFSM()
  {
    return this.m_pStateMachine;
  }

  isReadyForNextKick()
  {
    return this.m_pKickLimiter.isReady();
  }

  RenderDetailsPlayer(sprite, pointer)
  {
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

    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(this.RenderDetailsPlayer, this);

    this.sprite_heading = game.add.sprite(this.m_vPosition.x, this.m_vPosition.y, 'arrow');
    this.sprite_heading.anchor.setTo(0.5, 0.5);
    this.sprite_heading.scale.setTo(0.2, 0.2);

    this.text1 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 10, 'Ronaldo - ' + this.ID(), { font: '12px Verdana', fill: '#ffffff' });
    this.text2 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 20, this.m_pStateMachine.GetNameOfCurrentState(), { font: '12px Verdana', fill: '#ffffff' });
  }

  Update(game)
  {
    this.text1.destroy();
    this.text2.destroy();

    this.text1 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 10, 'Ronaldo - ' + this.ID(), { font: '12px Verdana', fill: '#ffffff' });
    this.text2 = game.add.text(this.m_vPosition.x - 30, this.m_vPosition.y + 20, this.m_pStateMachine.GetNameOfCurrentState(), { font: '12px Verdana', fill: '#ffffff' });

    this.sprite.x = this.m_vPosition.x;
    this.sprite.y = this.m_vPosition.y;

    this.sprite_heading.x = this.m_vPosition.x;
    this.sprite_heading.y = this.m_vPosition.y;

    this.m_pStateMachine.Update();
    this.m_pSteering.Calculate();

    if (Transformations.isZero(this.m_pSteering.Force()))
    {
      var BrakingRate = 0.8;

      this.m_vVelocity = new Phaser.Point(this.m_vVelocity.x * BrakingRate, this.m_vVelocity.y * BrakingRate);
    }

    var TurningForce = this.m_pSteering.SideComponent();

    TurningForce = Transformations.Clamp(TurningForce, -Params.PlayerMaxTurnRate, Params.PlayerMaxTurnRate);

    //rotate the heading vector
    this.m_vHeading.rotate(0, 0, TurningForce);

    this.sprite_heading.rotation += TurningForce;

    //make sure the velocity vector points in the same direction as
    //the heading vector
    this.m_vVelocity = new Phaser.Point(this.m_vHeading.x * this.m_vVelocity.getMagnitude(), this.m_vHeading.y * this.m_vVelocity.getMagnitude());

    //and recreate m_vSide
    this.m_vSide = new Phaser.Point(this.m_vHeading.x, this.m_vHeading.y).perp();

    //now to calculate the acceleration due to the force exerted by
    //the forward component of the steering force in the direction
    //of the player's heading

    var tmpvalue = this.m_pSteering.ForwardComponent() / this.m_dMass;
    var accel = new Phaser.Point(this.m_vHeading.x * tmpvalue, this.m_vHeading.y * tmpvalue);

    this.m_vVelocity.add(accel.x, accel.y);

    //make sure player does not exceed maximum velocity
    //this.m_vVelocity.Truncate(m_dMaxSpeed);
    //console.log("Calculate m_vVelocity\n");
    Transformations.Truncate(this.m_vVelocity, this.m_dMaxSpeed);
    /*
    if (this.m_vVelocity.getMagnitude() > this.m_dMaxSpeed)
    {
     this.m_vVelocity.normalize();
     this.m_vVelocity.x = this.m_vVelocity.x * this.m_dMaxSpeed;
     this.m_vVelocity.y = this.m_vVelocity.y * this.m_dMaxSpeed;
    }
  */
    //update the position
    this.m_vPosition.add(this.m_vVelocity.x, this.m_vVelocity.y);

    /*
      //enforce a non-penetration constraint if desired
      if(Params.bNonPenetrationConstraint)
      {
       //EnforceNonPenetrationContraint(this, AutoList<PlayerBase>::GetAllMembers());
      }*/

  }
}

module.exports.FieldPlayer = FieldPlayer;

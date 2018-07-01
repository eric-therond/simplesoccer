'use strict';

var BaseGameEntityExports = require('./BaseGameEntity');
var BaseGameEntity = BaseGameEntityExports.BaseGameEntity;

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

class MovingEntity extends BaseGameEntity
{
  constructor(game, position, radius, velocity, max_speed, heading, mass, scale, turn_rate, max_force)
  {
    super(BaseGameEntity.GetNextValidID(), game);

    this.m_vPosition = position;
    this.m_dBoundingRadius = radius;
    this.m_vScale = scale;

    // direction
    this.m_vheading_angle = 0;
    this.m_vHeading = heading; //2dvector
    this.m_vVelocity = velocity; //2dvector
    this.m_vSide = new Phaser.Point(this.m_vHeading.x, this.m_vHeading.y).perp(); //2dvector
    this.m_dMass = mass;
    this.m_dMaxSpeed = max_speed;
    this.m_dMaxForce = max_force;
    this.m_dMaxTurnRate = turn_rate;
  }

  Velocity()
  {
    return new Phaser.Point(this.m_vVelocity.x, this.m_vVelocity.y);
  }

  SetVelocity(NewVel)
  {
    this.m_vVelocity = new Phaser.Point(NewVel.x, NewVel.y);
  }

  Mass()
  {
    return this.m_dMass;
  }

  Side()
  {
    return new Phaser.Point(this.m_vSide.x, this.m_vSide.y);
  }

  MaxForce()
  {
    return this.m_dMaxForce;
  }

  SetMaxForce(mf)
  {
    this.m_dMaxForce = mf;
  }

  IsSpeedMaxedOut()
  {
    return this.m_dMaxSpeed * this.m_dMaxSpeed >= this.m_vVelocity.getMagnitude();
  }

  Speed()
  {
    return this.m_vVelocity.getMagnitude();
  }

  SpeedSq()
  {
    return this.m_vVelocity.getMagnitudeSq();
  }

  Heading()
  {
    return new Phaser.Point(this.m_vHeading.x, this.m_vHeading.y);
  }

  SetHeading(new_heading)
  {
    this.m_vHeading = new Phaser.Point(new_heading.x, new_heading.y);

    //the side vector must always be perpendicular to the heading
    this.m_vSide = new Phaser.Point(this.m_vHeading.x, this.m_vHeading.y).perp();
  }

  MaxTurnRate()
  {
    return this.m_dMaxTurnRate;
  }

  SetMaxTurnRate(val)
  {
    this.m_dMaxTurnRate = val;
  }

  BRadius()
  {
    return this.m_dBoundingRadius;
  }

  SetMaxSpeed(new_speed)
  {
    this.m_dMaxSpeed = new_speed;
  }

  MaxSpeed()
{
    return this.m_dMaxSpeed;
  }

  Pos()
  {
    return new Phaser.Point(this.m_vPosition.x, this.m_vPosition.y);
  }

  RotateHeadingToFacePosition(target)
  {
    var toTarget = new Phaser.Point(target.x - this.m_vPosition.x, target.y - this.m_vPosition.y).normalize();

    var dot = this.m_vHeading.dot(toTarget);

    var angle = Math.acos(dot);

    //return true if the player is facing the target
    if (angle < 0.00001) return true;

    //clamp the amount to turn to the max turn rate
    if (angle > this.m_dMaxTurnRate) angle = this.m_dMaxTurnRate;

    var RotationMatrix = new Phaser.Matrix;
    RotationMatrix.rotate(angle * Transformations.PointsSign(this.m_vHeading, toTarget));
    this.m_vHeading = RotationMatrix.apply(this.m_vHeading);
    this.m_vVelocity = RotationMatrix.apply(this.m_vVelocity);

    //finally recreate m_vSide
    this.m_vSide = new Phaser.Point(this.m_vHeading.x, this.m_vHeading.y).perp();

    return false;
  }
}

module.exports.MovingEntity = MovingEntity;

'use strict';

var Params = require('./Params');

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

var AutoListExports = require('./AutoList');
var ListMembers = AutoListExports.AutoList;

var behavior_type = {
    none: 0x0000,
    seek: 0x0001,
    arrive: 0x0002,
    separation: 0x0004,
    pursuit: 0x0008,
    interpose: 0x0010,
  };

var Deceleration = {
    slow: 3,
    normal: 2,
    fast: 1,
  };

class SteeringBehaviors
{
  // hometeam type SoccerTeam
  constructor(agent, world, ball)
  {
    this.m_pPlayer = agent;
    this.m_iFlags = 0;
    this.m_dMultSeparation = Params.SeparationCoefficient;
    this.m_bTagged = false;
    this.m_dViewDistance = Params.ViewDistance;
    this.m_pBall = ball;
    this.m_dInterposeDist = 0.0;
    this.m_Antenna = new Phaser.Point(5, 0);

    this.m_vSteeringForce = new Phaser.Point(0, 0);
  }

  AccumulateForce(sf, ForceToAdd)
  {
    //first calculate how much steering force we have left to use
    var MagnitudeSoFar = sf.getMagnitude();

    var magnitudeRemaining = this.m_pPlayer.MaxForce() - MagnitudeSoFar;

    //return false if there is no more force left to use
    if (magnitudeRemaining <= 0.0)
     return false;

    //calculate the magnitude of the force we want to add
    var MagnitudeToAdd = ForceToAdd.getMagnitude();

    //now calculate how much of the force we can really add
    if (MagnitudeToAdd > magnitudeRemaining)
    {
      MagnitudeToAdd = magnitudeRemaining;
    }

    //add it to the steering force
    var temp = new Phaser.Point(ForceToAdd.x, ForceToAdd.y).normalize();
    sf.add(temp.x * MagnitudeToAdd, temp.y * MagnitudeToAdd);

    return true;
  }

  Calculate()
  {
    //reset the force
    this.m_vSteeringForce.set(0, 0);

    //this will hold the value of each individual steering force
    this.m_vSteeringForce = this.SumForces();

    //make sure the force doesn't exceed the vehicles maximum allowable
    //this.m_vSteeringForce.Truncate(this.m_pPlayer.MaxForce());

    //console.log("Calculate m_vSteeringForce\n");
    Transformations.Truncate(this.m_vSteeringForce, this.m_pPlayer.MaxForce());

    return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
  }

  SumForces()
  {
    var force = new Phaser.Point(0, 0);

    this.FindNeighbours();

    if (this.On(behavior_type.separation))
    {
      var separation = this.Separation();
      var tmpx = separation.x * this.m_dMultSeparation;
      var tmpy = separation.y * this.m_dMultSeparation;

      force.add(tmpx, tmpy);

      if (!this.AccumulateForce(this.m_vSteeringForce, force))
       return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
    }

    if (this.On(behavior_type.seek))
    {
      var seek = this.Seek(this.m_vTarget);
      force.add(seek.x, seek.y);

      if (!this.AccumulateForce(this.m_vSteeringForce, force))
       return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
    }

    if (this.On(behavior_type.arrive))
    {
      var arrive = this.Arrive(this.m_vTarget, Deceleration.fast);
      force.add(arrive.x, arrive.y);

      if (!this.AccumulateForce(this.m_vSteeringForce, force))
       return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
    }

    if (this.On(behavior_type.pursuit))
    {
      var pursuit = this.Pursuit(this.m_pBall);
      force.add(pursuit.x, pursuit.y);

      if (!this.AccumulateForce(this.m_vSteeringForce, force))
       return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
    }

    if (this.On(behavior_type.interpose))
    {
      var interpose = this.Interpose(this.m_pBall, this.m_vTarget, this.m_dInterposeDist);
      force.add(interpose.x, interpose.y);

      if (!this.AccumulateForce(this.m_vSteeringForce, force))
       return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
    }

    return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
  }

  //------------------------- ForwardComponent -----------------------------
  //
  //  calculates the forward component of the steering force
  //------------------------------------------------------------------------
  ForwardComponent()
  {
    return this.m_pPlayer.Heading().dot(this.m_vSteeringForce);
  }

  //--------------------------- SideComponent ------------------------------
  //
  //  //  calculates the side component of the steering force
  //------------------------------------------------------------------------
  SideComponent()
  {
    return this.m_pPlayer.Side().dot(this.m_vSteeringForce) * this.m_pPlayer.MaxTurnRate();
  }


  //------------------------------- Seek -----------------------------------
  //
  //  Given a target, this behavior returns a steering force which will
  //  allign the agent with the target and move the agent in the desired
  //  direction
  //------------------------------------------------------------------------
  Seek(target)
  {
    var temppoint = new Phaser.Point(target.x - this.m_pPlayer.Pos().x, target.y - this.m_pPlayer.Pos().y).normalize();
    var DesiredVelocity = new Phaser.Point((temppoint.x * this.m_pPlayer.MaxSpeed()) - this.m_pPlayer.Velocity().x,
     (temppoint.y * this.m_pPlayer.MaxSpeed()) - this.m_pPlayer.Velocity().y);

    return DesiredVelocity;
  }


  //--------------------------- Arrive -------------------------------------
  //
  //  This behavior is similar to seek but it attempts to arrive at the
  //  target with a zero velocity
  //------------------------------------------------------------------------
  Arrive(target, deceleration)
  {
    var ToTarget = new Phaser.Point(target.x - this.m_pPlayer.Pos().x,
     target.y - this.m_pPlayer.Pos().y);

    //calculate the distance to the target
    var dist = ToTarget.getMagnitude();

    if (dist > 0)
    {
      //because Deceleration is enumerated as an int, this value is required
      //to provide fine tweaking of the deceleration..
      var DecelerationTweaker = 0.3;

      //calculate the speed required to reach the target given the desired
      //deceleration
      var speed =  dist / (deceleration * DecelerationTweaker);

      //make sure the velocity does not exceed the max
      speed = Math.min(speed, this.m_pPlayer.MaxSpeed());
      //from here proceed just like Seek except we don't need to normalize
      //the ToTarget vector because we have already gone to the trouble
      //of calculating its length: dist.

      var DesiredVelocity =  new Phaser.Point(ToTarget.x * speed / dist, ToTarget.y * speed / dist);

      var newArrive = new Phaser.Point(DesiredVelocity.x - this.m_pPlayer.Velocity().x,
       DesiredVelocity.y - this.m_pPlayer.Velocity().y);

      return newArrive;
    }

    return new Phaser.Point(0, 0);
  }


  //------------------------------ Pursuit ---------------------------------
  //
  //  this behavior creates a force that steers the agent towards the
  //  ball
  //------------------------------------------------------------------------
  Pursuit(ball)
  {
    var ToBall = new Phaser.Point(ball.Pos().x - this.m_pPlayer.Pos().x,
     ball.Pos().y - this.m_pPlayer.Pos().y);

    //the lookahead time is proportional to the distance between the ball
    //and the pursuer;
    var LookAheadTime = 0;

    if (ball.Speed() != 0)
    {
      LookAheadTime = ToBall.getMagnitude() / ball.Speed();
    }

    //calculate where the ball will be at this time in the future
    this.m_vTarget = ball.FuturePosition(LookAheadTime);

    //now seek to the predicted future position of the ball
    return this.Arrive(this.m_vTarget, Deceleration.fast);
  }

  //-------------------------- FindNeighbours ------------------------------
  //
  //  tags any vehicles within a predefined radius
  //------------------------------------------------------------------------
  FindNeighbours()
  {
    var AllPlayers = ListMembers.GetAllMembers();

    for (var curPlyr = 0; curPlyr != AllPlayers.length; curPlyr++)
    {
      //first clear any current tag
      AllPlayers[curPlyr].Steering().UnTag();

      //work in distance squared to avoid sqrts
      var to = new Phaser.Point(AllPlayers[curPlyr].Pos().x -  this.m_pPlayer.Pos().x,
       AllPlayers[curPlyr].Pos().y -  this.m_pPlayer.Pos().y);

      if (to.getMagnitudeSq() < (this.m_dViewDistance * this.m_dViewDistance))
      {
        AllPlayers[curPlyr].Steering().Tag();
      }
    }//next
  }


  //---------------------------- Separation --------------------------------
  //
  // this calculates a force repelling from the other neighbors
  //------------------------------------------------------------------------
  Separation()
  {
    var SteeringForce = new Phaser.Point(0, 0);
    var AllPlayers = ListMembers.GetAllMembers();

    for (var curPlyr = 0; curPlyr != AllPlayers.length; curPlyr++)
    {
      //make sure this agent isn't included in the calculations and that
      //the agent is close enough
      if ((AllPlayers[curPlyr] !== this.m_pPlayer) && AllPlayers[curPlyr].Steering().Tagged())
      {
        var ToAgentx = this.m_pPlayer.Pos().x - AllPlayers[curPlyr].Pos().x;
        var ToAgenty = this.m_pPlayer.Pos().y - AllPlayers[curPlyr].Pos().y;

       //scale the force inversely proportional to the agents distance
        //from its neighbor.
        var ToAgent = new Phaser.Point(ToAgentx, ToAgenty);
        var ToAgentnorm = new Phaser.Point(ToAgent.x, ToAgent.y).normalize();
        var addfx = (ToAgentnorm.x / ToAgent.getMagnitude());
        var addfy = (ToAgentnorm.y / ToAgent.getMagnitude());
        SteeringForce.add(addfx, addfy);
      }
    }

    return SteeringForce;
  }

  //--------------------------- Interpose ----------------------------------
  //
  //  Given an opponent and an object position this method returns a
  //  force that attempts to position the agent between them
  //------------------------------------------------------------------------
  Interpose(ball, target, DistFromTarget)
  {
    var temp1 = new Phaser.Point(ball.Pos().x - target.x, ball.Pos().y - target.y).normalize();
    var temp2 = new Phaser.Point(target.x + temp1.x * DistFromTarget, target.y + temp1.y * DistFromTarget);

    return this.Arrive(temp2, Deceleration.normal);
  }

  RenderAids()
  {
    //render the steering force
    //gdi->RedPen();

    //gdi->Line(m_pPlayer->Pos(), m_pPlayer->Pos() + m_vSteeringForce * 20);
  }

  On(bt)
  {
    return (this.m_iFlags & bt) == bt;
  }

  Force()
  {
    return new Phaser.Point(this.m_vSteeringForce.x, this.m_vSteeringForce.y);
  }

  Target()
  {
    return new Phaser.Point(this.m_vTarget.x, this.m_vTarget.y);
  }

  SetTarget(t)
  {
    this.m_vTarget = new Phaser.Point(t.x, t.y);
  }

  InterposeDistance()
  {
    return this.m_dInterposeDist;
  }

  SetInterposeDistance(d)
  {
    this.m_dInterposeDist = d;
  }

  Tagged()
  {
    return this.m_bTagged;
  }

  Tag()
  {
    this.m_bTagged = true;
  }

  UnTag()
  {
    this.m_bTagged = false;
  }

  SeekOn()
  {
    this.m_iFlags |= behavior_type.seek;
  }

  ArriveOn()
  {
    this.m_iFlags |= behavior_type.arrive;
  }

  PursuitOn()
  {
    this.m_iFlags |= behavior_type.pursuit;
  }

  SeparationOn()
  {
    this.m_iFlags |= behavior_type.separation;
  }

  InterposeOn(d)
  {
    this.m_iFlags |= behavior_type.interpose;
    this.m_dInterposeDist = d;
  }

  SeekOff()
  {
    if (this.On(behavior_type.seek))
     this.m_iFlags ^= behavior_type.seek;
  }

  ArriveOff()
  {
    if (this.On(behavior_type.arrive))
     this.m_iFlags ^= behavior_type.arrive;
  }

  PursuitOff()
  {
    if (this.On(behavior_type.pursuit))
     this.m_iFlags ^= behavior_type.pursuit;
  }

  SeparationOff()
  {
    if (this.On(behavior_type.separation))
     this.m_iFlags ^= behavior_type.separation;
  }

  InterposeOff()
  {
    if (this.On(behavior_type.interpose))
     this.m_iFlags ^= behavior_type.interpose;
  }

  SeekIsOn()
  {
    return this.On(behavior_type.seek);
  }

  ArriveIsOn()
  {
    return this.On(behavior_type.arrive);
  }

  PursuitIsOn()
  {
    return this.On(behavior_type.pursuit);
  }

  SeparationIsOn()
  {
    return this.On(behavior_type.separation);
  }

  InterposeIsOn()
  {
    return this.On(behavior_type.interpose);
  }

}

module.exports.SteeringBehaviors = SteeringBehaviors;

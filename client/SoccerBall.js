'use strict';

var MovingEntityExports = require('./MovingEntity');
var MovingEntity = MovingEntityExports.MovingEntity;

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

var Params = require('./Params');

var span_type = {
  plane_backside: 1,
  plane_front: 2,
  on_plane: 3,
};

function WhereIsPoint(point, PointOnPlane, PlaneNormal)
{
  var dir = new Phaser.Point(PointOnPlane.x - point.x, PointOnPlane.y - point.y);

  var d = dir.dot(PlaneNormal);

  if (d < -0.000001)
  {
    return span_type.plane_front;
  } else if (d > 0.000001)
  {
    return span_type.plane_backside;
  }

  return span_type.on_plane;
}

function DistanceToRayPlaneIntersection(RayOrigin, RayHeading, PlanePoint, PlaneNormal)
{
  var d     = -PlaneNormal.dot(PlanePoint);
  var numer = PlaneNormal.dot(RayOrigin) + d;
  var denom = PlaneNormal.dot(RayHeading);

  // normal is parallel to vector
  if ((denom < 0.000001) && (denom > -0.000001))
  {
    return (-1.0);
  }

  return -(numer / denom);
}

class SoccerBall extends MovingEntity
{
  // pos ballsize mass pitchboundary
  constructor(game, pos, BallSize, mass, PitchBoundary)
  {
    super(game, pos, BallSize, new Phaser.Point(0, 0), -1, new Phaser.Point(0, 1), mass, new Phaser.Point(1, 1), 0, 0);

    this.m_PitchBoundary = PitchBoundary;
  }

  //---------------------- TimeToCoverDistance -----------------------------
  //
  //  Given a force and a distance to cover given by two vectors, this
  //  method calculates how long it will take the ball to travel between
  //  the two points
  //------------------------------------------------------------------------
  TimeToCoverDistance(A, B, force)
  {
    //this will be the velocity of the ball in the next time step *if*
    //the player was to make the pass.
    var speed = force / this.m_dMass;

    //calculate the velocity at B using the equation
    //
    //  v^2 = u^2 + 2as
    //

    //first calculate s (the distance between the two positions)
    var DistanceToCover =  A.distance(B);

    var term = speed * speed + 2.0 * DistanceToCover * Params.Friction;

    //if  (u^2 + 2as) is negative it means the ball cannot reach point B.
    if (term <= 0.0) return -1.0;

    var v = Math.sqrt(term);

    //it IS possible for the ball to reach B and we know its speed when it
    //gets there, so now it's easy to calculate the time using the equation
    //
    //    t = v-u
    //        ---
    //         a
    //
    return (v - speed) / Params.Friction;
  }

  Render(game)
  {
    this.sprite = game.add.sprite(this.m_vPosition.x, this.m_vPosition.y, 'ball');
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.scale.setTo(0.2, 0.2);
  }

  static getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  static AddNoiseToKick(BallPos, BallTarget)
  {

    var displacement = (Math.PI - Math.PI * Params.PlayerKickingAccuracy) * SoccerBall.getRandomArbitrary(-1, 1);

    var toTarget = new Phaser.Point(BallTarget.x - BallPos.x, BallTarget.y - BallPos.y);

    //toTarget.rotation += displacement;

    toTarget.rotate(0, 0, displacement);

    return new Phaser.Point(toTarget.x + BallPos.x, toTarget.y + BallPos.y);
  }

  Kick(direction, force)
  {
    //ensure direction is normalized
    direction.normalize();

    //calculate the acceleration
    var acceleration_x = (direction.x * force) / this.m_dMass;
    var acceleration_y = (direction.y * force) / this.m_dMass;

    //update the velocity
    this.m_vVelocity = new Phaser.Point(acceleration_x, acceleration_y);
  }

  Update(game)
  {
    //keep a record of the old position so the goal::scored method
    //can utilize it for goal testing
    this.m_vOldPos = new Phaser.Point(this.m_vPosition.x, this.m_vPosition.y);

    this.sprite.x = this.m_vPosition.x;
    this.sprite.y = this.m_vPosition.y;


    //Test for collisions
    this.TestCollisionWithWalls(this.m_PitchBoundary);

    //Simulate Prm.Friction. Make sure the speed is positive
    //first though

    if (this.m_vVelocity.getMagnitudeSq() > (Params.Friction * Params.Friction))
    {
      var temp = new Phaser.Point(this.m_vVelocity.x, this.m_vVelocity.y).normalize();
      this.m_vVelocity.add(temp.x * Params.Friction, temp.y * Params.Friction);
      this.m_vPosition.add(this.m_vVelocity.x, this.m_vVelocity.y);

      //update heading
      this.m_vHeading = new Phaser.Point(this.m_vVelocity.x, this.m_vVelocity.y).normalize();
    }

  }

  TimeToCoverDistance(A, B, force)
  {
    //this will be the velocity of the ball in the next time step *if*
    //the player was to make the pass.
    var speed = force / this.m_dMass;

    //calculate the velocity at B using the equation
    //
    //  v^2 = u^2 + 2as
    //

    //first calculate s (the distance between the two positions)

    var DistanceToCover =  A.distance(B);

    var term = speed * speed + 2.0 * DistanceToCover * Params.Friction;

    //if  (u^2 + 2as) is negative it means the ball cannot reach point B.
    if (term <= 0.0) return -1.0;

    var v = Math.sqrt(term);

    //it IS possible for the ball to reach B and we know its speed when it
    //gets there, so now it's easy to calculate the time using the equation
    //
    //    t = v-u
    //        ---
    //         a
    //
    return (v - speed) / Params.Friction;
  }

  FuturePosition(time)
  {
    //using the equation s = ut + 1/2at^2, where s = distance, a = friction
    //u=start velocity

    //calculate the ut term, which is a vector
    var utx = this.m_vVelocity.x * time;
    var uty = this.m_vVelocity.y * time;

    //calculate the 1/2at^2 term, which is scalar
    var half_a_t_squared = 0.5 * Params.Friction * time * time;

    //turn the scalar quantity into a vector by multiplying the value with
    //the normalized velocity vector (because that gives the direction)
    var norm = new Phaser.Point(this.m_vVelocity.x, this.m_vVelocity.y).normalize();
    var ScalarToVectorx = half_a_t_squared * norm.x;
    var ScalarToVectory = half_a_t_squared * norm.y;

    //the predicted position is the balls position plus these two terms
    return new Phaser.Point(this.Pos().x + utx + ScalarToVectorx, this.Pos().y + uty + ScalarToVectory);
  }

  TestCollisionWithWalls(walls)
  {
    //test ball against each wall, find out which is closest
    var idxClosest = -1;

    var VelNormal = new Phaser.Point(this.m_vVelocity.x, this.m_vVelocity.y).normalize();

    var IntersectionPoint;
    var CollisionPoint;

    var DistToIntersection = Number.MAX_VALUE;

    //iterate through each wall and calculate if the ball intersects.
    //If it does then store the index into the closest intersecting wall
    for (var w = 0; w < walls.length; ++w)
    {
      //assuming a collision if the ball continued on its current heading
      //calculate the point on the ball that would hit the wall. This is
      //simply the wall's normal(inversed) multiplied by the ball's radius
      //and added to the balls center (its position)
      var ThisCollisionPoint = new Phaser.Point(this.Pos().x - (walls[w].Normal().x * this.BRadius()), this.Pos().y - (walls[w].Normal().y * this.BRadius()));

      //calculate exactly where the collision point will hit the plane
      if (WhereIsPoint(ThisCollisionPoint,
		      walls[w].From(),
		      walls[w].Normal()) == span_type.plane_backside)
      {
        var DistToWall = DistanceToRayPlaneIntersection(ThisCollisionPoint,
             walls[w].Normal(),
             walls[w].From(),
             walls[w].Normal());

        IntersectionPoint = Phaser.Point.add(ThisCollisionPoint, new Phaser.Point(DistToWall * walls[w].Normal().x, DistToWall * walls[w].Normal().y));

      } else
      {
        var DistToWall = DistanceToRayPlaneIntersection(ThisCollisionPoint,
             VelNormal,
             walls[w].From(),
             walls[w].Normal());

        IntersectionPoint = Phaser.Point.add(ThisCollisionPoint, new Phaser.Point(DistToWall * VelNormal, DistToWall * VelNormal));

      }

      //check to make sure the intersection point is actually on the line
      //segment
      var OnLineSegment = false;

      var line1 = new Phaser.Line(walls[w].From().x, walls[w].From().y, walls[w].To().x, walls[w].To().y);
      var line2 = new Phaser.Line(ThisCollisionPoint.x - walls[w].Normal().x * 20.0, ThisCollisionPoint.y - walls[w].Normal().y * 20.0, ThisCollisionPoint.x + walls[w].Normal().x * 20.0, ThisCollisionPoint.y + walls[w].Normal().y * 20.0);

      line1.intersects(line2, true);

      if (line1.intersects(line2, true))
      {

        OnLineSegment = true;
      }


      //Note, there is no test for collision with the end of a line segment

      //now check to see if the collision point is within range of the
      //velocity vector. [work in distance squared to avoid sqrt] and if it
      //is the closest hit found so far.
      //If it is that means the ball will collide with the wall sometime
      //between this time step and the next one.
      var distSq = ThisCollisionPoint.distance(IntersectionPoint) * ThisCollisionPoint.distance(IntersectionPoint);

      if ((distSq <= this.m_vVelocity.getMagnitudeSq()) && (distSq < DistToIntersection) && OnLineSegment)
      {
        DistToIntersection = distSq;
        idxClosest = w;
        CollisionPoint = IntersectionPoint;
      }
    }//next wall


    //to prevent having to calculate the exact time of collision we
    //can just check if the velocity is opposite to the wall normal
    //before reflecting it. This prevents the case where there is overshoot
    //and the ball gets reflected back over the line before it has completely
    //reentered the playing area.
    if ((idxClosest >= 0) && VelNormal.dot(walls[idxClosest].Normal()) < 0)
    {
      Transformations.Reflect(this.m_vVelocity, walls[idxClosest].Normal());
    }
  }

  PlaceAtPosition(NewPos)
  {
    this.m_vOldPos = new Phaser.Point(this.m_vPosition.x, this.m_vPosition.y);

    this.m_vPosition = new Phaser.Point(NewPos.x, NewPos.y);

    this.m_vVelocity.setTo(0, 0);
  }

  HandleMessage(msg) {return false;}

  Trap() {

    this.m_vVelocity.setTo(0, 0);}

  OldPos() {return new Phaser.Point(this.m_vOldPos.x, this.m_vOldPos.y);}
}

module.exports.SoccerBall = SoccerBall;

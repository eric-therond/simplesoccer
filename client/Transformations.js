'use strict';

class Transformations
{
  constructor()
  {
  }

  static PointsSign(heading, target)
  {
    if (heading.y * target.x > heading.x * target.y)
    {
      return -1;
    } else
    {
      return 1;
    }
  }

  static PointToLocalSpace(point, AgentHeading, AgentSide, AgentPosition)
  {
    //make a copy of the point
    var TransPoint = new Phaser.Point(point.x, point.y);
    var NewTransPoint = new Phaser.Point(0, 0);

    var matTransform = new Phaser.Matrix;

    var Tx = AgentPosition.dot(AgentHeading) * -1;
    var Ty = AgentPosition.dot(AgentSide) * -1;

    matTransform.setTo(AgentHeading.x, AgentSide.x, AgentHeading.y, AgentSide.y, Tx, Ty);
    matTransform.apply(TransPoint, NewTransPoint);

    return NewTransPoint;
  }

  static isZero(point)
  {
    return (point.x * point.x + point.y * point.y) < Number.MIN_VALUE;
  }

  static Truncate(point, max)
  {
    if (point.getMagnitude() > max)
    {
      point.normalize();

      point.x = point.x * max;
      point.y = point.y * max;
    }
  }

  static Clamp(arg, minVal, maxVal)
  {
    if (arg < minVal)
    {
      arg = minVal;
    }

    if (arg > maxVal)
    {
      arg = maxVal;
    }

    return arg;
  }

  static Reflect(point, norm)
  {
    var reverse = Transformations.GetReverse(norm);
    point.x = point.x + 2.0 * point.dot(norm) * reverse.x;
    point.y = point.y + 2.0 * point.dot(norm) * reverse.y;
  }

  static GetReverse(point)
  {
    return new Phaser.Point(-point.x, -point.y);
  }
}

module.exports.Transformations = Transformations;

'use strict';

class Goal
{
  // left, right, facing
  // Facing a vector representing the facing direction of the goal
  constructor(left, right, facing)
  {
    this.m_vLeftPost = left;
    this.m_vRightPost = right;
    this.m_vFacing = facing;
    this.m_vCenter = new Phaser.Point((left.x + right.x) / 2.0, (left.y + right.y) / 2.0);
    this.m_iNumGoalsScored = 0;
  }

  Center()
  {
    return new Phaser.Point(this.m_vCenter.x, this.m_vCenter.y);
  }

  Facing()
  {
    return new Phaser.Point(this.m_vFacing.x, this.m_vFacing.y);
  }

  LeftPost()
  {
    return new Phaser.Point(this.m_vLeftPost.x, this.m_vLeftPost.y);
  }

  RightPost()
  {
    return new Phaser.Point(this.m_vRightPost.x, this.m_vRightPost.y);
  }

  NumGoalsScored()
  {
    return this.m_iNumGoalsScored;
  }

  ResetGoalsScored()
  {
    this.m_iNumGoalsScored = 0;
  }

  Scored(ball)
  {
    if (Phaser.Line.intersectsPoints(ball.Pos(), ball.OldPos(), this.m_vLeftPost, this.m_vRightPost) != null)
    {
      this.m_iNumGoalsScored++;

      return true;
    }

    return false;
  }
}

module.exports.Goal = Goal;

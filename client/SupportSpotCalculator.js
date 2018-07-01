'use strict';

var RegulatorExports = require('./Regulator');
var Regulator = RegulatorExports.Regulator;

var ColorTeamExports = require('./ColorTeam');
var ColorTeam = ColorTeamExports.ColorTeam;

var Params = require('./Params');

class SupportSpot
{
  constructor(pos, value)
     {
    this.m_vPos = pos;
    this.m_dScore = value;
  }
}

class SupportSpotCalculator
{
  // hometeam type SoccerTeam
  constructor(numX, numY, team)
  {
    this.m_Spots = [];
    this.m_pBestSupportingSpot = null;
    this.m_pTeam = team;

    var PlayingField = team.Pitch().PlayingArea();

    //calculate the positions of each sweet spot, create them and
    //store them in m_Spots

    var HeightOfSSRegion = PlayingField.Height() * 0.8;
    var WidthOfSSRegion  = PlayingField.Width() * 0.9;
    var SliceX = WidthOfSSRegion / numX;
    var SliceY = HeightOfSSRegion / numY;

    var left  = PlayingField.Left() + (PlayingField.Width() - WidthOfSSRegion) / 2.0 + SliceX / 2.0;
    var right = PlayingField.Right() - (PlayingField.Width() - WidthOfSSRegion) / 2.0 - SliceX / 2.0;
    var top   = PlayingField.Top() + (PlayingField.Height() - HeightOfSSRegion) / 2.0 + SliceY / 2.0;

    for (var x = 0; x < (numX / 2) - 1; ++x)
    {
      for (var y = 0; y < numY; ++y)
      {
        if (this.m_pTeam.Color() == ColorTeam.BLUE)
        {
         this.m_Spots.push(new SupportSpot(new Phaser.Point(left + x * SliceX, top + y * SliceY), 0.0));
         } else
        {
           this.m_Spots.push(new SupportSpot(new Phaser.Point(right - x * SliceX, top + y * SliceY), 0.0));
         }
      }
    }

    //create the regulator
    this.m_pRegulator = new Regulator(Params.SupportSpotUpdateFreq);
  }


  //--------------------------- DetermineBestSupportingPosition -----------------
  //
  //  see header or book for description
  //-----------------------------------------------------------------------------
  DetermineBestSupportingPosition()
  {
    //only update the spots every few frames
    if (!this.m_pRegulator.isReady() && this.m_pBestSupportingSpot)
    {
      return new Phaser.Point(this.m_pBestSupportingSpot.m_vPos.x, this.m_pBestSupportingSpot.m_vPos.y);
    }

    //reset the best supporting spot
    this.m_pBestSupportingSpot = null;

    var BestScoreSoFar = 0.0;

    for (var curSpot = 0; curSpot < this.m_Spots.length; ++curSpot)
    {
      //first remove any previous score. (the score is set to one so that
      //the viewer can see the positions of all the spots if he has the
      //aids turned on)
      this.m_Spots[curSpot].m_dScore = 1.0;

      //Test 1. is it possible to make a safe pass from the ball's position
      //to this position?
      if (this.m_pTeam.isPassSafeFromAllOpponents(this.m_pTeam.ControllingPlayer().Pos(),
                  this.m_Spots[curSpot].m_vPos,
                  null,
                  Params.MaxPassingForce))
      {
        this.m_Spots[curSpot].m_dScore += Params.Spot_PassSafeScore;
      }


      //Test 2. Determine if a goal can be scored from this position.
      var ret_canshoot = this.m_pTeam.CanShoot(this.m_Spots[curSpot].m_vPos,
             Params.MaxShootingForce);
      if (ret_canshoot[0])
      {
        this.m_Spots[curSpot].m_dScore += Params.Spot_CanScoreFromPositionScore;
      }


      //Test 3. calculate how far this spot is away from the controlling
      //player. The further away, the higher the score. Any distances further
      //away than OptimalDistance pixels do not receive a score.
      if (this.m_pTeam.SupportingPlayer())
      {
        var OptimalDistance = 200.0;

        var dist = this.m_pTeam.ControllingPlayer().Pos().distance(this.m_Spots[curSpot].m_vPos);

        var temp = Math.abs(OptimalDistance - dist);

        if (temp < OptimalDistance)
        {

          //normalize the distance and add it to the score
          this.m_Spots[curSpot].m_dScore += Params.Spot_DistFromControllingPlayerScore *
              (OptimalDistance - temp) / OptimalDistance;
        }
      }

      //check to see if this spot has the highest score so far
      if (this.m_Spots[curSpot].m_dScore > BestScoreSoFar)
      {
        BestScoreSoFar = this.m_Spots[curSpot].m_dScore;

        this.m_pBestSupportingSpot = this.m_Spots[curSpot];
      }

    }

    return new Phaser.Point(this.m_pBestSupportingSpot.m_vPos.x, this.m_pBestSupportingSpot.m_vPos.y);
  }





  //------------------------------- GetBestSupportingSpot -----------------------
  //-----------------------------------------------------------------------------
  GetBestSupportingSpot()
  {
    if (this.m_pBestSupportingSpot)
    {
      return new Phaser.Point(this.m_pBestSupportingSpot.m_vPos.x, this.m_pBestSupportingSpot.m_vPos.y);
    } else
    {
      return this.DetermineBestSupportingPosition();
    }
  }

  //----------------------------------- Render ----------------------------------
  //-----------------------------------------------------------------------------
  Render()
  {
    for (spt = 0; spt < this.m_Spots[spt].size(); ++spt)
    {
      var bmd = game.add.bitmapData(Params.MAP_SIZE_WIDTH, Params.MAP_SIZE_HEIGHT);
      bmd.ctx.fillStyle = '#808080';

      bmd.ctx.beginPath();
      bmd.ctx.arc(this.m_Spots[spt].m_vPos.x, this.m_Spots[spt].m_vPos.y, this.m_Spots[spt].m_dScore, 0, Math.PI * 2, true);
      bmd.ctx.closePath();
      bmd.ctx.fill();

      var sprite = game.add.sprite(0, 0, bmd);
    }

    if (this.m_pBestSupportingSpot)
    {
      var bmd = game.add.bitmapData(Params.MAP_SIZE_WIDTH, Params.MAP_SIZE_HEIGHT);
      bmd.ctx.fillStyle = '#00FF00';

      bmd.ctx.beginPath();
      bmd.ctx.arc(this.m_pBestSupportingSpot.m_vPos.x, this.m_pBestSupportingSpot.m_vPos.y, this.m_pBestSupportingSpot.m_dScore, 0, Math.PI * 2, true);
      bmd.ctx.closePath();
      bmd.ctx.fill();

      var sprite = game.add.sprite(0, 0, bmd);
    }
  }
}

module.exports.SupportSpotCalculator = SupportSpotCalculator;

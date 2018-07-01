'use strict';

var RegionExports = require('./Region');
var Region = RegionExports.Region;

var GoalExports = require('./Goal');
var Goal = GoalExports.Goal;

var SoccerBallExports = require('./SoccerBall');
var SoccerBall = SoccerBallExports.SoccerBall;

var SoccerTeamExports = require('./SoccerTeam');
var SoccerTeam = SoccerTeamExports.SoccerTeam;

var ColorTeamExports = require('./ColorTeam');
var ColorTeam = ColorTeamExports.ColorTeam;

var Wall2DExports = require('./Wall2D');
var Wall2D = Wall2DExports.Wall2D;

var EntityManagerExports = require('./EntityManager');
var EntityManager = EntityManagerExports.EntityManager;

var TeamStatesExports = require('./TeamStates');
var Attacking = TeamStatesExports.Attacking;
var Defending = TeamStatesExports.Defending;
var PrepareForKickOff = TeamStatesExports.PrepareForKickOff;

var Params = require('./Params');

class SoccerPitch
{
  constructor(game, width, height)
  {
    this.m_pBall = true;
    this.m_pRedTeam = true;
    this.m_pBlueTeam = true;
    this.m_pRedGoal = true;
    this.m_pBlueGoal = true;

    Object.defineProperty(this, 'm_cxClient', {
      value: width,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_cyClient', {
      value: height,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_BallSize', {
      value: Params.BallSize,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_BallMass', {
      value: Params.BallMass,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    // goalwidth = height in coordinates system
    //this.m_GoalWidth = height / 9.3;

    this.m_vecWalls = [];
    this.m_pPlayingArea = true;
    this.m_Regions = [];

    this.m_bGameOn = true;
    this.m_bGoalKeeperHasBall = false;
    this.m_bPaused = false;


    // left top right bottom
    this.m_pPlayingArea = new Region(20, 20, this.m_cxClient - 20, this.m_cyClient - 20);

    var NumRegionsHorizontal = 6;
    var NumRegionsVertical = 3;

    this.CreateRegions(NumRegionsHorizontal * NumRegionsVertical, NumRegionsHorizontal, NumRegionsVertical);
    /*
    this.CreateRegions(this.m_pPlayingArea.Width() / NumRegionsHorizontal, this.m_pPlayingArea.Height() / NumRegionsVertical);
    */


    //create the goals
    this.m_pRedGoal  = new Goal(
         new Phaser.Point(this.m_pPlayingArea.Left(), (this.m_cyClient - Params.GoalWidth) / 2),
         new Phaser.Point(this.m_pPlayingArea.Left(), this.m_cyClient - (this.m_cyClient - Params.GoalWidth) / 2),
         new Phaser.Point(1, 0));

    this.m_pBlueGoal = new Goal(
         new Phaser.Point(this.m_pPlayingArea.Right(), (this.m_cyClient - Params.GoalWidth) / 2),
         new Phaser.Point(this.m_pPlayingArea.Right(), this.m_cyClient - (this.m_cyClient - Params.GoalWidth) / 2),
         new Phaser.Point(-1, 0));

    //create the soccer ball
    this.m_pBall = new SoccerBall(game, new Phaser.Point(this.m_cxClient / 2.0, this.m_cyClient / 2.0), Params.BallSize, Params.BallMass, this.m_vecWalls);

    //create the teams
    this.m_pRedTeam  = new SoccerTeam(game, this.m_pRedGoal, this.m_pBlueGoal, this, ColorTeam.RED);
    this.m_pBlueTeam = new SoccerTeam(game, this.m_pBlueGoal, this.m_pRedGoal, this, ColorTeam.BLUE);


    //make sure each team knows who their opponents are
    this.m_pRedTeam.SetOpponents(this.m_pBlueTeam);
    this.m_pBlueTeam.SetOpponents(this.m_pRedTeam);

    var TopLeft = new Phaser.Point(this.m_pPlayingArea.Left(), this.m_pPlayingArea.Top());
    var TopRight = new Phaser.Point(this.m_pPlayingArea.Right(), this.m_pPlayingArea.Top());
    var BottomRight = new Phaser.Point(this.m_pPlayingArea.Right(), this.m_pPlayingArea.Bottom());
    var BottomLeft = new Phaser.Point(this.m_pPlayingArea.Left(), this.m_pPlayingArea.Bottom());

    this.m_vecWalls.push(new Wall2D(BottomLeft, this.m_pRedGoal.RightPost()));
    this.m_vecWalls.push(new Wall2D(this.m_pRedGoal.LeftPost(), TopLeft));
    this.m_vecWalls.push(new Wall2D(TopLeft, TopRight));
    this.m_vecWalls.push(new Wall2D(TopRight, this.m_pBlueGoal.LeftPost()));
    this.m_vecWalls.push(new Wall2D(this.m_pBlueGoal.RightPost(), BottomRight));
    this.m_vecWalls.push(new Wall2D(BottomRight, BottomLeft));
  }

  GoalKeeperHasBall() {return this.m_bGoalKeeperHasBall;}

  SetGoalKeeperHasBall(b)
  {
    this.m_bGoalKeeperHasBall = b;
  }

  Walls() {return m_vecWalls;}

  CreateRegions(size, NumRegionsHorizontal, NumRegionsVertical)
  {
    var width = this.m_pPlayingArea.Width() / NumRegionsHorizontal;
    var height = this.m_pPlayingArea.Height() / NumRegionsVertical;

    var idx = size - 1;

    for (var col = 0; col < NumRegionsHorizontal; ++col)
    {
      for (var row = 0; row < NumRegionsVertical; ++row)
      {
        this.m_Regions[idx] = new Region(this.m_pPlayingArea.Left() + col * width,
                this.m_pPlayingArea.Top() + row * height,
                this.m_pPlayingArea.Left() + (col + 1) * width,
                this.m_pPlayingArea.Top() + (row + 1) * height,
                idx);
        console.dir('CreateRegions');
        console.dir(JSON.stringify(this.m_Regions[idx]));

       idx--;
      }
    }
  }

  PlayingArea()
  {
    return this.m_pPlayingArea;
  }

  GetRegionFromIndex(idx)
  {
    if (idx >= 0 && idx < this.m_Regions.length)
     return this.m_Regions[idx];

    return null;
  }

  Ball()
  {
    return this.m_pBall;
  }

  GameOn()
  {
    return this.m_bGameOn;
  }

  SetGameOn()
  {
    this.m_bGameOn = true;
  }

  SetGameOff()
  {
    this.m_bGameOn = false;
  }

  TogglePause() {m_bPaused = !m_bPaused;}

  Paused() {return this.m_bPaused;}

  cxClient() {return new Number(this.m_cxClient);}

  cyClient() {return new Number(this.m_cyClient);}

  Update(game)
  {
    if (this.m_bPaused)
     return;

    var tick = 0;

    //update the balls
    this.m_pBall.Update(game);

    //update the teams
    this.m_pRedTeam.Update(game);
    this.m_pBlueTeam.Update(game);

    //if a goal has been detected reset the pitch ready for kickoff
    if (this.m_pBlueGoal.Scored(this.m_pBall) || this.m_pRedGoal.Scored(this.m_pBall))
    {
      this.m_bGameOn = false;

      //reset the ball
      this.m_pBall.PlaceAtPosition(new Phaser.Point(this.m_cxClient / 2.0, this.m_cyClient / 2.0));

      //get the teams ready for kickoff
      this.m_pRedTeam.GetFSM().ChangeState(new PrepareForKickOff());
      this.m_pBlueTeam.GetFSM().ChangeState(new PrepareForKickOff());
    }

  }

  Render(game)
  {
    this.m_pBall.m_dBoundingRadius = this.m_BallSize;
    // pitch
    game.stage.backgroundColor =  '#006600';

    var graphics = game.add.graphics(0, 0);
    graphics.lineStyle(2, 0x2E2E2E, 1);

    // regions
    /*
    if (Prm.bRegions)
    {   */
    for (var r = 0; r < this.m_Regions.length; r++)
    {
      this.m_Regions[r].Render(graphics);
    }
    //}

    // goals
    //lineStyle(lineWidth, color, alpha)
    graphics.lineStyle(2, 0xB40404, 1);
    //drawRect(x, y, width, height)
    graphics.drawRect(this.m_pPlayingArea.Left() - 20, (this.m_cyClient - Params.GoalWidth) / 2, 20, Params.GoalWidth);
    graphics.lineStyle(2, 0x0404B4, 1);
    graphics.drawRect(this.m_pPlayingArea.Right(), (this.m_cyClient - Params.GoalWidth) / 2, 20, Params.GoalWidth);

    // walls
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.beginFill(0xFFFFFF);
    for (var w = 0; w < this.m_vecWalls.length; w++)
    {
      this.m_vecWalls[w].Render(graphics);
    }

    graphics.endFill();

    // marks pitch
    graphics.drawCircle(this.m_pPlayingArea.Center().x, this.m_pPlayingArea.Center().y, this.m_pPlayingArea.Width() * 0.125);
    graphics.drawCircle(this.m_pPlayingArea.Center().x, this.m_pPlayingArea.Center().y, 2);

    graphics.beginFill(0xFFFFFF);
    graphics.moveTo(this.m_pPlayingArea.Center().x, this.m_pPlayingArea.Top());
    graphics.lineTo(this.m_pPlayingArea.Center().x, this.m_pPlayingArea.Bottom());
    graphics.endFill();

    //Render the teams
    this.m_pRedTeam.Render(game);
    this.m_pBlueTeam.Render(game);

    // ball
    this.m_pBall.Render(game);
  }
}

module.exports.SoccerPitch = SoccerPitch;
/*
dimensions d'une tile = 32*32)
longueur = 105 m (8pixels * 105 = 840)
largeur = 68 m (8pixels * 68 = 544)

ligne d'engagement : |0|51m|52|51m|104|

surface de réparation = 40*16
but = 7,3*2,4

point de penalty = 11m

surface de but = 5,5


*/

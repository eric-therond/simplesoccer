'use strict';

var SoccerPitchExports = require('./SoccerPitch');
var SoccerPitch = SoccerPitchExports.SoccerPitch;

var SoccerBallExports = require('./SoccerBall');
var SoccerBall = SoccerBallExports.SoccerBall;

var PrecisionTimerExports = require('./PrecisionTimer');
var PrecisionTimer = PrecisionTimerExports.PrecisionTimer;

var Params = require('./Params');

class gameBoot
{
  constructor()
  {
    this.game = new Phaser.Game(Params.GAME_WIDTH, Params.GAME_HEIGHT, Phaser.AUTO, 'phaser-example', { update: this.update, preload: this.preload, create: this.create });
  }

  preload()
  {
    this.game.load.image('arrow', 'sprites/arrow.png');
    this.game.load.image('ball', 'sprites/Soccer_Ball.png');
  }

  update()
  {
    /*
    this.pitch.m_cxClient = document.getElementById("input_MAP_SIZE_WIDTH").value;
    this.pitch.m_cyClient = document.getElementById("input_MAP_SIZE_HEIGHT").value;
    this.pitch.m_BallSize = document.getElementById("input_BallSize").value;
    this.pitch.m_BallMass = document.getElementById("input_BallMass").value;

    if(this.oldm_cxClient != this.pitch.m_cxClient ||
      this.oldm_cyClient != this.pitch.m_cyClient || 
       this.oldm_BallSize != this.pitch.m_BallSize || 
        this.oldm_BallMass != this.pitch.m_BallMass)
    {
     this.oldm_cxClient = document.getElementById("input_MAP_SIZE_WIDTH").value;
     this.oldm_cyClient = document.getElementById("input_MAP_SIZE_HEIGHT").value;
     this.oldm_BallSize = document.getElementById("input_BallSize").value;
     this.oldm_BallMass = document.getElementById("input_BallMass").value;
     
     //this.pitch.Render(this.game);
    }
    */

    if (this.timer.ReadyForNextFrame())
    {
      this.pitch.Update(this.game);
    }
  }

  create()
  {
    this.oldm_cxClient = Params.MAP_SIZE_WIDTH;
    this.oldm_cyClient = Params.MAP_SIZE_HEIGHT;
    this.oldm_BallSize = Params.BallSize;
    this.oldm_BallMass = Params.BallMass;

    this.timer = new PrecisionTimer(Params.FrameRate);
    this.timer.Start();

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.pitch = new SoccerPitch(this.game, Params.MAP_SIZE_WIDTH, Params.MAP_SIZE_HEIGHT);
    this.pitch.Render(this.game);
  }
}

module.exports = gameBoot;

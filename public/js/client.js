(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("client/AutoList.js", function(exports, require, module) {
'use strict';

class AutoList
{
  constructor()
  {
    this.members = [];
  }

  push(member)
  {
    this.members.push(member);
  }

  GetAllMembers()
  {
    return this.members;
  }
}

if (typeof ListMembers === 'undefined')
{
  var ListMembers = new AutoList();
}

module.exports.AutoList = ListMembers;

});

require.register("client/BaseGameEntity.js", function(exports, require, module) {
'use strict';

var m_iNextValidID = 0;

var entity_type = {
  default_entity_type: -1,
};

class BaseGameEntity
{
  constructor(id, game)
  {
    this.SetID(id);
    this.m_dBoundingRadius = 0.0;
    this.m_vScale = new Phaser.Point(1.0, 1.0);
    this.m_iType = entity_type.default_entity_type;
    this.m_bTag = false;
    this.sprite = null;
    this.game = game;

  }

  SetID(val)
  {
    this.m_ID = val;

    m_iNextValidID = this.m_ID + 1;
  }

  ID()
  {
    return this.m_ID;
  }

  static GetNextValidID()
  {
    return m_iNextValidID;
  }

  ResetNextValidID()
  {
    m_iNextValidID = 0;
  }

  Pos()
  {
    return new Phaser.Point(this.m_vPosition.x, this.m_vPosition.y);
  }

  SetPos(new_pos)
  {
    this.m_vPosition = new Phaser.Point(new_pos.x, new_pos.y);
  }

  BRadius()
  {
    return this.m_dBoundingRadius;
  }

  SetBRadius(r)
  {
    this.m_dBoundingRadius = r;
  }

  IsTagged()
  {
    return this.m_bTag;
  }

  Tag()
  {
    this.m_bTag = true;
  }

  UnTag()
  {
    this.m_bTag = false;
  }

  Scale()
  {
    return this.m_vScale;
  }

  SetScale(val)
  {
    this.m_dBoundingRadius *= Math.max(val.x, val.y) / Math.max(m_vScale.x, m_vScale.y);
    this.m_vScale = val;
  }

  SetScale(val)
  {
    this.m_dBoundingRadius *= (val / Math.max(m_vScale.x, m_vScale.y));
    this.m_vScale = new Phaser.Point(val, val);
  }

  EntityType()
  {
    return this.m_iType;
  }

  SetEntityType(new_type)
  {
    this.m_iType = new_type;
  }

}
module.exports.BaseGameEntity = BaseGameEntity;

});

require.register("client/ColorTeam.js", function(exports, require, module) {
'use strict';

var ColorTeam = {
  RED: 1,
  BLUE: 2,
};

module.exports.ColorTeam = ColorTeam;

});

require.register("client/EntityManager.js", function(exports, require, module) {
'use strict';

class EntityManager
{
  constructor()
  {
    this.m_EntityMap = new Map();
  }

  GetEntityFromID(pEntityID)
  {
    if (this.m_EntityMap.has(pEntityID))
    {
      return this.m_EntityMap.get(pEntityID);
    }
  }

  //--------------------------- RemoveEntity ------------------------------------
  //-----------------------------------------------------------------------------
  RemoveEntity(pEntity)
  {
    this.m_EntityMap.delete(pEntity.ID());
  }

  //---------------------------- RegisterEntity ---------------------------------
  //-----------------------------------------------------------------------------
  RegisterEntity(NewEntity)
  {
    this.m_EntityMap.set(NewEntity.ID(), NewEntity);
  }

  Reset() {this.m_EntityMap.clear();}

}

if (typeof GLOBAL_EntityManager === 'undefined') {
  var GLOBAL_EntityManager = new EntityManager;
}

module.exports.EntityManager = EntityManager;
module.exports.GLOBAL_EntityManager = GLOBAL_EntityManager;

});

require.register("client/FieldPlayer.js", function(exports, require, module) {
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

});

require.register("client/FieldPlayerStates.js", function(exports, require, module) {
'use strict';

var StateExports = require('./State');
var State = StateExports.State;

var MessageDispatcherExports = require('./MessageDispatcher');
var MessageDispatcher = MessageDispatcherExports.MessageDispatcher;
var SEND_MSG_IMMEDIATELY = MessageDispatcherExports.SEND_MSG_IMMEDIATELY;
var NO_ADDITIONAL_INFO = MessageDispatcherExports.NO_ADDITIONAL_INFO;
var SENDER_ID_IRRELEVANT = MessageDispatcherExports.SENDER_ID_IRRELEVANT;
var GLOBAL_MessageDispatcher = MessageDispatcherExports.GLOBAL_MessageDispatcher;

var SoccerMessagesExports = require('./SoccerMessages');
var SoccerMessages = SoccerMessagesExports.SoccerMessages;
var MessageType = SoccerMessagesExports.MessageType;

var RegionExports = require('./Region');
var region_modifier = RegionExports.region_modifier;

var SoccerBallExports = require('./SoccerBall');
var SoccerBall = SoccerBallExports.SoccerBall;

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

var Params = require('./Params');

class FieldPlayerStates extends State
{
  constructor()
  {
    super('FieldPlayerStates');
  }

  Enter(player)
  {

  }

  Execute(player)
  {
    //if a player is in possession and close to the ball reduce his max speed
    if ((player.BallWithinReceivingRange()) && (player.isControllingPlayer()))
    {
      player.SetMaxSpeed(Params.PlayerMaxSpeedWithBall);
    } else
    {
      player.SetMaxSpeed(Params.PlayerMaxSpeedWithoutBall);
    }
  }

  Exit(player)
  {

  }

  OnMessage(player, telegram)
  {
    switch (telegram.Msg)
    {
    case MessageType.Msg_ReceiveBall:
      {
       //set the target
       player.Steering().SetTarget(telegram.ExtraInfo);

       //change state
       player.GetFSM().ChangeState(new ReceiveBall());

       return true;
      }

    case MessageType.Msg_SupportAttacker:
      {
       //if already supporting just return
       if (player.GetFSM().isInState(new SupportAttacker()))
       {
        return true;
       }
         
       //set the target to be the best supporting position
       player.Steering().SetTarget(player.Team().GetSupportSpot());

       //change the state
       player.GetFSM().ChangeState(new SupportAttacker());

       return true;
      }

    case MessageType.Msg_Wait:
      {
       //change the state
       player.GetFSM().ChangeState(new Wait());

       return true;
      }

    case MessageType.Msg_GoHome:
      {
       player.SetDefaultHomeRegion();
        
       player.GetFSM().ChangeState(new ReturnToHomeRegion());

       return true;
      }

    case MessageType.Msg_PassToMe:
      {  
       //get the position of the player requesting the pass
       //FieldPlayer* receiver = static_cast<FieldPlayer*>(telegram.ExtraInfo);
       var receiver = telegram.ExtraInfo;

       //if the ball is not within kicking range or their is already a
       //receiving player, this player cannot pass the ball to the player
       //making the request.
       if (player.Team().Receiver() != null ||
        !player.BallWithinKickingRange())
       {
        return true;
       }
        
       //make the pass
       player.Ball().Kick(new Phaser.Point(receiver.Pos().x - player.Ball().Pos().x, receiver.Pos().y - player.Ball().Pos().y),
              Params.MaxPassingForce);
       
       //let the receiver know a pass is coming
       GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
              player.ID(),
              receiver.ID(),
              MessageType.Msg_ReceiveBall,
              receiver.Pos());

       //change state
       player.GetFSM().ChangeState(new Wait());

       player.FindSupport();

       return true;
      }

  }//end switch

    return false;
  }

  name()
  {
    return 'FieldPlayerStates';
  }
}

//***************************************************************************** CHASEBALL

class ChaseBall extends State
{
  constructor()
  {
    super('ChaseBall');
  }

  Enter(player)
  {
    player.Steering().SeekOn();
  }

  Execute(player)
  {
    //if the ball is within kicking range the player changes state to KickBall.
    if (player.BallWithinKickingRange())
    {
      player.GetFSM().ChangeState(new KickBall());

      return;
    }

    //if the player is the closest player to the ball then he should keep
    //chasing it
    if (player.isClosestTeamMemberToBall())
    {
      player.Steering().SetTarget(player.Ball().Pos());

      return;
    }

    //if the player is not closest to the ball anymore, he should return back
    //to his home region and wait for another opportunity

    player.GetFSM().ChangeState(new ReturnToHomeRegion());
  }

  Exit(player)
  {
    player.Steering().SeekOff();
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'ChaseBall';
  }
}


//*****************************************************************************SUPPORT ATTACKING PLAYER

class SupportAttacker extends State
{
  constructor()
  {
    super('SupportAttacker');
  }

  Enter(player)
  {
    player.Steering().ArriveOn();

    player.Steering().SetTarget(player.Team().GetSupportSpot());
  }

  Execute(player)
  {
    //if his team loses control go back home
    if (!player.Team().InControl())
    {
      player.GetFSM().ChangeState(new ReturnToHomeRegion());
      return;
    }


    //if the best supporting spot changes, change the steering target
    if (player.Team().GetSupportSpot() != player.Steering().Target())
    {
      player.Steering().SetTarget(player.Team().GetSupportSpot());

      player.Steering().ArriveOn();
    }

    //if this player has a shot at the goal AND the attacker can pass
    //the ball to him the attacker should pass the ball to this player
    var ret_canshoot = player.Team().CanShoot(player.Pos(),
                                 Params.MaxShootingForce);
    if (ret_canshoot[0])
    {
      player.Team().RequestPass(player);
    }

    //if this player is located at the support spot and his team still have
    //possession, he should remain still and turn to face the ball
    if (player.AtTarget())
    {
      player.Steering().ArriveOff();

      //the player should keep his eyes on the ball!
      player.TrackBall();

      player.SetVelocity(new Phaser.Point(0, 0));

      //if not threatened by another player request a pass
      if (!player.isThreatened())
      {
        player.Team().RequestPass(player);
      }
    }
  }

  Exit(player)
  {
    //set supporting player to null so that the team knows it has to
    //determine a new one.
    player.Team().SetSupportingPlayer(null);

    player.Steering().ArriveOff();
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'SupportAttacker';
  }
}



//************************************************************************ RETURN TO HOME REGION

class ReturnToHomeRegion extends State
{
  constructor()
  {
    super('ReturnToHomeRegion');
  }

  Enter(player)
  {
    player.Steering().ArriveOn();

    if (!player.HomeRegion().Inside(player.Steering().Target(), region_modifier.halfsize))
    {
      player.Steering().SetTarget(player.HomeRegion().Center());
    }
  }

  Execute(player)
  {
    if (player.Pitch().GameOn())
    {
      //if the ball is nearer this player than any other team member  &&
      //there is not an assigned receiver && the goalkeeper does not gave
      //the ball, go chase it
      if (player.isClosestTeamMemberToBall() &&
        (player.Team().Receiver() == null) &&
        !player.Pitch().GoalKeeperHasBall())
      {
        player.GetFSM().ChangeState(new ChaseBall());

        return;
      }
    }

    //if game is on and close enough to home, change state to wait and set the
    //player target to his current position.(so that if he gets jostled out of
    //position he can move back to it)
    if (player.Pitch().GameOn() && player.HomeRegion().Inside(player.Pos(),
                   region_modifier.halfsize))
    {
      player.Steering().SetTarget(player.Pos());
      player.GetFSM().ChangeState(new Wait());
    }
    //if game is not on the player must return much closer to the center of his
    //home region
    else if (!player.Pitch().GameOn() && player.AtTarget())
    {
      player.GetFSM().ChangeState(new Wait());
    }
  }

  Exit(player)
  {
    player.Steering().ArriveOff();
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'ReturnToHomeRegion';
  }
}



//***************************************************************************** WAIT

class Wait extends State
{
  constructor()
  {
    super('Wait');
  }

  Enter(player)
  {
    //if the game is not on make sure the target is the center of the player's
    //home region. This is ensure all the players are in the correct positions
    //ready for kick off
    if (!player.Pitch().GameOn())
    {
      player.Steering().SetTarget(player.HomeRegion().Center());
    }
  }

  Execute(player)
  {
    //if the player has been jostled out of position, get back in position
    if (!player.AtTarget())
    {
      player.Steering().ArriveOn();
      return;
    } else
    {
      player.Steering().ArriveOff();

      player.SetVelocity(new Phaser.Point(0, 0));

      //the player should keep his eyes on the ball!
      player.TrackBall();
    }

    //if this player's team is controlling AND this player is not the attacker
    //AND is further up the field than the attacker he should request a pass.
    if (player.Team().InControl()    &&
     (!player.isControllingPlayer()) &&
       player.isAheadOfAttacker())
    {
      player.Team().RequestPass(player);

      return;
    }

    if (player.Pitch().GameOn())
    {
      //if the ball is nearer this player than any other team member  AND
      //there is not an assigned receiver AND neither goalkeeper has
      //the ball, go chase it
      if (player.isClosestTeamMemberToBall() &&
       player.Team().Receiver() == null  &&
        !player.Pitch().GoalKeeperHasBall())
      {
        player.GetFSM().ChangeState(new ChaseBall());

        return;
      }
    }
  }

  Exit(player) {}

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'Wait';
  }
}




//************************************************************************ KICK BALL

class KickBall extends State
{
  constructor()
  {
    super('KickBall');
  }

  Enter(player)
  {
    //let the team know this player is controlling
    player.Team().SetControllingPlayer(player);

    //the player can only make so many kick attempts per second.
    if (!player.isReadyForNextKick())
    {
      player.GetFSM().ChangeState(new ChaseBall());
    }
  }

  Execute(player)
  {
    //calculate the dot product of the vector pointing to the ball
    //and the player's heading

    var ToBall = new Phaser.Point(player.Ball().Pos().x - player.Pos().x,
     player.Ball().Pos().y - player.Pos().y);
    var dot    = player.Heading().dot(ToBall.normalize());

    //cannot kick the ball if the goalkeeper is in possession or if it is
    //behind the player or if there is already an assigned receiver. So just
    //continue chasing the ball
    if (player.Team().Receiver() != null   ||
     player.Pitch().GoalKeeperHasBall() || (dot < 0))
    {
      player.GetFSM().ChangeState(new ChaseBall());

      return;
    }

    // Attempt a shot at the goal

    //the dot product is used to adjust the shooting force. The more
    //directly the ball is ahead, the more forceful the kick
    var power = Params.MaxShootingForce * dot;

    //if it is determined that the player could score a goal from this position
    //OR if he should just kick the ball anyway, the player will attempt
    //to make the shot

    var ret_canshoot = player.Team().CanShoot(player.Ball().Pos(), power);

    if (ret_canshoot[0] ||
     (Math.random() < Params.ChancePlayerAttemptsPotShot))
    {
      //if a shot is possible, this vector will hold the position along the
      //opponent's goal line the player should aim for.
      var BallTarget = ret_canshoot[1];
      //add some noise to the kick. We don't want players who are
      //too accurate! The amount of noise can be adjusted by altering
      //Prm.PlayerKickingAccuracy
      BallTarget = SoccerBall.AddNoiseToKick(player.Ball().Pos(), BallTarget);

      //this is the direction the ball will be kicked in
      var KickDirection = new Phaser.Point(BallTarget.x - player.Ball().Pos().x, BallTarget.y - player.Ball().Pos().y);

      player.Ball().Kick(KickDirection, power);

      //change state
      player.GetFSM().ChangeState(new Wait());

      player.FindSupport();

      return;
    }

    /* Attempt a pass to a player */

    //if a receiver is found this will point to it

    var receiver = null;

    power = Params.MaxPassingForce * dot;

    var ret_findpass = player.Team().FindPass(player, power, Params.MinPassDist);

    //test if there are any potential candidates available to receive a pass
    if (player.isThreatened() && ret_findpass[0])
    {
      var receiver = ret_findpass[1];
      var BallTarget = ret_findpass[2];

      //add some noise to the kick
      BallTarget = SoccerBall.AddNoiseToKick(player.Ball().Pos(), BallTarget);

      var KickDirection = new Phaser.Point(BallTarget.x - player.Ball().Pos().x, BallTarget.y - player.Ball().Pos().y);

      player.Ball().Kick(KickDirection, power);

      //let the receiver know a pass is coming
      GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
                               player.ID(),
                               receiver.ID(),
                               MessageType.Msg_ReceiveBall,
                               BallTarget);


      //the player should wait at his current position unless instruced
      //otherwise
      player.GetFSM().ChangeState(new Wait());

      player.FindSupport();

      return;
    }

    //cannot shoot or pass, so dribble the ball upfield
    else
    {
      player.FindSupport();

      player.GetFSM().ChangeState(new Dribble());
    }
  }

  Exit(player)
  {
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'KickBall';
  }
}

class Dribble extends State
{
  constructor()
  {
    super('Dribble');
  }

  Enter(player)
  {
    //let the team know this player is controlling
    player.Team().SetControllingPlayer(player);
  }

  Execute(player)
  {
    var dot = player.Team().HomeGoal().Facing().dot(player.Heading());

    //if the ball is between the player and the home goal, it needs to swivel
    // the ball around by doing multiple small kicks and turns until the player
    //is facing in the correct direction
    if (dot < 0)
    {
      //the player's heading is going to be rotated by a small amount (Pi/4)
      //and then the ball will be kicked in that direction
      var direction = player.Heading();

      //calculate the sign (+/-) of the angle between the player heading and the
      //facing direction of the goal so that the player rotates around in the
      //correct direction
      var angle = (Math.PI / 4) * -1 * Transformations.PointsSign(player.Team().HomeGoal().Facing(), player.Heading());

      direction.rotate(direction.x, direction.y, angle);

      //this value works well whjen the player is attempting to control the
      //ball and turn at the same time
      var KickingForce = 0.8;

      player.Ball().Kick(direction, KickingForce);
    }

    //kick the ball down the field
    else
    {
      player.Ball().Kick(player.Team().HomeGoal().Facing(),
                            Params.MaxDribbleForce);
    }

    //the player has kicked the ball so he must now change state to follow it
    player.GetFSM().ChangeState(new ChaseBall());

    return;
  }

  Exit(player)
  {
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'Dribble';
  }
}

class ReceiveBall extends State
{
  constructor()
  {
    super('ReceiveBall');
  }

  Enter(player)
  {
    //let the team know this player is receiving the ball
    player.Team().SetReceiver(player);

    //this player is also now the controlling player
    player.Team().SetControllingPlayer(player);

    //there are two types of receive behavior. One uses arrive to direct
    //the receiver to the position sent by the passer in its telegram. The
    //other uses the pursuit behavior to pursue the ball.
    //This statement selects between them dependent on the probability
    //ChanceOfUsingArriveTypeReceiveBehavior, whether or not an opposing
    //player is close to the receiving player, and whether or not the receiving
    //player is in the opponents 'hot region' (the third of the pitch closest
    //to the opponent's goal
    var PassThreatRadius = 70.0;

    if ((player.InHotRegion() ||
     Math.random() < Params.ChanceOfUsingArriveTypeReceiveBehavior) &&
      !player.Team().isOpponentWithinRadius(player.Pos(), PassThreatRadius))
    {
      player.Steering().ArriveOn();
    } else
    {
      player.Steering().PursuitOn();
    }
  }

  Execute(player)
  {
    //if the ball comes close enough to the player or if his team lose control
    //he should change state to chase the ball
    if (player.BallWithinReceivingRange() || !player.Team().InControl())
    {
      player.GetFSM().ChangeState(new ChaseBall());

      return;
    }

    if (player.Steering().PursuitIsOn())
    {
      player.Steering().SetTarget(player.Ball().Pos());
    }

    //if the player has 'arrived' at the steering target he should wait and
    //turn to face the ball
    if (player.AtTarget())
    {
      player.Steering().ArriveOff();
      player.Steering().PursuitOff();
      player.TrackBall();
      player.SetVelocity(new Phaser.Point(0, 0));
    }
  }

  Exit(player)
  {
    player.Steering().ArriveOff();
    player.Steering().PursuitOff();

    player.Team().SetReceiver(null);
  }

  OnMessage(player, telegram)
  {
    return false;
  }

  name()
  {
    return 'ReceiveBall';
  }
}

module.exports.FieldPlayerStates = FieldPlayerStates;
module.exports.ChaseBall = ChaseBall;
module.exports.SupportAttacker = SupportAttacker;
module.exports.ReturnToHomeRegion = ReturnToHomeRegion;
module.exports.Wait = Wait;
module.exports.KickBall = KickBall;
module.exports.Dribble = Dribble;
module.exports.ReceiveBall = ReceiveBall;

});

require.register("client/Goal.js", function(exports, require, module) {
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

});

require.register("client/Goalkeeper.js", function(exports, require, module) {
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

});

require.register("client/GoalkeeperStates.js", function(exports, require, module) {
'use strict';

var StateExports = require('./State');
var State = StateExports.State;

var MessageDispatcherExports = require('./MessageDispatcher');
var MessageDispatcher = MessageDispatcherExports.MessageDispatcher;
var SEND_MSG_IMMEDIATELY = MessageDispatcherExports.SEND_MSG_IMMEDIATELY;
var NO_ADDITIONAL_INFO = MessageDispatcherExports.NO_ADDITIONAL_INFO;
var SENDER_ID_IRRELEVANT = MessageDispatcherExports.SENDER_ID_IRRELEVANT;
var GLOBAL_MessageDispatcher = MessageDispatcherExports.GLOBAL_MessageDispatcher;

var SoccerMessagesExports = require('./SoccerMessages');
var SoccerMessages = SoccerMessagesExports.SoccerMessages;
var MessageType = SoccerMessagesExports.MessageType;

var Params = require('./Params');

class GoalkeeperStates extends State
{
  constructor()
  {
    super('GoalkeeperStates');
  }

  Enter(keeper)
  {

  }

  Execute(keeper)
  {

  }

  Exit(keeper)
  {

  }

  OnMessage(keeper, telegram)
  {
    switch (telegram.Msg)
    {
    case MessageType.Msg_GoHome:
      {
        keeper.SetDefaultHomeRegion();
        
        keeper.GetFSM().ChangeState(new ReturnHome());
      }

    break;

    case MessageType.Msg_ReceiveBall:
      {
        keeper.GetFSM().ChangeState(new InterceptBall());
      }

    break;

  }//end switch

    return false;
  }

  name()
  {
    return 'GoalkeeperStates';
  }
}

//--------------------------- TendGoal -----------------------------------
//
//  This is the main state for the goalkeeper. When in this state he will
//  move left to right across the goalmouth using the 'interpose' steering
//  behavior to put himself between the ball and the back of the net.
//
//  If the ball comes within the 'goalkeeper range' he moves out of the
//  goalmouth to attempt to intercept it. (see next state)
//------------------------------------------------------------------------

class TendGoal extends State
{
  constructor()
  {
    super('TendGoal');
  }

  Enter(keeper)
  {
    //turn interpose on
    keeper.Steering().InterposeOn(Params.GoalKeeperTendingDistance);

    //interpose will position the agent between the ball position and a target
    //position situated along the goal mouth. This call sets the target
    keeper.Steering().SetTarget(keeper.GetRearInterposeTarget());
  }

  Execute(keeper)
  {
    //the rear interpose target will change as the ball's position changes
    //so it must be updated each update-step
    keeper.Steering().SetTarget(keeper.GetRearInterposeTarget());

    //if the ball comes in range the keeper traps it and then changes state
    //to put the ball back in play
    if (keeper.BallWithinKeeperRange())
    {
      keeper.Ball().Trap();

      keeper.Pitch().SetGoalKeeperHasBall(true);

      keeper.GetFSM().ChangeState(new PutBallBackInPlay());

      return;
    }

    //if ball is within a predefined distance, the keeper moves out from
    //position to try and intercept it.
    if (keeper.BallWithinRangeForIntercept() && !keeper.Team().InControl())
    {
      keeper.GetFSM().ChangeState(new InterceptBall());
    }

    //if the keeper has ventured too far away from the goal-line and there
    //is no threat from the opponents he should move back towards it
    if (keeper.TooFarFromGoalMouth() && keeper.Team().InControl())
    {
      keeper.GetFSM().ChangeState(new ReturnHome());

      return;
    }
  }

  Exit(keeper)
  {
    keeper.Steering().InterposeOff();
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'TendGoal';
  }
}

//------------------------- ReturnHome: ----------------------------------
//
//  In this state the goalkeeper simply returns back to the center of
//  the goal region before changing state back to TendGoal
//------------------------------------------------------------------------

class ReturnHome extends State
{
  constructor()
  {
    super('ReturnHome');
  }

  Enter(keeper)
  {
    keeper.Steering().ArriveOn();
  }

  Execute(keeper)
  {
    keeper.Steering().SetTarget(keeper.HomeRegion().Center());

    //if close enough to home or the opponents get control over the ball,
    //change state to tend goal
    if (keeper.InHomeRegion() || !keeper.Team().InControl())
    {
      keeper.GetFSM().ChangeState(new TendGoal());
    }
  }

  Exit(keeper)
  {
    keeper.Steering().ArriveOff();
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'ReturnHome';
  }
}


//----------------- InterceptBall ----------------------------------------
//
//  In this state the GP will attempt to intercept the ball using the
//  pursuit steering behavior, but he only does so so long as he remains
//  within his home region.
//------------------------------------------------------------------------
class InterceptBall extends State
{
  constructor()
  {
    super('InterceptBall');
  }

  Enter(keeper)
  {
    keeper.Steering().PursuitOn();
  }

  Execute(keeper)
  {
    //if the goalkeeper moves to far away from the goal he should return to his
    //home region UNLESS he is the closest player to the ball, in which case,
    //he should keep trying to intercept it.
    if (keeper.TooFarFromGoalMouth() && !keeper.isClosestPlayerOnPitchToBall())
    {
      keeper.GetFSM().ChangeState(new ReturnHome());

      return;
    }

    //if the ball becomes in range of the goalkeeper's hands he traps the
    //ball and puts it back in play
    if (keeper.BallWithinKeeperRange())
    {
      keeper.Ball().Trap();

      keeper.Pitch().SetGoalKeeperHasBall(true);

      keeper.GetFSM().ChangeState(new PutBallBackInPlay());

      return;
    }
  }

  Exit(keeper)
  {
    keeper.Steering().PursuitOff();
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'InterceptBall';
  }
}


//--------------------------- PutBallBackInPlay --------------------------
//
//------------------------------------------------------------------------
class PutBallBackInPlay extends State
{
  constructor()
  {
    super('PutBallBackInPlay');
  }

  Enter(keeper)
  {
    //let the team know that the keeper is in control
    keeper.Team().SetControllingPlayer(keeper);

    //send all the players home
    keeper.Team().Opponents().ReturnAllFieldPlayersToHome();
    keeper.Team().ReturnAllFieldPlayersToHome();
  }

  Execute(keeper)
  {
    //test if there are players further forward on the field we might
    //be able to pass to. If so, make a pass.
    var ret = keeper.Team().FindPass(keeper,
                                Params.MaxPassingForce,
                                Params.GoalkeeperMinPassDist);

    if (ret[0])
    {
      var receiver = ret[1];
      var BallTarget = ret[2];

      //make the pass
      keeper.Ball().Kick(new Phaser.Point(BallTarget.x - keeper.Ball().Pos().x, BallTarget.y - keeper.Ball().Pos().y).normalize(), Params.MaxPassingForce);

      //goalkeeper no longer has ball
      keeper.Pitch().SetGoalKeeperHasBall(false);

      //let the receiving player know the ball's comin' at him
      GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
                             keeper.ID(),
                             receiver.ID(),
                             MessageType.Msg_ReceiveBall,
                             BallTarget);

      //go back to tending the goal
      keeper.GetFSM().ChangeState(new TendGoal());

      return;
    }

    keeper.SetVelocity(new Phaser.Point(0, 0));
  }

  Exit(keeper)
  {
  }

  OnMessage(keeper, telegram)
  {
  }

  name()
  {
    return 'PutBallBackInPlay';
  }
}

module.exports.GoalkeeperStates = GoalkeeperStates;
module.exports.TendGoal = TendGoal;
module.exports.ReturnHome = ReturnHome;
module.exports.InterceptBall = InterceptBall;
module.exports.PutBallBackInPlay = PutBallBackInPlay;

});

require.register("client/MessageDispatcher.js", function(exports, require, module) {
'use strict';

var EntityManagerExports = require('./EntityManager');
var EntityManager = EntityManagerExports.EntityManager;
var GLOBAL_EntityManager = EntityManagerExports.GLOBAL_EntityManager;

var TelegramExports = require('./Telegram');
var Telegram = TelegramExports.Telegram;

var SEND_MSG_IMMEDIATELY = 0.0;
var NO_ADDITIONAL_INFO   = 0;
var SENDER_ID_IRRELEVANT = -1;

class MessageDispatcher
{
  constructor()
  {
    this.PriorityQ = null;
  }

  Discharge(pReceiver, telegram)
  {
    if (!pReceiver.HandleMessage(telegram))
    {

    }
  }

  DispatchMsg(delay, sender, receiver, msg, AdditionalInfo = null)
  {

    //get a pointer to the receiver
    var pReceiver = GLOBAL_EntityManager.GetEntityFromID(receiver);

    //make sure the receiver is valid
    if (pReceiver == null)
    {
      return;
    }

    //create the telegram
    var telegram = new Telegram(0, sender, receiver, msg, AdditionalInfo);

    //if there is no delay, route telegram immediately
    if (delay <= 0.0)
    {
      //send the telegram to the recipient
      this.Discharge(pReceiver, telegram);
    }

    //else calculate the time when the telegram should be dispatched
    else
    {
      var CurrentTime = TickCounter.GetCurrentFrame();

      telegram.DispatchTime = CurrentTime + delay;

      this.PriorityQ.push(telegram);
    }
  }

  //---------------------- DispatchDelayedMessages -------------------------
  //
  //  This function dispatches any telegrams with a timestamp that has
  //  expired. Any dispatched telegrams are removed from the queue
  //------------------------------------------------------------------------
  DispatchDelayedMessages()
  {
    //first get current time
    var CurrentTime = TickCounter.GetCurrentFrame();

    //now peek at the queue to see if any telegrams need dispatching.
    //remove all telegrams from the front of the queue that have gone
    //past their sell by date
    while (this.PriorityQ.length != 0 &&
        (this.PriorityQ[0].DispatchTime < CurrentTime) &&
           (this.PriorityQ[0].DispatchTime > 0))
    {
      //read the telegram from the front of the queue
      var telegram = PriorityQ[0];

      //find the recipient
      var pReceiver = GLOBAL_EntityManager.GetEntityFromID(telegram.Receiver);

      //send the telegram to the recipient
      this.Discharge(pReceiver, telegram);

      //remove it from the queue
      this.PriorityQ.pop();
    }
  }
}

if (typeof GLOBAL_MessageDispatcher === 'undefined')
    var GLOBAL_MessageDispatcher = new MessageDispatcher;

module.exports.MessageDispatcher = MessageDispatcher;
module.exports.SEND_MSG_IMMEDIATELY = SEND_MSG_IMMEDIATELY;
module.exports.NO_ADDITIONAL_INFO = NO_ADDITIONAL_INFO;
module.exports.SENDER_ID_IRRELEVANT = SENDER_ID_IRRELEVANT;
module.exports.GLOBAL_MessageDispatcher = GLOBAL_MessageDispatcher;

});

require.register("client/MovingEntity.js", function(exports, require, module) {
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

});

require.register("client/Params.js", function(exports, require, module) {
'use strict';

module.exports.GAME_WIDTH = 684;
module.exports.GAME_HEIGHT = 341;
module.exports.MAP_SIZE_WIDTH = 684;
module.exports.MAP_SIZE_HEIGHT = 341;
module.exports.BallSize = 5;
module.exports.BallMass = 1;
module.exports.Friction = -0.015;
module.exports.FrameRate = 4000;
module.exports.GoalWidth = 100;

module.exports.PlayerMass = 3.0;
module.exports.PlayerMaxForce = 1.0;
module.exports.PlayerMaxSpeedWithBall = 1.2;
module.exports.PlayerMaxSpeedWithoutBall = 1.6;
module.exports.PlayerMaxTurnRate = 0.4;
module.exports.PlayerScale = 1.0;

module.exports.ChancePlayerAttemptsPotShot = 0.005;
module.exports.ChanceOfUsingArriveTypeReceiveBehavior = 0.5;

module.exports.GoalKeeperTendingDistance = 20;
module.exports.NumAttemptsToFindValidStrike = 5;
module.exports.GoalKeeperInterceptRange = 100;
module.exports.GoalKeeperInterceptRangeSq = module.exports.GoalKeeperInterceptRange * module.exports.GoalKeeperInterceptRange;
module.exports.KeeperInBallRange = 10;
module.exports.KeeperInBallRangeSq = module.exports.KeeperInBallRange * module.exports.KeeperInBallRange;
module.exports.GoalkeeperMinPassDist = 50;
module.exports.PlayerKickingAccuracy = 0.99;
module.exports.BallWithinReceivingRange = 10;
module.exports.BallWithinReceivingRangeSq = module.exports.BallWithinReceivingRange * module.exports.BallWithinReceivingRange;
module.exports.PlayerKickingDistance = 6 + module.exports.BallSize;
module.exports.PlayerKickingDistanceSq = module.exports.PlayerKickingDistance * module.exports.PlayerKickingDistance;
module.exports.SeparationCoefficient = 10;
module.exports.ViewDistance = 30;
module.exports.PlayerComfortZone = 60;
module.exports.PlayerComfortZoneSq = module.exports.PlayerComfortZone * module.exports.PlayerComfortZone;
module.exports.PlayerInTargetRange = 10;
module.exports.PlayerInTargetRangeSq = module.exports.PlayerInTargetRange * module.exports.PlayerInTargetRange;

module.exports.NumSupportSpotsX = 13;
module.exports.NumSupportSpotsY = 6;
module.exports.SupportSpotUpdateFreq = 1;
module.exports.MaxShootingForce = 6;
module.exports.MaxDribbleForce = 1.5;
module.exports.MinPassDist = 120.0;
module.exports.MaxPassingForce = 3.0;
module.exports.Spot_PassSafeScore = 2;
module.exports.Spot_CanScoreFromPositionScore = 1;
module.exports.Spot_DistFromControllingPlayerScore = 2;
module.exports.PlayerKickFrequency = 8;

});

require.register("client/PlayerBase.js", function(exports, require, module) {
'use strict';

var Params = require('./Params');

var SoccerMessagesExports = require('./SoccerMessages');
var SoccerMessages = SoccerMessagesExports.SoccerMessages;
var MessageType = SoccerMessagesExports.MessageType;

var MessageDispatcherExports = require('./MessageDispatcher');
var MessageDispatcher = MessageDispatcherExports.MessageDispatcher;
var SEND_MSG_IMMEDIATELY = MessageDispatcherExports.SEND_MSG_IMMEDIATELY;
var NO_ADDITIONAL_INFO = MessageDispatcherExports.NO_ADDITIONAL_INFO;
var SENDER_ID_IRRELEVANT = MessageDispatcherExports.SENDER_ID_IRRELEVANT;
var GLOBAL_MessageDispatcher = MessageDispatcherExports.GLOBAL_MessageDispatcher;

var MovingEntityExports = require('./MovingEntity');
var MovingEntity = MovingEntityExports.MovingEntity;

var SteeringBehaviorsExports = require('./SteeringBehaviors');
var SteeringBehaviors = SteeringBehaviorsExports.SteeringBehaviors;

var AutoListExports = require('./AutoList');
var ListMembers = AutoListExports.AutoList;

var PlayerBaseEnum = {
  ATTACKER: 1,
  DEFENDER: 2,
  GOALKEEPER: 3,
};

var region_modifier = {
  halfsize: 1,
  normal: 2,
};

class PlayerBase extends MovingEntity
{
  // hometeam type SoccerTeam
  constructor(game, home_team, home_region, heading, velocity, mass, max_force, max_speed, max_turn_rate, scale, role)
  {

    super(game, home_team.Pitch().GetRegionFromIndex(home_region).Center(), scale * 10.0, velocity, max_speed, heading, mass, Phaser.Point(scale, scale), max_turn_rate, max_force);

    ListMembers.push(this);

    Object.defineProperty(this, 'm_pTeam', {
      value: home_team,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_iDefaultRegion', {
      value: home_region,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    this.m_dDistSqToBall = Number.MAX_VALUE;
    this.m_iHomeRegion = home_region;
    this.m_PlayerRole = role;
    this.m_vecPlayerVB = [];
    this.m_vecPlayerVBTrans = [];

    var NumPlayerVerts = 4;
    var player = [new Phaser.Point(-3, 8), new Phaser.Point(3, 10), new Phaser.Point(3, -10), new Phaser.Point(-3, -8)];

    for (var vtx = 0; vtx < NumPlayerVerts; ++vtx)
    {
      this.m_vecPlayerVB.push(player[vtx]);

      //set the bounding radius to the length of the
      //greatest extent
      if (Math.abs(player[vtx].x) > this.m_dBoundingRadius)
      {
        this.m_dBoundingRadius = Math.abs(player[vtx].x);
      }

      if (Math.abs(player[vtx].y) > this.m_dBoundingRadius)
      {
        this.m_dBoundingRadius = Math.abs(player[vtx].y);
      }
    }

    //set up the steering behavior class
    this.m_pSteering = new SteeringBehaviors(this,
                                        this.m_pTeam.Pitch(),
                                        this.Ball());

    //a player's start target is its start position (because it's just waiting)
    this.m_pSteering.SetTarget(home_team.Pitch().GetRegionFromIndex(home_region).Center());
  }

  TrackBall()
  {
    this.RotateHeadingToFacePosition(this.Ball().Pos());
  }

  TrackTarget()
  {
    var diffx = this.Steering().Target().x - this.Pos().x;
    var diffy = this.Steering().Target().y - this.Pos().y;

    var newp = new Phaser.Point(diffx, diffy);

    this.SetHeading(newp.normalize());
  }

  SetDefaultHomeRegion()
  {this.m_iHomeRegion = this.m_iDefaultRegion;}

  SortByDistanceToOpponentsGoal(p1, p2)
  {
    return (p1.DistToOppGoal() < p2.DistToOppGoal());
  }

  SortByReversedDistanceToOpponentsGoal(p1, p2)
  {
    return (p1.DistToOppGoal() > p2.DistToOppGoal());
  }

  PositionInFrontOfPlayer(position)
  {
    var diffx = position.x - this.Pos().x;
    var diffy = position.y - this.Pos().y;
    var ToSubject = new Phaser.Point(diffx, diffy);

    if (ToSubject.dot(this.Heading()) > 0)
    {
      return true;
    } else
    {
      return false;
    }
  }

  isThreatened()
  {
    var opp = this.Team().Opponents().Members();

    for (var i = 0; i < opp.length; i++)
    {
      var currOpp = opp[i];

      var distsq = this.Pos().distance(currOpp.Pos()) * this.Pos().distance(currOpp.Pos());

      if (this.PositionInFrontOfPlayer(currOpp.Pos()) &&
       (distsq < Params.PlayerComfortZoneSq))
      {
        return true;
      }

    }// next opp

    return false;
  }

  FindSupport()
  {
    if (this.Team().SupportingPlayer() == null)
    {
      var BestSupportPly = this.Team().DetermineBestSupportingAttacker();

      this.Team().SetSupportingPlayer(BestSupportPly);

      GLOBAL_MessageDispatcher.DispatchMsg(
         SEND_MSG_IMMEDIATELY,
                              this.ID(),
                              this.Team().SupportingPlayer().ID(),
                              MessageType.Msg_SupportAttacker,
                              null);
    }

    var BestSupportPly = this.Team().DetermineBestSupportingAttacker();

    if (BestSupportPly && (BestSupportPly != this.Team().SupportingPlayer()))
    {

      if (this.Team().SupportingPlayer())
      {
        GLOBAL_MessageDispatcher.DispatchMsg(
           SEND_MSG_IMMEDIATELY,
                                this.ID(),
                                this.Team().SupportingPlayer().ID(),
                                MessageType.Msg_GoHome,
                                null);
      }

      this.Team().SetSupportingPlayer(BestSupportPly);

      GLOBAL_MessageDispatcher.DispatchMsg(
         SEND_MSG_IMMEDIATELY,
                              this.ID(),
                              this.Team().SupportingPlayer().ID(),
                              MessageType.Msg_SupportAttacker,
                              null);
    }
  }

  DistToOppGoal()
  {
    return Math.abs(this.Pos().x - this.Team().OpponentsGoal().Center().x);
  }

  DistToHomeGoal()
  {
    return Math.abs(this.Pos().x - this.Team().HomeGoal().Center().x);
  }

  AtTarget()
  {
    var distsq = this.Pos().distance(this.Steering().Target()) * this.Pos().distance(this.Steering().Target());
    return (distsq < Params.PlayerInTargetRangeSq);
  }

  InHotRegion()
  {
    return Math.abs(this.Pos().y - this.Team().OpponentsGoal().Center().y) <
           this.Pitch().PlayingArea().Length() / 3.0;
  }

  isAheadOfAttacker()
  {
    return Math.abs(this.Pos().x - this.Team().OpponentsGoal().Center().x) <
           Math.abs(this.Team().ControllingPlayer().Pos().x - this.Team().OpponentsGoal().Center().x);
  }

  Role()
  {
    return this.m_PlayerRole;
  }

  Team()
  {
    return this.m_pTeam;
  }

  InHomeRegion()
  {
    if (this.m_PlayerRole == PlayerBaseEnum.GOALKEEPER)
    {
      return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion).Inside(this.Pos(), region_modifier.normal);
    } else
    {
      return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion).Inside(this.Pos(), region_modifier.halfsize);
    }
  }

  isControllingPlayer()
  {
    return this.Team().ControllingPlayer() === this;
  }

  isClosestTeamMemberToBall()
  {
    return this.Team().PlayerClosestToBall() === this;
  }

  isClosestPlayerOnPitchToBall()
  {
    return this.isClosestTeamMemberToBall() &&
     (this.DistSqToBall() < this.Team().Opponents().ClosestDistToBallSq());
  }

  BallWithinKeeperRange()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.Ball().Pos().x, this.Ball().Pos().y) < Params.KeeperInBallRangeSq);
  }

  BallWithinReceivingRange()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.Ball().Pos().x, this.Ball().Pos().y) < Params.BallWithinReceivingRangeSq);
  }

  BallWithinKickingRange()
  {
    return (this.game.math.distanceSq(this.Pos().x, this.Pos().y, this.Ball().Pos().x, this.Ball().Pos().y) < Params.PlayerKickingDistanceSq);
  }

  SetDistSqToBall(val)
  {
    this.m_dDistSqToBall = val;
  }

  DistSqToBall()
  {
    return this.m_dDistSqToBall;
  }

  Ball()
  {
    return this.Team().Pitch().Ball();
  }

  Pitch()
  {
    return this.Team().Pitch();
  }

  HomeRegion()
  {
    return this.Pitch().GetRegionFromIndex(this.m_iHomeRegion);
  }

  SetHomeRegion(NewRegion)
  {
    this.m_iHomeRegion = NewRegion;
  }

  Steering()
  {
    return this.m_pSteering;
  }

  render()
  {
  }
}

module.exports.PlayerBase = PlayerBase;
module.exports.PlayerBaseEnum = PlayerBaseEnum;

});

require.register("client/PrecisionTimer.js", function(exports, require, module) {
'use strict';

var Params = require('./Params');

class PrecisionTimer
{
  constructor(fps)
  {
    this.m_NormalFPS = fps;
    this.m_SlowFPS = 1.0;
    this.m_TimeElapsed = 0.0;
    this.m_FrameTime = 0;
    this.m_LastTime = 0;
    this.m_LastTimeInTimeElapsed = 0;
    this.m_PerfCountFreq = 0;
    this.m_bStarted = false;
    this.m_StartTime = 0;
    this.m_LastTimeElapsed = 0.0;
    this.m_bSmoothUpdates = false;

    this.m_TimeScale = 1.0;
    this.m_PerfCountFreq = 60000;
    //calculate ticks per frame
    this.m_FrameTime = parseInt(this.m_PerfCountFreq / this.m_NormalFPS);
  }

  Start()
  {
    this.m_bStarted = true;

    this.m_TimeElapsed = 0.0;

    //get the time
    var dateobj = new Date();
    this.m_LastTime = dateobj.getTime();

    //keep a record of when the timer was started
    this.m_StartTime = this.m_LastTime;
    this.m_LastTimeInTimeElapsed = this.m_LastTime;

    //update time to render next frame
    this.m_NextTime = this.m_LastTime + this.m_FrameTime;

    return;
  }

  CurrentTime()
  {
    var dateobj = new Date();
    this.m_CurrentTime = dateobj.getTime();

    return (this.m_CurrentTime - this.m_StartTime) * this.m_TimeScale;
  }

  Started()
  {
    return this.m_bStarted;
  }

  SmoothUpdatesOn()
  {
    this.m_bSmoothUpdates = true;
  }

  SmoothUpdatesOff()
  {
    this.m_bSmoothUpdates = false;
  }

  ReadyForNextFrame()
  {
    var dateobj = new Date();
    this.m_CurrentTime = dateobj.getTime();

    if (this.m_CurrentTime > this.m_NextTime)
    {
      this.m_TimeElapsed = (this.m_CurrentTime - this.m_LastTime) * this.m_TimeScale;
      this.m_LastTime    = this.m_CurrentTime;

      //update time to render next frame
      this.m_NextTime = this.m_CurrentTime + this.m_FrameTime;

      return true;
    }

    return false;
  }

  TimeElapsed()
  {
    this.m_LastTimeElapsed = this.m_TimeElapsed;

    var dateobj = new Date();
    this.m_CurrentTime = dateobj.getTime();

    this.m_TimeElapsed = (this.m_CurrentTime - this.m_LastTimeInTimeElapsed) * this.m_TimeScale;

    this.m_LastTimeInTimeElapsed    = this.m_CurrentTime;

    Smoothness = 5.0;

    if (this.m_bSmoothUpdates)
    {
      if (this.m_TimeElapsed < (this.m_LastTimeElapsed * Smoothness))
      {
        return this.m_TimeElapsed;
      } else
      {
        return 0.0;
      }
    } else
    {
      return this.m_TimeElapsed;
    }
  }
}

module.exports.PrecisionTimer = PrecisionTimer;

});

require.register("client/Region.js", function(exports, require, module) {
'use strict';

var region_modifier = {
  halfsize: 1,
  normal: 2,
};

class Region
{
  // x coord upper left, y coord upper left, x coord lower right, y coord lower right
  constructor(myleft = 0.0, mytop = 0.0, myright = 0.0, mybottom =  0.0, id = -1)
  {
    Object.defineProperty(this, 'm_dTop', {
      value: mytop,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_dRight', {
      value: myright,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_dLeft', {
      value: myleft,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_dBottom', {
      value: mybottom,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_iID', {
      value: id,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_vCenter', {
      value: new Phaser.Point((this.m_dLeft + this.m_dRight) * 0.5, (this.m_dTop + this.m_dBottom) * 0.5),
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_dWidth', {
      value: Math.abs(this.m_dRight - this.m_dLeft),
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_dHeight', {
      value: Math.abs(this.m_dBottom - this.m_dRight),
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }

  Top()
  {
    return this.m_dTop;
  }

  Bottom()
  {
    return this.m_dBottom;
  }

  Left()
  {
    return this.m_dLeft;
  }

  Right()
  {
    return this.m_dRight;
  }

  Width()
  {
    return Math.abs(this.m_dRight - this.m_dLeft);
  }

  Height()
  {
    return Math.abs(this.m_dTop - this.m_dBottom);
  }

  Length()
  {
    return Math.max(this.Width(), this.Height());
  }

  Breadth()
  {
    return Math.min(this.Width(), this.Height());
  }

  Center()
  {
    return new Phaser.Point(this.m_vCenter.x, this.m_vCenter.y);
  }

  ID()
  {
    return this.m_iID;
  }

  GetRandomPosition()
  {
    var x = Math.floor((Math.random() * this.m_dRight) + this.m_dLeft);
    var y = Math.floor((Math.random() * this.m_dBottom) + this.m_dTop);
    return x;
  }

  Inside(pos, r = region_modifier.normal)
  {
    if (r == region_modifier.normal)
    {
      return ((pos.x > this.m_dLeft) && (pos.x < this.m_dRight) &&
        (pos.y > this.m_dTop) && (pos.y < this.m_dBottom));
    } else
    {
      var marginX = this.m_dWidth * 0.25;
      var marginY = this.m_dHeight * 0.25;

      return ((pos.x > (this.m_dLeft + marginX)) && (pos.x < (this.m_dRight - marginX)) &&
        (pos.y > (this.m_dTop + marginY)) && (pos.y < (this.m_dBottom - marginY)));
    }
  }

  Render(graphics)
  {
    // top line
    graphics.moveTo(this.m_dLeft, this.m_dTop);
    graphics.lineTo(this.m_dRight, this.m_dTop);

    // left line
    graphics.moveTo(this.m_dLeft, this.m_dTop);
    graphics.lineTo(this.m_dLeft, this.m_dBottom);

    // right line
    graphics.moveTo(this.m_dRight, this.m_dTop);
    graphics.lineTo(this.m_dRight, this.m_dBottom);

    // bottom line
    graphics.moveTo(this.m_dLeft, this.m_dBottom);
    graphics.lineTo(this.m_dRight, this.m_dBottom);
  }
}
/*

inline void Region::Render(bool ShowID = 0)const
{
  gdi->HollowBrush();
  gdi->GreenPen();
  gdi->Rect(m_dLeft, m_dTop, m_dRight, m_dBottom);

  if (ShowID)
  {
    gdi->TextColor(Cgdi::green);
    gdi->TextAtPos(Center(), ttos(ID()));
  }
}
*/

module.exports.Region = Region;
module.exports.region_modifier = region_modifier;

});

require.register("client/Regulator.js", function(exports, require, module) {
'use strict';

function getRandomArbitrary(min, max)
{
  return Math.random() * (max - min) + min;
}

class Regulator
{
  // hometeam type SoccerTeam
  constructor(NumUpdatesPerSecondRqd)
  {
    var d = new Date();
    var n = d.getTime();

    this.m_dwNextUpdateTime = (n + Math.random() * 1000);

    if (NumUpdatesPerSecondRqd > 0)
    {
      this.m_dUpdatePeriod = 1000.0 / NumUpdatesPerSecondRqd;
    } else if (0 == NumUpdatesPerSecondRqd)
    {
      this.m_dUpdatePeriod = 0.0;
    } else if (NumUpdatesPerSecondRqd < 0)
    {
      this.m_dUpdatePeriod = -1;
    }
  }


  //returns true if the current time exceeds m_dwNextUpdateTime
  isReady()
  {
    //if a regulator is instantiated with a zero freq then it goes into
    //stealth mode (doesn't regulate)
    if (0 == this.m_dUpdatePeriod) return true;

    //if the regulator is instantiated with a negative freq then it will
    //never allow the code to flow
    if (this.m_dUpdatePeriod < 0) return false;

    var d = new Date();
    var CurrentTime = d.getTime();

    //the number of milliseconds the update period can vary per required
    //update-step. This is here to make sure any multiple clients of this class
    //have their updates spread evenly
    var UpdatePeriodVariator = 10.0;

    if (CurrentTime >= this.m_dwNextUpdateTime)
    {
      this.m_dwNextUpdateTime = (CurrentTime + this.m_dUpdatePeriod + getRandomArbitrary(-UpdatePeriodVariator, UpdatePeriodVariator));

      return true;
    }

    return false;
  }
}

module.exports.Regulator = Regulator;

});

require.register("client/SoccerBall.js", function(exports, require, module) {
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

});

require.register("client/SoccerMessages.js", function(exports, require, module) {
'use strict';

var MessageType = {
  Msg_ReceiveBall: 1,
  Msg_PassToMe: 2,
  Msg_SupportAttacker: 3,
  Msg_GoHome: 4,
  Msg_Wait: 5,
};

class SoccerMessages
{
  constructor()
  {
  }

  MessageToString(msg)
  {
    switch (msg)
    {
    case MessageType.Msg_ReceiveBall:
      return 'Msg_ReceiveBall';

    case MessageType.Msg_PassToMe:
      return 'Msg_PassToMe';

    case MessageType.Msg_SupportAttacker:
      return 'Msg_SupportAttacker';

    case MessageType.Msg_GoHome:
      return 'Msg_GoHome';

    case MessageType.Msg_Wait:
      return 'Msg_Wait';

    default:
      return 'INVALID MESSAGE!!';
  }
  }
}

module.exports.SoccerMessages = SoccerMessages;
module.exports.MessageType = MessageType;

});

require.register("client/SoccerPitch.js", function(exports, require, module) {
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

});

;require.register("client/SoccerTeam.js", function(exports, require, module) {
"use strict"; 

var StateMachineExports = require('./StateMachine');
var StateMachine = StateMachineExports.StateMachine;

var GoalkeeperExports = require('./Goalkeeper');
var Goalkeeper = GoalkeeperExports.Goalkeeper;

var PlayerBaseExports = require('./PlayerBase');
var PlayerBase = PlayerBaseExports.PlayerBase;
var PlayerBaseEnum = PlayerBaseExports.PlayerBaseEnum;

var FieldPlayerExports = require('./FieldPlayer');
var FieldPlayer = FieldPlayerExports.FieldPlayer;

var ColorTeamExports = require('./ColorTeam');
var ColorTeam = ColorTeamExports.ColorTeam;

var SupportSpotCalculatorExports = require('./SupportSpotCalculator');
var SupportSpotCalculator = SupportSpotCalculatorExports.SupportSpotCalculator;

var GoalkeeperStatesExports = require('./GoalkeeperStates');
var GoalkeeperStates = GoalkeeperStatesExports.GoalkeeperStates;
var TendGoal = GoalkeeperStatesExports.TendGoal;
var ReturnHome = GoalkeeperStatesExports.ReturnHome;
var InterceptBall = GoalkeeperStatesExports.InterceptBall;
var PutBallBackInPlay = GoalkeeperStatesExports.PutBallBackInPlay;

var FieldPlayerStatesExports = require('./FieldPlayerStates');
var FieldPlayerStates = FieldPlayerStatesExports.FieldPlayerStates;
var Wait = FieldPlayerStatesExports.Wait;
var ReturnToHomeRegion = FieldPlayerStatesExports.ReturnToHomeRegion;

var TeamStatesExports = require('./TeamStates');
var Attacking = TeamStatesExports.Attacking;
var Defending = TeamStatesExports.Defending;
var PrepareForKickOff = TeamStatesExports.PrepareForKickOff;

var EntityManagerExports = require('./EntityManager');
var EntityManager = EntityManagerExports.EntityManager;
var GLOBAL_EntityManager = EntityManagerExports.GLOBAL_EntityManager;

var TransformationsExports = require('./Transformations');
var Transformations = TransformationsExports.Transformations;

var MessageDispatcherExports = require('./MessageDispatcher');
var MessageDispatcher = MessageDispatcherExports.MessageDispatcher;
var SEND_MSG_IMMEDIATELY = MessageDispatcherExports.SEND_MSG_IMMEDIATELY;
var NO_ADDITIONAL_INFO = MessageDispatcherExports.NO_ADDITIONAL_INFO;
var SENDER_ID_IRRELEVANT = MessageDispatcherExports.SENDER_ID_IRRELEVANT;
var GLOBAL_MessageDispatcher = MessageDispatcherExports.GLOBAL_MessageDispatcher;

var SoccerMessagesExports = require('./SoccerMessages');
var SoccerMessages = SoccerMessagesExports.SoccerMessages;
var MessageType = SoccerMessagesExports.MessageType;

var Params = require('./Params');

class SoccerTeam
{
	constructor(game, home_goal, opponents_goal, pitch, color)
	{
		this.m_pOpponentsGoal = opponents_goal;
		this.m_pHomeGoal = home_goal;
		this.m_pOpponents = null;
		this.m_pPitch = pitch;
		this.m_Color = color;
		this.m_dDistSqToBallOfClosestPlayer = 0.0;
		this.m_pSupportingPlayer = null;
		this.m_pReceivingPlayer = null;
		this.m_pControllingPlayer = null;
		this.m_pPlayerClosestToBall = null;
		this.m_Players = [];
										   
		//setup the state machine
		this.m_pStateMachine = new StateMachine(this);

		this.m_pStateMachine.SetCurrentState(new Defending);
		this.m_pStateMachine.SetPreviousState(new Defending);
		this.m_pStateMachine.SetGlobalState(null);

		//create the players and goalkeeper
		this.CreatePlayers(game);
	  
		for (var i = 0; i < this.m_Players.length; i ++)
		{
			this.m_Players[i].Steering().SeparationOn();   
		}

		//create the sweet spot calculator
		this.m_pSupportSpotCalc = new SupportSpotCalculator(Params.NumSupportSpotsX,
													 Params.NumSupportSpotsY,
													 this);
	}
	
	GetSupportSpot(){return this.m_pSupportSpotCalc.GetBestSupportingSpot();}
	
	ID(){return this.m_Color;}
  
	
GetFSM(){return this.m_pStateMachine;}
Update(game)
{
  //this information is used frequently so it's more efficient to 
  //calculate it just once each frame
  this.CalculateClosestPlayerToBall();

  //the team state machine switches between attack/defense behavior. It
  //also handles the 'kick off' state where a team must return to their
  //kick off positions before the whistle is blown
  
  this.m_pStateMachine.Update();

	for (var i = 0; i < this.m_Players.length; i ++)
	{
		this.m_Players[i].Update(game);   
	}
		

}

DetermineBestSupportingAttacker()
{
  var ClosestSoFar = Number.MAX_VALUE;

  var BestPlayer = null;

  for (var i = 0; i < this.m_Players.length; i ++)
	{
    //only attackers utilize the BestSupportingSpot
    if ( (this.m_Players[i].Role() == PlayerBaseEnum.ATTACKER) && (this.m_Players[i] != this.m_pControllingPlayer) )
    {
      //calculate the dist. Use the squared value to avoid sqrt
	  var dist = this.m_Players[i].Pos().distance(this.m_pSupportSpotCalc.GetBestSupportingSpot());
    
      //if the distance is the closest so far and the player is not a
      //goalkeeper and the player is not the one currently controlling
      //the ball, keep a record of this player
      if ((dist < Math.sqrt(ClosestSoFar)) )
      {
        ClosestSoFar = dist;

        BestPlayer = this.m_Players[i];
      }
    }
  }

  return BestPlayer;
}


	Opponents()
	{
		return this.m_pOpponents;
	}
	
	SetOpponents(opps)
	{
		this.m_pOpponents = opps;
	}
	
	Color()
	{
		return this.m_Color;
	}
	
	Pitch()
	{
		return this.m_pPitch;
	}
	
	HomeGoal()
	{
		return this.m_pHomeGoal;
	}
	
	OpponentsGoal()
	{
		return this.m_pOpponentsGoal;
	}
	ClosestDistToBallSq()
	{
		return this.m_dDistSqToBallOfClosestPlayer;
	}
	
	CalculateClosestPlayerToBall()
	{
		var ClosestSoFar = Number.MAX_VALUE;

		for(var p = 0; p < this.m_Players.length; p ++)
		{
			var dist = this.m_Players[p].Pos().distance(this.Pitch().Ball().Pos()) * this.m_Players[p].Pos().distance(this.Pitch().Ball().Pos());
			this.m_Players[p].SetDistSqToBall(dist);
			
			if (dist < ClosestSoFar)
			{
				ClosestSoFar = dist;

				this.m_pPlayerClosestToBall = this.m_Players[p];
			}
		}
		
		this.m_dDistSqToBallOfClosestPlayer = ClosestSoFar;
	}
	
	SetPlayerClosestToBall(plyr){this.m_pPlayerClosestToBall=plyr;}
	
	PlayerClosestToBall()
	{
		return this.m_pPlayerClosestToBall;
	}
	
	ControllingPlayer()
	{
		return this.m_pControllingPlayer;
	}
	
	SetControllingPlayer(plyr)
	{
		this.m_pControllingPlayer = plyr;
		
		//rub it in the opponents faces!
		this.Opponents().LostControl();
	}

	LostControl()
	{
		this.m_pControllingPlayer = null;
	}
	

	//  sends a message to all players to return to their home areas forthwith
	ReturnAllFieldPlayersToHome()
	{
		for(var p = 0; p < this.m_Players.length; p ++)
		{
			if (this.m_Players[p].Role() != PlayerBaseEnum.GOALKEEPER)
			{
				GLOBAL_MessageDispatcher.DispatchMsg(
							SEND_MSG_IMMEDIATELY,
                            1,
                            this.m_Players[p].ID(),
                            MessageType.Msg_GoHome,
                            null);
			}
		}
	}
	
	SetReceiver(plyr){this.m_pReceivingPlayer = plyr;}
  
	Receiver()
	{
		return this.m_pReceivingPlayer;
	}
	
	Members()
	{
		return this.m_Players;
	}  
  
	FindPass(passer, power, MinPassingDistance)
	{  
		var ClosestToGoalSoFar = Number.MAX_VALUE;
		var Target;
		var receiver = null;
		var PassTarget = null;
		var ret;

		//iterate through all this player's team members and calculate which
		//one is in a position to be passed the ball 
		for(var p = 0; p < this.m_Players.length; p ++)
		{
			//make sure the potential receiver being examined is not this player
			//and that it is further away than the minimum pass distance
			if ( (this.m_Players[p] != passer) && (passer.Pos().distance(this.m_Players[p].Pos()) > MinPassingDistance))                  
			{          
				ret = this.GetBestPassToReceiver(passer, this.m_Players[p], power);
				if (ret[0])
				{
					Target = ret[1];
					//if the pass target is the closest to the opponent's goal line found
					// so far, keep a record of it
					var Dist2Goal = Math.abs(Target.x - this.OpponentsGoal().Center().x);

					if (Dist2Goal < ClosestToGoalSoFar)
					{
						ClosestToGoalSoFar = Dist2Goal;
          
						//keep a record of this player
						receiver = this.m_Players[p];

						//and the target
						PassTarget = Target;
					}     
				}
			}
		}//next team member

		if (receiver != null) return [true, receiver, PassTarget];
 
		else return [false, null, null];
	}

GetTangentPoints (C, R, P)
{
  var T1 = new Phaser.Point(0, 0);
  var T2 = new Phaser.Point(0, 0);
  
  var PmC = new Phaser.Point(P.x - C.x, P.y - C.y);
  var SqrLen = PmC.getMagnitudeSq();
  var RSqr = R*R;
  if ( SqrLen <= RSqr )
  {
      // P is inside or on the circle
      return [false, T1, T2];
  }

  var InvSqrLen = 1/SqrLen;
  var Root = Math.sqrt(Math.abs(SqrLen - RSqr));
  
  T1.x = C.x + R*(R*PmC.x - PmC.y*Root)*InvSqrLen;
  T1.y = C.y + R*(R*PmC.y + PmC.x*Root)*InvSqrLen;
  T2.x = C.x + R*(R*PmC.x + PmC.y*Root)*InvSqrLen;
  T2.y = C.y + R*(R*PmC.y - PmC.x*Root)*InvSqrLen;

  return [true, T1, T2];
}
	//---------------------- GetBestPassToReceiver ---------------------------
	//
	//  Three potential passes are calculated. One directly toward the receiver's
	//  current position and two that are the tangents from the ball position
	//  to the circle of radius 'range' from the receiver.
	//  These passes are then tested to see if they can be intercepted by an
	//  opponent and to make sure they terminate within the playing area. If
	//  all the passes are invalidated the function returns false. Otherwise
	//  the function returns the pass that takes the ball closest to the 
	//  opponent's goal area.
	//------------------------------------------------------------------------
	GetBestPassToReceiver(passer, receiver, power)
	{  
		//first, calculate how much time it will take for the ball to reach 
		//this receiver, if the receiver was to remain motionless 
		var time = this.Pitch().Ball().TimeToCoverDistance(this.Pitch().Ball().Pos(),
                                                    receiver.Pos(),
                                                    power);

		//return false if ball cannot reach the receiver after having been
		//kicked with the given power
		if (time < 0) return false;

		//the maximum distance the receiver can cover in this time
		var InterceptRange = time * receiver.MaxSpeed();
  
		//Scale the intercept range
		var ScalingFactor = 0.3;
		InterceptRange *= ScalingFactor;

		//now calculate the pass targets which are positioned at the intercepts
		//of the tangents from the ball to the receiver's range circle.
		var ret = this.GetTangentPoints(receiver.Pos(),
                   InterceptRange,
                   this.Pitch().Ball().Pos());
				   
		var ip1 = ret[1];
		var ip2 = ret[2];
 
		var NumPassesToTry = 3;
		var Passes = [ip1, receiver.Pos(), ip2];
  
  
		// this pass is the best found so far if it is:
		//
		//  1. Further upfield than the closest valid pass for this receiver
		//     found so far
		//  2. Within the playing area
		//  3. Cannot be intercepted by any opponents

		var ClosestSoFar =  Number.MAX_VALUE;
		var  bResult      = false;
		var  PassTarget      = null;

		for (var pass = 0; pass < NumPassesToTry; ++pass)
		{    
			var dist = Math.abs(Passes[pass].x - this.OpponentsGoal().Center().x);

			if (( dist < ClosestSoFar) &&
				this.Pitch().PlayingArea().Inside(Passes[pass]) &&
					this.isPassSafeFromAllOpponents(this.Pitch().Ball().Pos(),
                                   Passes[pass],
                                   receiver,
                                   power))
        
			{
				ClosestSoFar = dist;
				PassTarget   = Passes[pass];
				bResult      = true;
			}
		}

		return [bResult, PassTarget];
	}
	
	DetermineBestSupportingPosition()
	{
		this.m_pSupportSpotCalc.DetermineBestSupportingPosition();
	}
  

	//----------------------- isPassSafeFromOpponent -------------------------
	//
	//  test if a pass from 'from' to 'to' can be intercepted by an opposing
	//  player
	//------------------------------------------------------------------------
	
	// from : controllingplayer.pos()
	// target : requester.pos()
	// receiver : requester
	isPassSafeFromOpponent(from, target, receiver, opp, PassingForce)
	{
		var ToTarget = new Phaser.Point(target.x - from.x, target.y - from.y);
		var ToTargetNormalized = new Phaser.Point(ToTarget.x, ToTarget.y).normalize();
		
		var LocalPosOpp = Transformations.PointToLocalSpace(opp.Pos(),
                                         ToTargetNormalized,
                                         new Phaser.Point(ToTargetNormalized.x, ToTargetNormalized.y).perp(),
                                         from);
		
		//if opponent is behind the kicker then pass is considered okay(this is 
		//based on the assumption that the ball is going to be kicked with a 
		//velocity greater than the opponent's max velocity)
		if ( LocalPosOpp.x < 0 )
		{     
			return true;
		}
  
		//if the opponent is further away than the target we need to consider if
		//the opponent can reach the position before the receiver.
		if (from.distance(target) < opp.Pos().distance(from))
		{
			if (receiver != null)
			{
				if ( target.distance(opp.Pos())  > target.distance(receiver.Pos()) )
				{
					return true;
				}

				else
				{
					return false;
				}
			}
			else
			{
				return true;
			} 
		}
  
		//calculate how long it takes the ball to cover the distance to the 
		//position orthogonal to the opponents position
		var TimeForBall = this.Pitch().Ball().TimeToCoverDistance(new Phaser.Point(0,0),
                                       new Phaser.Point(LocalPosOpp.x, 0),
                                       PassingForce);

		//now calculate how far the opponent can run in this time
		var reach = opp.MaxSpeed() * TimeForBall +
                this.Pitch().Ball().BRadius()+
                opp.BRadius();
		
		//if the distance to the opponent's y position is less than his running
		//range plus the radius of the ball and the opponents radius then the
		//ball can be intercepted
		if ( Math.abs(LocalPosOpp.y) < reach )
		{
			return false;
		}

		return true;
	}

	//---------------------- isPassSafeFromAllOpponents ----------------------
	//
	//  tests a pass from position 'from' to position 'target' against each member
	//  of the opposing team. Returns true if the pass can be made without
	//  getting intercepted
	//------------------------------------------------------------------------
	// from : controllingplayer.pos()
	// target : requester.pos()
	// receiver : requester
	isPassSafeFromAllOpponents(from, target, receiver, PassingForce)
	{
		var oppmembers = this.Opponents().Members();
				
		for(var p = 0; p < oppmembers.length; p ++)
		{
			if (!this.isPassSafeFromOpponent(from, target, receiver, oppmembers[p], PassingForce))
			{
				return false;
			}
		}

		return true;
	}
	
CanShoot(BallPos, power)
{
  //the number of randomly created shot targets this method will test 
  var NumAttempts = Params.NumAttemptsToFindValidStrike;

  while (NumAttempts--)
  {
    //choose a random position along the opponent's goal mouth. (making
    //sure the ball's radius is taken into account)
    var ShotTarget = this.OpponentsGoal().Center();

    //the y value of the shot position should lay somewhere between two
    //goalposts (taking into consideration the ball diameter)
    var MinYVal = (this.OpponentsGoal().LeftPost().y + this.Pitch().Ball().BRadius());
    var MaxYVal = (this.OpponentsGoal().RightPost().y - this.Pitch().Ball().BRadius());
			
    ShotTarget.y = Math.random() * (MaxYVal - MinYVal) + MinYVal;
		
    //make sure striking the ball with the given power is enough to drive
    //the ball over the goal line.
    var time = this.Pitch().Ball().TimeToCoverDistance(BallPos,
                                                      ShotTarget,
                                                      power);
    
    //if it is, this shot is then tested to see if any of the opponents
    //can intercept it.
    if (time >= 0)
    {
      if (this.isPassSafeFromAllOpponents(BallPos, ShotTarget, null, power))
      {
        return [true, ShotTarget];
      }
    }
  }
  
  return [false, ShotTarget];
}


	CreatePlayers(game)
	{
		if (this.m_Color == ColorTeam.BLUE)
		{
			this.m_Players.push(new Goalkeeper(game, this, 1, new TendGoal, new Phaser.Point(0,1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.GOALKEEPER));
			
			this.m_Players.push(new FieldPlayer(game, this, 6, new Wait, new Phaser.Point(0,1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.ATTACKER));
			
			this.m_Players.push(new FieldPlayer(game, this, 8, new Wait, new Phaser.Point(0,1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.ATTACKER));
			
			this.m_Players.push(new FieldPlayer(game, this, 3, new Wait, new Phaser.Point(0,1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.DEFENDER));
			
			this.m_Players.push(new FieldPlayer(game, this, 5, new Wait, new Phaser.Point(0,1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.DEFENDER));
			
			
		}
		else
		{
			this.m_Players.push(new Goalkeeper(game, this, 16, new TendGoal, new Phaser.Point(0,-1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.GOALKEEPER));
			
			this.m_Players.push(new FieldPlayer(game, this, 9, new Wait, new Phaser.Point(0,-1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.ATTACKER));
			
			this.m_Players.push(new FieldPlayer(game, this, 11, new Wait, new Phaser.Point(0,-1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.ATTACKER));
			
			this.m_Players.push(new FieldPlayer(game, this, 12, new Wait, new Phaser.Point(0,-1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.DEFENDER));
			
			this.m_Players.push(new FieldPlayer(game, this, 14, new Wait, new Phaser.Point(0,-1), new Phaser.Point(0.0, 0.0), Params.PlayerMass, Params.PlayerMaxForce, Params.PlayerMaxSpeedWithoutBall, Params.PlayerMaxTurnRate, Params.PlayerScale, PlayerBaseEnum.DEFENDER));
		
		}

		for(var p = 0; p < this.m_Players.length; p ++)
		{
			GLOBAL_EntityManager.RegisterEntity(this.m_Players[p]);
		}
	}
	

GetPlayerFromID(id)
{
		for(var p = 0; p < this.m_Players.length; p ++)
		{
			if (this.m_Players[p].ID() == id) return this.m_Players[p];
		}

  return null;
}

SetPlayerHomeRegion(plyr, region)
{
	if (typeof this.m_Players[plyr] !== 'undefined')
		this.m_Players[plyr].SetHomeRegion(region);
}

UpdateTargetsOfWaitingPlayers()
{
		for(var p = 0; p < this.m_Players.length; p ++)
		{
    if ( this.m_Players[p].Role() != PlayerBaseEnum.GOALKEEPER )
    {
      //cast to a field player
      var plyr = this.m_Players[p];
      
      if ( plyr.GetFSM().isInState(new Wait()) ||
           plyr.GetFSM().isInState(new ReturnToHomeRegion()) )
      {
        plyr.Steering().SetTarget(plyr.HomeRegion().Center());
      }
    }
  }
}

AllPlayersAtHome()
{
	console.log("AllPlayersAtHome");
		for(var p = 0; p < this.m_Players.length; p ++)
		{
	console.log("AllPlayersAtHome p = '"+p+"'");
	console.log("AllPlayersAtHome InHomeRegion = '"+this.m_Players[p].InHomeRegion()+"'");
	console.dir(this.m_Players[p]);
    if (this.m_Players[p].InHomeRegion() == false)
    {
      return false;
    }
  }

  return true;
}

RequestPass(requester)
{
  //maybe put a restriction here
  if (Math.random() > 0.1) return;
  
  if (this.isPassSafeFromAllOpponents(this.ControllingPlayer().Pos(),
                                 requester.Pos(),
                                 requester,
                                 Params.MaxPassingForce))
  {

    //tell the player to make the pass
    //let the receiver know a pass is coming 
	
    GLOBAL_MessageDispatcher.DispatchMsg(SEND_MSG_IMMEDIATELY,
                          requester.ID(),
                          this.ControllingPlayer().ID(),
                          MessageType.Msg_PassToMe,
                          requester); 

  }
}


isOpponentWithinRadius(pos, rad)
{
	var Opps = this.Opponents().Members();
	var dist;
	for(var p = 0; p < Opps.length; p ++)
	{
		dist = pos.distance(Opps[p].Pos()) * pos.distance(Opps[p].Pos());
		if (dist < rad*rad)
		{
		  return true;
		}
	 }

	return false;
}

	InControl()
	{
		if(this.m_pControllingPlayer != null)
		{
			return true; 
		}
		else 
		{
			return false;
		}
	}
	
	
	SupportingPlayer()
	{
		return this.m_pSupportingPlayer;
	}

	SetSupportingPlayer(plyr)
	{
		this.m_pSupportingPlayer = plyr;
	}
  

	Render(game)
	{
		for(var p = 0; p < this.m_Players.length; p ++)
		{
			this.m_Players[p].Render(game);
		}
		/*
  std::vector<PlayerBase*>::const_iterator it = m_Players.begin();

  for (it; it != m_Players.end(); ++it)
  {
    (*it)->Render();
  }

  //show the controlling team and player at the top of the display
  if (Prm.bShowControllingTeam)
  {
    gdi->TextColor(Cgdi::white);
    
    if ( (Color() == blue) && InControl())
    {
      gdi->TextAtPos(20,3,"Blue in Control");
    }
    else if ( (Color() == red) && InControl())
    {
      gdi->TextAtPos(20,3,"Red in Control");
    }
    if (m_pControllingPlayer != NULL)
    {
      gdi->TextAtPos(Pitch()->cxClient()-150, 3, "Controlling Player: " + ttos(m_pControllingPlayer->ID()));
    }
  }

  //render the sweet spots
  if (Prm.bSupportSpots && InControl())
  {
    m_pSupportSpotCalc->Render();
  }

//#define SHOW_TEAM_STATE
#ifdef SHOW_TEAM_STATE
  if (Color() == red)
  {
    gdi->TextColor(Cgdi::white);

    if (CurrentState() == Attacking::Instance())
    {
      gdi->TextAtPos(160, 20, "Attacking");
    }
    if (CurrentState() == Defending::Instance())
    {
      gdi->TextAtPos(160, 20, "Defending");
    }
    if (CurrentState() == PrepareForKickOff::Instance())
    {
      gdi->TextAtPos(160, 20, "Kickoff");
    }
  }
  else
  {
    if (CurrentState() == Attacking::Instance())
    {
      gdi->TextAtPos(160, Pitch()->cyClient()-40, "Attacking");
    }
    if (CurrentState() == Defending::Instance())
    {
      gdi->TextAtPos(160, Pitch()->cyClient()-40, "Defending");
    }
    if (CurrentState() == PrepareForKickOff::Instance())
    {
      gdi->TextAtPos(160, Pitch()->cyClient()-40, "Kickoff");
    }
  }
#endif

//#define SHOW_SUPPORTING_PLAYERS_TARGET
#ifdef SHOW_SUPPORTING_PLAYERS_TARGET
  if (m_pSupportingPlayer)
  {
    gdi->BlueBrush();
    gdi->RedPen();
    gdi->Circle(m_pSupportingPlayer->Steering()->Target(), 4);

  }
#endif

}
*/
	}
}

module.exports.SoccerTeam = SoccerTeam;	


});

require.register("client/State.js", function(exports, require, module) {
'use strict';

class State
{
  constructor(name)
  {
    this.NameOfEntity = name;
  }

  GetNameOfEntity()
  {
    return this.NameOfEntity;
  }
}

module.exports.State = State;


});

require.register("client/StateMachine.js", function(exports, require, module) {
'use strict';

class StateMachine
{
  constructor(owner)
  {
    this.m_pOwner = owner;
    this.m_pCurrentState = null;
    this.m_pPreviousState = null;
    this.m_pGlobalState = null;
  }

  SetCurrentState(s)
  {
    this.m_pCurrentState = s;
  }

  SetGlobalState(s)
  {
    this.m_pGlobalState = s;
  }

  SetPreviousState(s)
  {
    this.m_pPreviousState = s;
  }

  HandleMessage(msg)
  {
    //first see if the current state is valid and that it can handle
    //the message
    if (this.m_pCurrentState && this.m_pCurrentState.OnMessage(this.m_pOwner, msg))
    {
      return true;
    }

    //if not, and if a global state has been implemented, send
    //the message to the global state
    if (this.m_pGlobalState && this.m_pGlobalState.OnMessage(this.m_pOwner, msg))
    {
      return true;
    }

    return false;
  }

  Update()
  {
    if (this.m_pGlobalState)
    {
      this.m_pGlobalState.Execute(this.m_pOwner);
    }

    if (this.m_pCurrentState)
    {
      this.m_pCurrentState.Execute(this.m_pOwner);
    }
  }

  ChangeState(pNewState)
  {
    //keep a record of the previous state
    this.m_pPreviousState = this.m_pCurrentState;
    //call the exit method of the existing state
    this.m_pCurrentState.Exit(this.m_pOwner);
    //change state to the new state
    this.m_pCurrentState = pNewState;
    //call the entry method of the new state
    this.m_pCurrentState.Enter(this.m_pOwner);
  }

  //change state back to the previous state
  RevertToPreviousState()
  {
    this.ChangeState(this.m_pPreviousState);
  }

  CurrentState()
  {
    return this.m_pCurrentState;
  }

  GlobalState()
  {
    return this.m_pGlobalState;
  }

  PreviousState()
  {
    return this.m_pPreviousState;
  }

  //returns true if the current state’s type is equal to the type of the //class passed as a parameter.
  isInState(st)
  {
    if (this.m_pCurrentState.GetNameOfEntity() === st.GetNameOfEntity())
     return true;

    return false;
  }

  GetNameOfCurrentState()
  {
    return this.m_pCurrentState.name();
  }
}

module.exports.StateMachine = StateMachine;

});

require.register("client/SteeringBehaviors.js", function(exports, require, module) {
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

});

require.register("client/SupportSpotCalculator.js", function(exports, require, module) {
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

});

require.register("client/TeamStates.js", function(exports, require, module) {
'use strict';

var ColorTeamExports = require('./ColorTeam');
var ColorTeam = ColorTeamExports.ColorTeam;

var StateExports = require('./State');
var State = StateExports.State;

var TeamSize = 5;

function ChangePlayerHomeRegions(team, NewRegions)
{
  for (var plyr = 0; plyr < TeamSize; ++plyr)
  {
    team.SetPlayerHomeRegion(plyr, NewRegions[plyr]);
  }
}

//************************************************************************ ATTACKING

class Attacking extends State
{
  constructor()
  {
    super('Attacking');
  }

  Enter(team)
  {
    var BlueRegions = [1, 12, 14, 6, 4];
    var RedRegions = [16, 3, 5, 9, 13];

    //set up the player's home regions
    if (team.Color() == ColorTeam.BLUE)
    {
      ChangePlayerHomeRegions(team, BlueRegions);
    } else
    {
      ChangePlayerHomeRegions(team, RedRegions);
    }

    //if a player is in either the Wait or ReturnToHomeRegion states, its
    //steering target must be updated to that of its new home region to enable
    //it to move into the correct position.
    team.UpdateTargetsOfWaitingPlayers();
  }

  Execute(team)
  {
    //if this team is no longer in control change states
    if (!team.InControl())
    {
      team.GetFSM().ChangeState(new Defending()); return;
    }
    //calculate the best position for any supporting attacker to move to
    team.DetermineBestSupportingPosition();
  }

  Exit(team)
  {
    //there is no supporting player for defense
    team.SetSupportingPlayer(null);
  }

  OnMessage(team, telegram)
  {
    return false;
  }
}


//************************************************************************ DEFENDING

class Defending extends State
{
  constructor()
  {
    super('Defending');
  }

  Enter(team)
  {
    //these define the home regions for this state of each of the players
    var BlueRegions = [1, 6, 8, 3, 5];
    var RedRegions = [16, 9, 11, 12, 14];

    //set up the player's home regions
    if (team.Color() == ColorTeam.BLUE)
    {
      ChangePlayerHomeRegions(team, BlueRegions);
    } else
    {
      ChangePlayerHomeRegions(team, RedRegions);
    }

    //if a player is in either the Wait or ReturnToHomeRegion states, its
    //steering target must be updated to that of its new home region
    team.UpdateTargetsOfWaitingPlayers();
  }

  Execute(team)
  {
    //if in control change states
    if (team.InControl())
    {
      team.GetFSM().ChangeState(new Attacking()); return;
    }
  }

  Exit(team) {}

  OnMessage(team, telegram)
  {
    return false;
  }
}


//************************************************************************ KICKOFF
class PrepareForKickOff extends State
{
  constructor()
  {
    super('PrepareForKickOff');
  }

  Enter(team)
  {
    //reset key player pointers
    team.SetControllingPlayer(null);
    team.SetSupportingPlayer(null);
    team.SetReceiver(null);
    team.SetPlayerClosestToBall(null);

    //send Msg_GoHome to each player.
    team.ReturnAllFieldPlayersToHome();
  }

  Execute(team)
  {
    console.log('PrepareForKickOff');
    //if both teams in position, start the game
    if (team.AllPlayersAtHome() && team.Opponents().AllPlayersAtHome())
    {
      console.log('PrepareForKickOff OK');
      team.GetFSM().ChangeState(new Defending());
    }
  }

  Exit(team)
  {
    team.Pitch().SetGameOn();
  }

  OnMessage(team, telegram)
  {
    return false;
  }
}

module.exports.Attacking = Attacking;
module.exports.Defending = Defending;
module.exports.PrepareForKickOff = PrepareForKickOff;

});

require.register("client/Telegram.js", function(exports, require, module) {
'use strict';

class Telegram
{
  constructor(time = -1, sender = -1, receiver = -1, msg = -1, info = null)
  {
    this.DispatchTime = time;
    this.Sender = sender;
    this.Receiver = receiver;
    this.Msg = msg;
    this.ExtraInfo = info;
  }
}

module.exports.Telegram = Telegram;

});

require.register("client/Transformations.js", function(exports, require, module) {
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

});

require.register("client/Wall2D.js", function(exports, require, module) {
'use strict';

class Wall2D
{

  constructor(va, vb)
  {
    Object.defineProperty(this, 'm_vA', {
      value: va,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'm_vB', {
        value: vb,
        writable: false,
        enumerable: true,
        configurable: true,
      });

    this.m_vN = new Phaser.Point(0, 0);

    this.CalculateNormal();
  }

  CalculateNormal()
  {
    var newvec = new Phaser.Point(this.m_vB.x - this.m_vA.x, this.m_vB.y - this.m_vA.y);
    var temp = newvec.normalize();

    this.m_vN.x = -temp.y;
    this.m_vN.y = temp.x;
  }

  From()  {return this.m_vA;}

  SetFrom(v) {
    this.m_vA = v; CalculateNormal();
  }

  To()    {return this.m_vB;}

  SetTo(v) {
    this.m_vB = v; CalculateNormal();
  }

  Normal() {return this.m_vN;}

  SetNormal(n) {this.m_vN = n;}

  Center() {return (this.m_vA + this.m_vB) / 2.0;}

  Render(graphics)
  {
    graphics.beginFill(0xFFFFFF);
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.moveTo(this.m_vA.x, this.m_vA.y);
    graphics.lineTo(this.m_vB.x, this.m_vB.y);
    graphics.endFill();
  }
}

module.exports.Wall2D = Wall2D;

});

require.register("client/gameBoot.js", function(exports, require, module) {
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

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=client.js.map
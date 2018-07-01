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


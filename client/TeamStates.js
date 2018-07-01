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

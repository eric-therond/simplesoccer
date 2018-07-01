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

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

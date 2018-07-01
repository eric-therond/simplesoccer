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

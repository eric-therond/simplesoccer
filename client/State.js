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


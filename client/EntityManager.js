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

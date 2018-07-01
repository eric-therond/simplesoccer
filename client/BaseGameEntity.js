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

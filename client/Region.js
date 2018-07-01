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

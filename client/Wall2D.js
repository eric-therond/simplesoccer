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

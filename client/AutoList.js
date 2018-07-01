'use strict';

class AutoList
{
  constructor()
  {
    this.members = [];
  }

  push(member)
  {
    this.members.push(member);
  }

  GetAllMembers()
  {
    return this.members;
  }
}

if (typeof ListMembers === 'undefined')
{
  var ListMembers = new AutoList();
}

module.exports.AutoList = ListMembers;

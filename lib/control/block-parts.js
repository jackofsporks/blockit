"use babel"

import {CompositeDisposable, Disposable} from "atom"

export default class Block {
  // Example
  // let block = {
  //   parent: {},
  //   whereDelete: function(){return this.parent.location},
  //   whereEdit: function(){return this.parent.end.location},
  //   leave: function(){}
  // }
  constructor () {}
  /*Returns list of locations*/
  whereDelete () {}
  whereEdit () {}
  /*Returns a message to the user? Takes actions of its own?
  *by default don't stop. that way deleted blocks don't block leaving.*/
  leaveReaction () {return {cancel: false}}
}

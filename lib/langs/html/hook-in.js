"use babel"

import {Emitter} from "atom"
import getChildrenTags from './family'

export default class HTMLHook {
  constructor () {
    this.emitter = new Emitter()
    this.emitter.on("blockit-activated",this.addSelf)
    console.log("will add language")
  }

  destroy = () => {this.emitter.dispose()}

  addSelf = (addLanguage) => {
    addLanguage("html", getChildrenTags, this.destroy)
    console.log("did add language",addLanguage)
  }
}

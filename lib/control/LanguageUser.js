"use babel"

import {Disposable} from "atom"

export default class LanguageUser {
  constructor (parent) {
    this.parent = parent
    this.languages = {}
  }

  destroy () {
    let langs = this.languages
    for (let ii in langs) {
      langs[ii].destroy()
    }
  }

  addLanguage = (name, functionality) => {
    console.log("adding language", name)
    this.languages[name] = functionality
    return new Disposable(()=>{this.removeLanguage(name)})
  }

  removeLanguage = (name) => {
    this.languages[name] = null
    return this
  }

  getChildrenNodes = (languageName, parentName) => {
    var language = this.languages[languageName]
    if (language) return language.getChildren(parentName)
    return []
  }
}

"use babel"

import {CompositeDisposable, Disposable} from "atom"
import {html} from "../data/html-main.js"

export default class Renderer {

  constructor(serializedState) {
    this.languages = {}
    this.addLanugage("html", html)
  }

  addLanugage(name, obj){
    this.languages[name] = obj
  }

  insert(editor, scopeDesc, itemName) {
  const language = scopeDesc.scopes[0].replace("source.","")
    console.log(language, scope);
    // editor, language, itemName
    // const item = this.languages[scope][itemName]
  }
}

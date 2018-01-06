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
    const scopes = scopeDesc.scopes
    let language, meta, last;

    for (let ii = 0; ii < scopes.length; ii++) {
      if (ii === 0) {
        language = scopes[0].replace("source.","")
      } else if (ii === scopes.length - 1) {
        last = "fridge"
      }

    }
    console.log(language, scope);
    // editor, language, itemName
    // const item = this.languages[scope][itemName]
  }
}

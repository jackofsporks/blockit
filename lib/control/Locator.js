"use babel"

import {CompositeDisposable, Disposable} from "atom"

export default class Renderer {

  constructor(serializedState) {
    this.language = null
    this.blocks = {
      "'": "quotation",
      ">": "element"
    }
  }

  // cursorPosition === index of the character before which the cursor appears
  locate(text, cursorPosition){
    // look at text surrounding cursor
    // discover language
    // discover "context" (not window or w/e. instead what block we're in)
    // "'" starts a quotation block
    let before = text.substring(0, cursorPosition)
    let after = text.substring(cursorPosition)
    console.log(before, "and theeeeeeeen", after)
  }
}

"use babel"

import {CompositeDisposable, Disposable} from "atom"

class Block {
  // Example
  // {parent: {"tag block"}, deleters: /["=]/,
  //   token: {parent: block, type: "token",
  //     location: "parent.left.2"
  //     value: ["att", "ribute"], or --> left: "att", right: "ribute"
  //     siblings: ["attribute2"]??
  //   },
  //   location:{start: 3, end: 28}
  //   start: /[]/, left: "attribute", middle: /=\"/,
  //   right: {type: "multi"...}, end: /["]/,
  //   // siblings: this.parent.children - this <-- use parent?
  //   siblings: ["attribute2"]
  // }
  constructor (data) {
    this = data
    this.token = new Token(data.token)
  }

  shouldDeleteBlock (deletedText) {
    return false
  }

  hasDuplicateSiblings () {
    return false
  }

  delete () {
    // if (this.deletes) delete what it deletes
    // or if (this.position === end)
    // test for deleting string at correct position...
  }

  validate () {}

  message () {}

  change () {} // valid change?
  // ex --> html tag is changed but check middle for valid values
}

class Multi {
  constructor (data) {
  }
}

class Syntax {
  constructor (data) {
  }
}

class Token {
  constructor (data) {
  }
}

export {Block,Multi,Syntax,Token}

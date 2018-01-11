"use babel"

import {CompositeDisposable, Disposable} from "atom"
import {html} from "../data/html-main"

export default class Renderer {

  constructor(serializedState, manager) {
    this.manager = manager
    this.language = null
    this.startersAndEnders = {
      "\"": {ender: "\"", type:"quote"},
      ">": {ender: "<", type:"tag"},
    }
    this.rules = {
      "\"": {"html":{"class=":{includes:["string"]},"visible=":{includes:["true","false"]}}},
      ">": {"html":html,"js":{}}
    }
    this.finders = {
      "\"": function(textBefore){
        // search text before to find property
        // return object belonging to property
        return null
      },
      ">": function(textBefore){return html}
    }
  }

  // cursorPosition === index of the character before which the cursor appears
  locate(textBefore, textAfter, cursorPosition, fileScope){
    // look at text surrounding cursor
    // discover language
    // discover "context" (not window or w/e. instead what block we're in)
    // "'" starts a quotation block
    "<html>some text and stuff and thangs plus fridge</html>";
    let starter = null
    let finder = null
    let foundAt = null
    for (let ii = textBefore.length - 1; ii >= 0; ii--) {
      starter = textBefore[ii]
      finder = this.finders[starter]
      fountAt = ii
      if (ii > textBefore.length - 10) console.log("counting -->",starter)
      if (finder) {console.log("finder",finder); break;}
    }
    // If no matches were found (at the very start)
    if (!finder) return null
    // We can assume there is an ender to this starter because we rock
    let beforeFound = textBefore.substring(0,foundAt)
    console.log(beforeFound);
    let rules = finder(beforeFound, fileScope)
    console.log(rules);
    // console.log(textBefore, "\n\nand theeeeeeeen\n\n", textAfter)
  }
}

"use babel"

// it's all pipes babe!
export default class HTMLBlocks {
  constructor () {
    this.symbolToFilter = {
      ">": this.closeAngle,
      "<": this.openAngle
      // quotes only matter inside opening tags?? Help closing quotes in text??
      // case "\"": return this.doubleQuotes
    }
  }

  // DEPRICATED!
  getBuild (symbol) {
    let funct = null
    switch (symbol) {
      case ">": funct = this.closeAngle; break;
      case "<": funct = this.openAngle; break;
      // quotes only matter inside opening tags?? Help closing quotes in text??
      // case "\"": return this.doubleQuotes
    }
    return funct
  }

  handle = (action, e, beforeCursor, afterCursor, previousBlock) => {
    // action can be --> delete, insert, replace, move
    // we NEED previousBlock because if something was inserted in a value/attribute/tag that is invalid we can't go looking for even the initial type

    // get starting location type - tag, attribute, value, in-between
    // find initial trigger
    const {filter, beforeTrigger, afterTrigger} = this._findFilter(beforeCursor, this.symbolToFilter)
    const phase1 = filter(beforeTrigger, afterTrigger, afterCursor)

  }

  delete (block, e, beforeCursor, afterCursor, previousBlock) {
    // Return locations to delete

    // If multi
    // If in attribute
    // If in tag name
    // If in in attribute value
    // If inside an element but with no contents (maybe text node area)

  }

  // in end or start tag
  openAngle (beforeTrigger, afterTrigger, afterCursor) {
    // cases (_ === space)
    // assumes a 2nd attribute and value as a starting point
    // ...="...n"_ --> attribute
    // ...="...n" --> attribute next to uneditable
    // ...="..._n -->value
    // ...="..._ -->value (same case)
    // ...="n --> value
    // ...=" --> value next to undeletable
    // ...= --> uneditable
    // ...="...n"_n --> attribute
    // <n_ --> attribute
    // <n --> tag
    // < --> tag + undeletable
    // back to top for 1st attribute & value
    // looking for --> ", =, _, <
    let type = null
    const lastIndex = afterTrigger.length - 1; // length wouldn't be a valid index
    for (let ii = lastIndex; ii >= 0; ii--) {
      const character = afterTrigger[ii]
      if (/</.test(character)) type = "tag"
      else if (/=/.test(character)) type = "attributeBridge"
      else if (/\s/.test(character)) {
        // Whitespace next to quotes === attribute
        // ...="...n"_ --> attribute
        // ...="...n"_n --> attribute
        let jj = ii - 1
        while (/\s/.test(afterTrigger[jj])) jj--
        if (/["']/.test(afterTrigger[jj])) type = "attribute"
        // otherwise there's a non-quote character so it's
        // 1. a value
        // 2. next to a tag
        // 3. a tag
        // ...="..._n -->value
        // ...="..._ -->value (same case)
        // <n_ --> attribute
      } else if (/["']/.test(character)) {

      }
      if (type !== null) break;
    }
  }

  closeAngle () {}

  _findFilter (text, stoppers) {
    let filter = null
    for (let ii = text.length - 1; ii >= 0; ii--) {
      let char = text[ii]
      if (stoppers[char]) filter = stoppers[char]
      break;
    }
    const before = beforeCursor.substring(0,foundAt)
    const after = beforeCursor.substring(foundAt) // includes trigger
    return {filter: filter, beforeTrigger: before, afterTrigger: after}
  }

}

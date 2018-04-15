"use babel"

// it's all pipes babe!
export default class HTMLBlocks {
  constructor () {
    this.symbolToFilter = {
      ">": this._closeAngle,
      "<": this._openAngle
      // quotes only matter inside opening tags?? Help closing quotes in text??
      // case "\"": return this.doubleQuotes
    }
  }

  // DEPRICATED!
  getBuild (symbol) {
    let funct = null
    switch (symbol) {
      case ">": funct = this._closeAngle; break;
      case "<": funct = this._openAngle; break;
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
    const phase1 = filter(beforeTrigger, afterTrigger, afterCursor) //type

  }

  // Returns which locations to delete
  _delete (block, e, beforeCursor, afterCursor, previousBlock) {
    // If multi
    // If in attribute
    // If in tag name
    // If in in attribute value
    // If inside an element but with no contents (maybe text node area)
  }

  // in end or start tag
  _openAngle (beforeTrigger, afterTrigger, afterCursor) {
    // TODO Deal with style attr urls etc in start tags
    if (/\//.test(afterCursor[0])) return "endTag"
    let type = null
    let numQuotes = 0
    let numWhitespace = 0
    const lastIndex = afterTrigger.length - 1; // length wouldn't be a valid index
    for (let ii = lastIndex; ii >= 0; ii--) {
      const character = afterTrigger[ii]
      if (/["']/.test(character)) numQuotes++
      else if (/\s/.test(character)) numWhitespace++
      else if (/=/.test(character)) {
        if (numQuotes === 1) type = "value"
        if (numQuotes === 2) type = "attribute"
        if (numQuotes === 0) type = "attributeBridge"
      } else if (/</.test(character)) {
        if (numWhitespace != 0) type = "attribute"
        else type = "startTag"
      } else if (/\//.test(character)) type = "endTag" // QUESTION Can any start tag contents have just one backslash?
      if (type !== null) break;
    }
    let context = "startTag"
    if (type === "endTag") context = "endTag"
    // retrun this["_"+type](beforeTrigger, afterTrigger, afterCursor)
    return type
  }

  _closeAngle () {}

  _value () {}
  _attribute () {}
  _attributeBridge () {}
  _startTag () {}
  _endTag () {}

  _findParentTag () {}
  _findSiblingTags () {}
  _findChildrenTags () {}
  _findSiblingAttributes () {}
  _findSiblingValues () {}

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

  _notes () {
    // parsing tag declarations more precisely vvv
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
  }
}

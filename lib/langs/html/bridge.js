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

  // return action and locations???
  handle = (action, e, beforeCursor, afterCursor, previousBlock) => {
    // action can be --> delete, insert, replace, move
    // we NEED previousBlock because if something was inserted in a value/attribute/tag that is invalid we can't go looking for even the initial type

    // get starting location type - tag, attribute, value, in-between
    // find initial trigger
    const {filter, beforeTrigger, afterTrigger} = this._findFilter(beforeCursor, this.symbolToFilter)
    const phase1 = filter(beforeTrigger, afterTrigger, afterCursor) //type

  }

  // Returns which locations to delete
  // needs previous block because current code is different
  // UNLESS I block deleting events.
  // block, beforeCursor, selection, afterCursor? Buffer positions?
  _delete (block, e, beforeCursor, afterCursor, previousBlock) {
    // beforeDeletion (beforeCursor?)
    // deletion/selection
    // afterDeletion (afterCursor?)
    // get range instead? would rather not
    // find entity of start + entity's end
    // compare selection end

    // If multi
    // If in attribute
    // If in tag name
    // If in in attribute value
    // If inside an element but with no contents (maybe text node area)
  }

  // in end or start tag
  _openAngle (beforeTrigger, afterTrigger, afterCursor) {
    // TODO Deal with style attr urls etc in start tags id:87 gh:100 ic:gh
    // TODO Deal with self-closing tags (between / and >) id:90 gh:105 ic:gh
    // If slash just after open angle bracket
    if (/\//.test(afterCursor[0])) return "endTagSyntax" // return this["_endTagSyntax"](0, beforeTrigger, afterTrigger, afterCursor)
    let type = null
    let tokenStart = null
    let numQuotes = 0
    let numWhitespace = 0
    const lastIndex = afterTrigger.length - 1; // length wouldn't be a valid index
    for (let ii = lastIndex; ii >= 0; ii--) {
      endPosition = ii
      const character = afterTrigger[ii]
      if (/["']/.test(character)) {
        numQuotes++ // should only ever get as high as 2 at most
        if (tokenStart === null) tokenStart = ii + 1
      } else if (/\s/.test(character)) {
        numWhitespace++
        if (tokenStart === null) tokenStart = ii + 1
      } else if (/=/.test(character)) {
        if (numQuotes === 1) type = "value"
        if (numQuotes === 2) type = "attribute"
        if (numQuotes === 0) type = "attributeBridge"
        if (tokenStart === null) tokenStart = ii // right at the bridge
      } else if (/</.test(character)) {
        if (numWhitespace !== 0) type = "attribute"
        else type = "startTag"
        if (tokenStart === null) tokenStart = ii + 1
      } else if (/\//.test(character)) type = "endTag" // QUESTION Can any start tag contents have just one backslash? id:88 gh:101 ic:gh
      if (type !== null) break;
    }
    // return this["_"+type](tokenStart, beforeTrigger, afterTrigger, afterCursor)
    return type
  }

  _closeAngle () {}

  _value (tokenStart, beforeTrigger, afterTrigger, afterCursor) {
    // parent attribute name
    // siblings
    // start location (of token or of attribute entity?)
    // end location (of token or of attribute entity?)
    // does it matter if two values are being merged/deleted. do they have to stay whole?
    // what attribute has multiple values that need to stay distinct?
    // * svg path
    // * data-* attribute?
  }
  
  _attribute () {}
  _attributeBridge () {}
  _startTag () {}
  _endTag () {}
  _endTagSyntax () {}
  _selfClosingSyntax () {}

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

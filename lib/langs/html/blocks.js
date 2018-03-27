"use babel"

export default class HTMLBlocks {
  constructor () {}

  build (symbol, beforeTrigger, afterTrigger, afterCursor) {

  }

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

  // doubleQuotes (block, beforeTrigger, afterTrigger, afterCursor) {
  //   // search text before to find property
  //   // return object belonging to property
  //   return null
  // }

  closeAngle = (block, beforeTrigger, afterTrigger, afterCursor) => {
    // Looking for blocks to be inside an HTML element
    // We got all the text before the closing angle bracket, ">"
    const data = this._findTag(beforeTrigger)
    return {color: "blue", block: {
      deleters: /[<>]/
    }}
    // return data.rules
  } // >

  openAngle = (block, beforeTrigger, afterTrigger, afterCursor) => {
    // <tag-plus attr-plus="value more-values_plus" more-attr="css-property: css-value;">
    // =".*[^"]
    // $ afterTrigger includes trigger up until cursor $
    // Looking for blocks to be inside an HTML tag (starting or ending...???)
    // Let's assume starting tag for now

    // TODO deal with ending tag and how to never ever be able to touch that id:30 gh:32 ic:gh

    // TODO don't allow space after open angle bracket timez id:20 gh:22 ic:gh
    const illegalStartTagCharacters = /([^a-z0-9-]+)/gm
    const illegalMidTagCharacters = /([^a-z0-9- ]+)/gm
    // TODO should we even let the plebes type!?!? id:12 gh:14 ic:gh
    // QUESTION if in the middle of a tag name and press space then you're in attribute land. need to know when you're leaving a block and tests stuff then for validity... but space in middle of a tag is leaving the tag name block id:53 gh:59 ic:gh
    const undeletable = /([<"'=;:{}()])/ // QUESTION should we even use this or do we need to find more context!?!? id:65 gh:71 ic:gh
    const uneditable = /([=])/

    const found = {illegalActions:{}} // illegal actions

    // TODO in js must have semicolon before expression like regexp expression id:8 gh:10 ic:gh

    // TODO wat pwrs do MODS have?!!? Can they destroy their maker?!?!!? id:1 gh:3 ic:gh

    // TODO need to know if we're at the end of the tag!!! If not then if non-tag key is pressed (attribute key only) get to end of tag first before inserting attribute!!! id:31 gh:33 ic:gh
    // TODO if insert attribute and no space to the left then add space to the left id:21 gh:23 ic:gh

    // Now let's start taking this bad boy apart...
    const allAfterTrigger = afterTrigger + afterCursor
    const declarationEnd = /^([^>]*?>)/.exec(afterCursor)
    // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" other="sdjf d"> and other stuff
    // TODO test 2: // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" other="sdjf d" > and other stuff id:13 gh:15 ic:gh

    // Important to know what tag we're in!!!
    // MUST HAVE A MATCH!!!
    const declaration = /(^<[\s\S]*>)/.exec(allAfterTrigger)[1]
    const contentsOfDeclaration = /^<([\s\S]*)>/.exec(allAfterTrigger)[1]
    const tagPlus = /<([A-z0-9-]*)([\s\S]*)>/.exec(allAfterTrigger)
    // TODO english-centric much?!?!?! make friendly to other languages!! id:9 gh:11 ic:gh
    // TODO cannot end on a hyphen id:2 gh:4 ic:gh
    // QUESTION allow new line after opening bracket?!?! probably not :P id:38 gh:44 ic:gh
    // QUESTION what if add space in middle of a tag before a hyphen?!?! id:41 gh:47 ic:gh
    const tag = tagPlus[1];

    // afterTrigger: <some-tag-or-partial-tag maybeSom|
    // afterCursor: eAttributeOrAttributePartial="fridge" other="on-bridges"> and other stuff
    // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" other="sdjf d"> and other stuff

    // TODO leave default value behind?!?!!? id:32 gh:34 ic:gh

    // cases (_ === space)
    // 2nd attribute and value
    // ...="...n"_ --> attribute
    // ...="...n" --> attribute next to uneditable
    // ...="..._n -->value
    // ...=" --> value next to undeletable
    // ...= --> uneditable
    // ...="...n"_n --> attribute
    // back to top
    // 1st attribute & value
    // 5 the same
    // _n --> attribute
    // _ --> attribute

    // QUESTION 01/29/18 determine undeletable and then return or loop through all anyway?!?! id:47 gh:53 ic:gh

    // QUESTION position should be length of token till cursor?!?!? "start", "middle", "end"???!? id:54 gh:60 ic:gh
    // instead of that do chars before, chars after???!!?

    // Is tag, attribute, value? (or symbol?)

    // If at end of tag then
    // if (next character is space or ">") pulse the html && html attribute tabs
    // (else) If at middle or beginning of tag show tag options then replace whole tag
    found.tag = tag

    // TODO end tag id:22 gh:24 ic:gh
    if (contentsOfDeclaration[0]==="/") {
      // If we're at an ending tag then kill it my friends
      // have to do this in loop ya dope
      found.illegalActions.any = true
    }

    const lastIndex = afterTrigger.length - 1
    for (let ii = lastIndex; ii >= 0; ii--) {
      // If it's really the tag then there won't be anything in here to trigger an if statement
      // If not tag then has a space at the start which is at 0
      let character = afterTrigger[ii]
      found.symbol = character
      // If right next to undeletable or uneditable symbol
      if (ii === lastIndex) {
        // TODO Backspace illegal??!?!!? id:14 gh:16 ic:gh
        if (undeletable.test(character)) found.illegalActions.delete = true
        if (uneditable.test(character)) found.illegalActions.any = true
      }

      if (character === "<" && found.type !== "attribute") {
        // If found start angle bracket but not a space first am at tag
        found.nameStartIndex = ii+1
        found.type = "tag"
        if (ii === lastIndex) {
          found.illegalPattern = illegalStartTagCharacters
        } else found.illegalPattern = illegalMidTagCharacters
      } else if (character === " ") {
        // TODO assign this to block.attribute unless/until we find it's a value id:10 gh:12 ic:gh
        found.nameStartIndex = ii+1
        found.type = "attribute" // in attribute next to tag or in value!! pick which later if needed
        // keep looking for the indicator of the type
      } else if (character === "=") {
        // the only time we'll find an "=" is when we're right next to it otherwise we'll find a quote first
        found.nameStartIndex = ii
        found.type = "symbol" // ?!!?
        break
      } else if (character === "\"") {
        if (!found.nameStartIndex) found.nameStartIndex = ii+1
        if (afterTrigger[ii-1] === "=") {
          // If closest on the left is "="
          found.type = "value"
          found.attributeEndInclusive = ii-2
        } else found.type = "attribute" // If not then we'll start an attribute next. attribute next to value on left
        break
      }
    } // for backwards through string without tag

    // TOnotDO If in tag then find matches for tag and show those
    // TOnotDO if tag then need containing tag to get valid tag values
    // QUESTION all that comes next?!?!? id:66 gh:72 ic:gh

    // TOnotDO IGNORE ME this is done earlier
    // TOnotDO If just left tag make sure tag is valid!?!? and if not then ask if custom tag is desired
    // QUESTION how to know if just left tag!?!?! maybe this is separate & done earlier id:39 gh:45 ic:gh

    // TODO Find token in declaration (which has start angle bracket just like afterTrigger) id:3 gh:5 ic:gh
    // QUESTION name === found[found.type]?!?!! id:42 gh:48 ic:gh
    // QUESTION name into [first half, second half]? id:48 gh:54 ic:gh

    const fromStart = declaration.substring(found.nameStartIndex)
    if (found.type === "tag") found.value = tag
    else if (found.type === "attribute") {
      const names = /^([^=]\S*)=[\s\S]*>/.exec(fromStart)
      if (names === null) found.value = ""
      else found.value = names[1]
      block.attribute = found.value
    } else if (found.type === "value") {
      // beforeTrigger, afterTrigger, afterCursor, found
      // found {type, illegalPattern, illegalActions, tag, symbol, nameStartIndex, attributeEndInclusive}
      // lctr.finders.html[found.type](beforeTrigger, afterTrigger, afterCursor, found)
      block = this._getValue(block, beforeTrigger, afterTrigger, afterCursor, found)
    }
    // else if (found.type === "symbol") {}

    // found.nameEndIndex = found.nameStartIndex + found.name.length
    found.beforeCursor = afterTrigger.substring(found.nameStartIndex)
    // TODO find found.afterCursor to combine to get whole value for validation when moving id:74 gh:80 ic:gh

    const data = {action:"editable", type:found.type, block: block, color: "black", deleters: /[<>="]/}

    // TODO deal with cursor in equals --> CANNOT EDIT HERE & DELETE REMOVES WHOLE BLOCK id:33 gh:35 ic:gh
    if (found.illegalActions.any) {data.action = "undeletable"; data.color = "red"}
    else if (found.illegalActions.delete) {data.action = "uneditable"; data.color = "tomato"}
    else if (found.type === "tag") data.color = "orange"
    // value (inside quotes)
    else if (found.type === "value") data.color = "white"
    // Find attribute to know what values are allowed
    // attribute (inside attribute name)
    else if (found.type === "attribute") data.color = "yellow"
    // Find tag to know what attributes are allowed
    return data

    // TODO NEXT 1. id hanging whitespace id:23 gh:25 ic:gh
    // TODO NEXT 2. collect habitat id:15 gh:17 ic:gh



    // Notes
    // Different kinds of categories
    // Action categories (kind of locations too)
    // - editable (editing allowed, deleting is normal)
    // - undeleteable (editing allowed, delete deletes whole block)
    // - uneditable (editing prevented, delete deletes whole block)
    // Type categories
    // - tag
    // - attributes
    // - value
    // ~Location categories~
    // - start
    // - middle
    // - end
    // ~Character~
    // Token/full word/non-space timez (if token in "" then no searching in valid values needs to be done)
    // Token before cursor?!!? (depends how we're autocompleting)
    // Block (important if undeletable then need to know start and end of the block... but how?!?!! we have indexes not buffer positions)
    // TODO how to convert from index to buffer position?!?! id:27 gh:29 ic:gh
    // block.location block.tag block.attribute
    // Tag value (important if type is tag or attribute)
    // Attribute value (important if type is value)

    // afterTrigger: "<some-tag-or-partial-tag maybeSomeAttributeOrAttributePartial>"
    // QUESTION can I even have a partial tag!?!?!!?? Have to be able to have partial tags r? id:55 gh:61 ic:gh
    // TODO Maybe can move through text by typing the text like with closing quotes but only through uneditable text...?!!?!?!!?!? id:4 gh:6 ic:gh

    // TODO boundary characters!!!!!!?!? id:34 gh:36 ic:gh
    // space, colon, semicolon, period?!?!, math operation, paren, open angle bracket?!?!!?

    // NOTE types in html: keyword, tag, attribute, value id:24 gh:26 ic:gh
  } // open angle

  _getValue (block, beforeTrigger, afterTrigger, afterCursor, found) {
      // value block signature (block === thing we delete if delete undeletable)
      // block is called equation, formula,instruction, pattern, symmetry
      // let block = {
      //   type: "attribute",
      //   // TODO find a different name id:16 gh:18 ic:gh
      //   found: found, // actual value and it's position?? and stuff like that. {type, illegalPattern, illegalActions, symbol, nameStartIndex, value}
      //   // QUESTION right side and left side??!?!? just the attribute name and values?!?!? or just value?!?! ?!?!? id:67 gh:73 ic:gh
      //   // TODO must have whole word for testing when moving id:28 gh:30 ic:gh
      //   tag: "tag-name",
      //   attribute: "attribute-name",  // QUESTION called left instead!?!? id:60 gh:66 ic:gh
      //   values: [], // this attribute's values QUESTION called right instead!?!?! id:43 gh:49 ic:gh
      //   startIndex: 5, // number in whole text that is the start of the block,
      //   endIndex: 12, // same but for end (inclusive...???) QUESTION need end or just use length of text!??! id:49 gh:55 ic:gh
      //   text: "attribute=\"fridge\"", // QUESTION need this?!!?! id:56 gh:62 ic:gh
      //   siblings: [{tag: "same-tag-name", attribute: "attribute-name",type: "attribute", values: ["some", "values"]}], // other attributes with their values which are fake blocks
      //   parent: {type: "tag", tag: "tag-name", children: [{/*attribute blocks*/}]} // QUESTION call tag left instead?!?! and call children right instead!?!?! id:68 gh:74 ic:gh
      // }

      // build the habitat of the value and its block in its block
      // Habitat
      // Character to left of cursor (maybe to watch for deleting but what about backspace?!?)
      // found container/bucket with Full word (and Parts of word?!!? for fuzzy matching. right and left)
      // Values and types of nested parents and siblings
      // buffer positions or index of start and end
      // QUESTION: illegal patterns here or in found object?!?! id:61 gh:67 ic:gh
      // undeletable characters/patterns?!!? (same QUESTION ) id:44 gh:50 ic:gh
      // uneditable characters/patterns?!?! (same QUESTION ) id:50 gh:56 ic:gh

      // QUESTION block contains its habitat?!!? id:57 gh:63 ic:gh
      block.type = "attribute"
      block.deleters = /["=]/g
      block.found = found
      block.tag = found.tag // do tag in here instead of out there?!?!

      const declarationStart = afterTrigger
      const declarationEnd = /^([^>]*?>)/.exec(afterCursor)[1]
      const declaration = /(^<[\s\S]*?>)/.exec(afterTrigger + afterCursor)[1]

      // Own name
      // QUESTION allow line breaks or tabs between values?!?!? id:69 gh:75 ic:gh
      const fromStart = afterTrigger.substring(found.nameStartIndex)
      found.value = /^([^" ]*)/.exec(fromStart)[1]

      // attribute
      // afterTrigger because we'll definitely have the whole attribute here because we're at a value
      const throughAttribute = afterTrigger.substring(0, found.attributeEndInclusive + 1)
      const parts = throughAttribute.split(/\s/) // all the attributes before this one and this one
      block.attribute = parts[parts.length-1]

      // block location in whole text
      // Index of start of the attribute in whole thang
      block.location = {}
      loc = block.location
      loc.start = beforeTrigger.length + found.attributeEndInclusive - (block.attribute.length - 1) // - 1 more?!?!?
      let relativeIndex = declarationEnd.match(/^([^"]*")/)[1].length
      loc.end = beforeTrigger.length + afterTrigger.length + relativeIndex
      // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" class="a-class too" id="fridge"> and other stuff

      block.text = (beforeTrigger + declaration).substring(loc.start, loc.end)

      // all values in block
      // TODO find duplicate values in the block and don't do that!!!! (compare block.values to each other when moving) id:5 gh:7 ic:gh
      block.values = block.text.match(/"([^"]*)"/)[1].split(" ")

      // Go through parent block while ignoring block and find all habitat values
      const blockLocalStart = found.attributeEndInclusive - block.attribute.length // length - 1?!?!
      const blockDeclarationLocation = {
        start: blockLocalStart,
        end: blockLocalStart + block.text.length - 1
      }
      // declaration starts with afterTrigger
      const before = declaration.substring(0, blockDeclarationLocation.start)
      const after = declaration.substring(blockDeclarationLocation.end)

      // reusable for all html tag declarations
      // find sibling blocks
      block.parent = {
        type: "tag",
        tag: block.tag
      }
      const attributeRegexp = /\s([^"]+="[^"]*")/g
      const attributesBefore = before.match(attributeRegexp)
      const attributesAfter = after.match(attributeRegexp)
      let siblingsBefore = [], siblingsAfter = []
      if (attributesBefore) siblingsBefore = siblingsBefore.concat(this._getAttributeSiblings(attributesBefore, block.tag))
      if (attributesAfter) siblingsAfter = siblingsAfter.concat(this._getAttributeSiblings(attributesAfter, block.tag))
      block.siblings = siblingsBefore.concat(siblingsAfter)
      block.parent.children = [].concat(siblingsBefore).concat(block).concat(siblingsAfter)

      block.whereDelete = function (characters) {return [this.location]}
      block.whereEdit = function () {}
      block.leaveReaction = function () {}

      return block
    } // get value

    _getAttributeSiblings (allAttributes, tag) {
      let siblings = []
      for (let ii = 0; ii < allAttributes.length; ii++) {
        const attributeText = allAttributes[ii]
        const attributeMatch = attributeText.match(/\s([^=]*)+=/)
        // all: <some-tag-or-partial-tag jumbo="gumbo" attribute="n" class="a-class too" id="fridge" indigo="pirate arrr"> and other stuff
        let sib = {}
        sib.tag = tag
        sib.attribute = attributeMatch[1]
        sib.type = "attribute"
        sib.values = attributeText.match(/"([^"]+)"/)[1].split(" ")
        siblings.push(sib)
      }
      // TODO Special highlight when token is a duplicate of siblings but allow to continue editing id:79 gh:87 ic:gh
      return siblings
    } //get attribute siblings

    _findTag (beforeTrigger) {
      return this._findRules(beforeTrigger, "<", /<(\w+[-]?\w*)/, {}, true)
    }

    _findRules (text, stopper, regex, rules, matchGuaranteed) { // findKey? lookBackwardsToFindKeyFromPattern
      let ruleSet = null
      let proximity = null
      let match = null
      for (let ii = text.length - 1; ii >= 0; ii--) {
        let char = text[ii]
        if (char === stopper) {
          // Get the text from stopper and onwards
          let toSearchIn = text.substring(ii)
          // Find what we want in there
          let matches = regex.exec(toSearchIn)
          if (matches) {
            match = matches[1]
            ruleSet = rules[match]
            proximity = ((text.length - 1) - ii)
          }
          break
        }
      }
      // QUESTION Shouldn't there ALWAYS be something there?!?! At least in this particular case where we're in an element. But now we're abstracted!!!! id:62 gh:68 ic:gh
      // if (!matchGuaranteed && !match)
      return {rules: ruleSet, proximity: proximity, match: match}
    } // findRules
}

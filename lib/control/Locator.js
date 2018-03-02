"use babel"

import {CompositeDisposable, Disposable} from "atom"
import {html} from "../data/html-main"

export default class Renderer {

  constructor(serializedState, bufferChanger, manager) {
    const rdr = this
    rdr.manager = manager
    rdr.bufferChanger = bufferChanger
    rdr.language = null
    rdr.followUp = this.followUpDefault
    // QUESTION what if its a whole word not just a character... id:40
    rdr.finders = { // boundries????!?!? that are finding rules. rule finders by boundry characters
      "html": {
        // quotes only matter inside opening tags!!!!!!!
        // "\"": function(beforeTrigger, afterTrigger, afterCursor){
        //   // search text before to find property
        //   // return object belonging to property
        //   return null
        // },
        // TODO stop a selection when it gets into something that can't be deleted as when cursor is dragged or when text is tripple clicked id:0 gh:2 ic:gh
        "<": function(beforeTrigger, afterTrigger, afterCursor){
          // <tag-plus attr-plus="value more-values_plus" more-attr="css-property: css-value;">
          // =".*[^"]
          // $ afterTrigger includes trigger up until cursor $
          // Looking for blocks to be inside an HTML tag (starting or ending...???)
          // Let's assume starting for now

          // TODO deal with ending tag and how to never ever be able to touch that id:30 gh:32 ic:gh
          // if afterCursor first char === "/" then whoa bro, go right back where you came from. No go zone. Or maybe delete zone?!?!?!? Or can only delete outside of a full tag bracket set.

          // otherwise do continue to narrow down your options
          let boundries = {
            // "<": function(){
            //   // tag
            // }, //QUESTION included in afterTrigger?!?! id:46
            " ": function(){
              // attribute or value
            },
            // "(": function(){},
            // ":": function(){},
            // ";": function(){},
            "\"": function(){
              // closing or opening """. next to a "=" === opening
              // otherwise closing. jump a space. hint at other attribute
            },
            // "'": function(){},
            // ",": function(){},
            // "=" does not help
          }

          // TODO don't allow space after open angle bracket timez id:20 gh:22 ic:gh
          const illegalStartTagCharacters = /([^a-z0-9-]+)/gm
          const illegalMidTagCharacters = /([^a-z0-9- ]+)/gm
          // TODO should we even let the plebes type!?!? id:12 gh:14 ic:gh
          // QUESTION if in the middle of a tag name and press space then you're in attribute land. need to know when you're leaving a block and tests stuff then for validity... but space in middle of a tag is leaving the tag name block id:53
          const undeletable = /([<"'=;:{}()])/ // QUESTION should we even use this or do we need to find more context!?!? id:65
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
          // QUESTION allow new line after opening bracket?!?! probably not :P id:38
          // QUESTION what if add space in middle of a tag before a hyphen?!?! id:41
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

          // QUESTION 01/29/18 determine undeletable and then return or loop through all anyway?!?! id:47

          // QUESTION position should be length of token till cursor?!?!? "start", "middle", "end"???!? id:54
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
          // QUESTION all that comes next?!?!? id:66

          // TOnotDO IGNORE ME this is done earlier
          // TOnotDO If just left tag make sure tag is valid!?!? and if not then ask if custom tag is desired
          // QUESTION how to know if just left tag!?!?! maybe this is separate & done earlier id:39

          // TODO Find token in declaration (which has start angle bracket just like afterTrigger) id:3 gh:5 ic:gh
          // QUESTION name === found[found.type]?!?!! id:42
          // QUESTION name into [first half, second half]? id:48

          let block = {}

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
            // rdr.finders.html[found.type](beforeTrigger, afterTrigger, afterCursor, found)
            block = rdr.finders.html._value(beforeTrigger, afterTrigger, afterCursor, found)
          }
          // else if (found.type === "symbol") {}

          // found.nameEndIndex = found.nameStartIndex + found.name.length
          found.beforeCursor = afterTrigger.substring(found.nameStartIndex)

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
          // QUESTION can I even have a partial tag!?!?!!?? Have to be able to have partial tags r? id:55
          // TODO Maybe can move through text by typing the text like with closing quotes but only through uneditable text...?!!?!?!!?!? id:4 gh:6 ic:gh

          // TODO boundary characters!!!!!!?!? id:34 gh:36 ic:gh
          // space, colon, semicolon, period?!?!, math operation, paren, open angle bracket?!?!!?

          // NOTE types in html: keyword, tag, attribute, value id:24 gh:26 ic:gh
        },
        "_value": function(beforeTrigger, afterTrigger, afterCursor, found){
          // value block signature (block === thing we delete if delete undeletable)
          // block is called equation, formula,instruction, pattern, symmetry
          // let block = {
          //   type: "attribute",
          //   // TODO find a different name id:16 gh:18 ic:gh
          //   found: found, // actual value and it's position?? and stuff like that. {type, illegalPattern, illegalActions, symbol, nameStartIndex, value}
          //   // QUESTION right side and left side??!?!? just the attribute name and values?!?!? or just value?!?! ?!?!? id:67
          //   // TODO must have whole word for testing when moving id:28 gh:30 ic:gh
          //   tag: "tag-name",
          //   attribute: "attribute-name",  // QUESTION called left instead!?!? id:60
          //   values: [], // this attribute's values QUESTION called right instead!?!?! id:43
          //   startIndex: 5, // number in whole text that is the start of the block,
          //   endIndex: 12, // same but for end (inclusive...???) QUESTION need end or just use length of text!??! id:49
          //   text: "attribute=\"fridge\"", // QUESTION need this?!!?! id:56
          //   siblings: [{tag: "same-tag-name", attribute: "attribute-name",type: "attribute", values: ["some", "values"]}], // other attributes with their values which are fake blocks
          //   parent: {type: "tag", tag: "tag-name", children: [{/*attribute blocks*/}]} // QUESTION call tag left instead?!?! and call children right instead!?!?! id:68
          // }

          // build the habitat of the value and its block in its block
          // Habitat
          // Character to left of cursor (maybe to watch for deleting but what about backspace?!?)
          // found container/bucket with Full word (and Parts of word?!!? for fuzzy matching. right and left)
          // Values and types of nested parents and siblings
          // buffer positions or index of start and end
          // QUESTION: illegal patterns here or in found object?!?! id:61
          // undeletable characters/patterns?!!? (same QUESTION ) id:44
          // uneditable characters/patterns?!?! (same QUESTION ) id:50

          // QUESTION block contains its habitat?!!? id:57
          const block = {type:"attribute", deleters:/["=]/g}
          block.found = found
          block.tag = found.tag // do tag in here instead of out there?!?!

          const declarationStart = afterTrigger
          const declarationEnd = /^([^>]*?>)/.exec(afterCursor)[1]
          const declaration = /(^<[\s\S]*?>)/.exec(afterTrigger + afterCursor)[1]

          // Own name
          // QUESTION allow line breaks or tabs between values?!?!? id:69
          const fromStart = afterTrigger.substring(found.nameStartIndex)
          found.value = /^([^" ]*)/.exec(fromStart)[1]

          // attribute
          // afterTrigger because we'll definitely have the whole attribute here because we're at a value
          const throughAttribute = afterTrigger.substring(0, found.attributeEndInclusive + 1)
          const parts = throughAttribute.split(/\s/) // all the attributes before this one and this one
          block.attribute = parts[parts.length-1]

          // block location in whole text
          // Index of start of the attribute in whole thang
          block.startIndex = beforeTrigger.length + found.attributeEndInclusive - (block.attribute.length - 1) // - 1 more?!?!?
          let relativeIndex = declarationEnd.match(/^([^"]*")/)[1].length
          block.endIndex = beforeTrigger.length + afterTrigger.length + relativeIndex
          // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" class="a-class too" id="fridge"> and other stuff

          block.text = (beforeTrigger + declaration).substring(block.startIndex, block.endIndex)

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
          if (attributesBefore) siblingsBefore = siblingsBefore.concat(rdr.finders.html._attributeSiblings(attributesBefore, block.tag))
          if (attributesAfter) siblingsAfter = siblingsAfter.concat(rdr.finders.html._attributeSiblings(attributesAfter, block.tag))
          block.siblings = siblingsBefore.concat(siblingsAfter)
          block.parent.children = [].concat(siblingsBefore).concat(block).concat(siblingsAfter)
          return block
        }, // _value
        "_attributeSiblings": function(allAttributes, tag){
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
          return siblings
        }, //_attributeSiblings
        ">": function(beforeTrigger, afterTrigger, afterCursor){
          // Looking for blocks to be inside an HTML element
          // We got all the text before the closing angle bracket, ">"
          const data = rdr.findTag(beforeTrigger)
          return {color: "blue", block: {
            deleters: /[<>]/
          }}
          // return data.rules
        } // >
      } // html
    } // finders
  }

  findTag(beforeTrigger){
    return this.findRules(beforeTrigger, "<", /<(\w+[-]?\w*)/, html, true)
  }

  findRules(text, stopper, regex, rules, matchGuaranteed){ // findKey!?!? lookBackwardsToFindKeyFromPattern
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
    // QUESTION Shouldn't there ALWAYS be something there?!?! At least in this particular case where we're in an element. But now we're abstracted!!!! id:62
    // if (!matchGuaranteed && !match)
    return {rules: ruleSet, proximity: proximity, match: match}
  } // findRules

  followUpDefault(){console.log("default followUp");return {color:"lightgreen", block:{}}}

  getNewBlock (e, beforeCursor, afterCursor, fileScope, previousBlock) {
    let trigger = null // the character that identifies the container of this block
    let finder = null // the function that will get us the rules that apply to this block
    let foundAt = null // the index at which the trigger is found
    for (let ii = beforeCursor.length - 1; ii >= 0; ii--) {
      trigger = beforeCursor[ii]
      finder = this.finders[fileScope][trigger]
      foundAt = ii
      if (finder) {break}
    }
    // If no matches were found (might happen at the very start)
    if (!finder) return null
    // We can assume there is an ender to this starter because we rock (also we have TOTAL CONTROL of the code)
    const beforeFound = beforeCursor.substring(0,foundAt)
    const afterFound = beforeCursor.substring(foundAt)
    const data = finder(beforeFound, afterFound, afterCursor)
    return data
  }

  deleteBlock(e, previousBlock){
    this.followUp = this.move
    // remove text (TODO and any extra whitespace)
    let start = previousBlock.startIndex || 0
    if (start > 0) start = start - 1 // primitive getting rid of white space
    const location = {start: start || 0, end: previousBlock.endIndex || 0}
    const locator = this
    // Return deletion first!!!!
    setTimeout(function(){locator.bufferChanger.deleteIndexRange(location, e.oldText)},0)
    // wait for editor to update
    // #move# with new cursor position
    console.log("fridge");
    return {color: "green", block: "deleted"}
  }

  // NOTE of atom behavior id:35 gh:37 ic:gh
  // When deleting text manually and then with code atom does this vvv
  // Moves the cursor with no text changed (?!?!?!!?) called position X
  // Deletes old text
  // vvv Our part starts vvv
  // deletes text with code which triggers an edit
  // since text is changing that triggers a move
  // move is returned
  // delete is returned
  // ^^^ our part ends ^^^
  // moves cursor to start of deleted text
  // moves cursor back to position X

  // BUG doesn't register move when go to new editor. WHY!?!?!!
  // TODO don't allow user to close plugin when editing a validated file!!!!! but please explain it to them... id:25 gh:27 ic:gh

  move(e, beforeCursor, afterCursor, fileScope, previousBlock){
    // uses beforeCursor, afterCursor, + fileScope
    // if previousBlock was not deleted
    // then if duplicate value then say so and delete duplicate value else
    // then try hard match **whole name/word** to known permitted names which includes testing of parent permitted content and custom names like in #id# (b)
    // then if no match prevent move/whitespace then ask if want custom name
    // then if match is valid delete extra whitespace + allow move + #id# (a) new block
    // then if match not valid prompt user for action
    // else allow move + #id# (a) new block

    // previousBlock might be "deleted" because it was just deleted
    if (previousBlock !== "deleted") {const fridge = 5;}
    const data = this.getNewBlock(e, beforeCursor, afterCursor, fileScope, previousBlock)
    console.log("returning move");
    return {color: data.color, block: data.block}
  }
  preDelete(e, beforeCursor, afterCursor, fileScope, previousBlock){return{color:"lightgreen",block:previousBlock}}
  deleteMany(e, beforeCursor, afterCursor, fileScope, previousBlock){this.deleting = false;return {color: "black", block: previousBlock}}
  deleteOne(e, beforeCursor, afterCursor, fileScope, previousBlock){
    // if deleted a block-deleter for this block then delete whole block + extra whitespace using... text postition converted to buffer position?!?!?! + #move#
    // else permit and #id#
    // QUESTION how to decide what white space to delete!?!?!?! id:45
    // TEMP if deleters. gotta have em. gotta love em.
    let isDeleter = false
    let data = null
    if (Boolean(previousBlock.deleters)) isDeleter = previousBlock.deleters.test(e.oldText)
      console.log("deleting one test -->", e.oldText, previousBlock.deleters, isDeleter, previousBlock);
    if (isDeleter){
      console.log("if -->", e.oldText, previousBlock.deleters, isDeleter);
      data = this.deleteBlock(e, previousBlock)
    } else {console.log("else -->", e);data = {color: "purple", block: previousBlock}}
    // TODO update block pls id:17 gh:19 ic:gh
    this.deleting = false
    return data
  }
  insertMany(e, beforeCursor, afterCursor, fileScope, previousBlock){return {color: "black", block: {}}}
  insertOne(e, beforeCursor, afterCursor, fileScope, previousBlock){return this.move(e, beforeCursor, afterCursor, fileScope, previousBlock)}
  special(e, beforeCursor, afterCursor, fileScope, previousBlock){console.log("special!!!");return {color: "black", block: {}}}

  locate = async (e, beforeCursor, afterCursor, fileScope, previousBlock) => {
    // cursorPosition === index of the character before which the cursor appears
    // BRAINSTROM!!!!!!!
    // DO NOT PREVENT USER FROM TYPING THINGS IN
    // *DO* PREVENT USER FROM LEAVING INVALID CODE BEHIND

    // look at text surrounding cursor
    // discover language???!?!?
    // discover "context" (not window or w/e. instead what block we're in)
    // "'" starts a quotation block
    // If in uneditable return (keep track of previous cursor position and return curosor to that position but what if multiple cursors!??!?!)
    // uneditable can only be deleted and deletes whole block
    // TODO if event was keypress do different actions when analyzed (space is special etc) id:29 gh:31 ic:gh
    // QUESTION if event was selection then also different?!?! id:51
    // QUESTION if event was paste then also diffrent?!!?! id:58
    // TODO if deleting a block that is all selected then no confirmation needed id:6 gh:8 ic:gh
    // QUESTION if undoing is easy then why is confirmation ever needed?!?!??! id:70
    // QUESTION if paste then confirm each character in order??!?! **nope** then can't paste blocks id:63
    // QUESTION validate block on copy?!?! even if in other editor.... **nope** what if copy outside of atom?!?! id:64

    // Definitions
    // A "block" can be deleted by deleting certain symbols
    // A "part/atom" can be deleted without the "block" being deleted

    // # Flow
    // √ 1. action === #move#
    //  - Description: press whitespace or move cursor with arrows or mouse
    // 2. action === #delete 1#
    // - Description: as long as nothing is selected
    // 3. action === #insert 1#
    // - Description: inserting one character with keyboard probably maybe
    // 4. action === #special# unknown procedure
    // #move#
    // if duplicate value then say so and delete duplicate value else
    // try hard match **whole name/word** to known permitted names which includes testing of parent permitted content and custom names like in #id# (b)
    // if no match prevent move/whitespace then ask if want custom name
    // if match/is valid delete extra whitespace + allow move + #id# (a) new block
    // #delete 1#
    // if deleted a block-deleter for this block then delete whole block using... text postition converted to buffer position?!?!?! + #move#
    // else permit and #id#
    // #insert 1#
    // go to #id#
    // #id#
    // a. using language and language object assess and store habitat
    // b. keep it loose
    //  - prevent illegal patterns
    //  - fuzzy search/soft match for names using those permitted by parent + keywords + custom names... but only for stuff before the cursor?!?!?!
    //  - show completion options
    // #match# function parameters
    // hard or soft?
    // word to match
    // permitted by parent
    // all keywords?!?!
    // custom names

    // Return Value
    // prevent or not prevent
    // message/popup
    // matches?!??!
    // edits (like clean up whitespace) is callback?!!?

    // TODO NEXT listen for editor changes too/instead id:36 gh:38 ic:gh
    // still wanna kno whitespace added
    // --> Text editor atom events
    // onWillInsertText get text and cancel. does this happen only when pasting or also when pressing a key??!??!
    // onDidChangeCursorPosition .oldBufferPosition .oldScreenPosition .newBufferPosition .newScreenPosition .textChanged Boolean .cursor. happen on each cursor that is moved. will have to save all previously checked cursors and positions so can fix if needed
    // TODO onDidAddCursor id:26 gh:28 ic:gh
    // delete & Backspace are separate
    // onDidChange doesn't list any event props
    // --> Text buffer atom events
    // TextBuffer ::onDidChange .oldRange,newRange,oldText,newText
    // TODO !!!!! index to position!!!! TextBuffer positionForCharacterIndex id:18 gh:20 ic:gh
    // QUESTION what's an atom mini editor?!?! id:52
    // if e.newText === nothing then it was undo
    // QUESTION what if move inside the same name/value/found item id:59

    if (this.bufferChanger.changingSelf) {
      console.log("was changing self!!!!");
      this.bufferChanger.endChange()
      const data = this.followUp(e, beforeCursor, afterCursor, fileScope, previousBlock)
      this.followUp = this.followUpDefault
      data.block.followUp = true // wat!?!?!?
      return data
    }

    let action = null
    if (e.eventType === "cursor") {
      action = "move"
      // ignore a move right after delete because I don't like atom and because will show message we don't want in some instances
      if (this.deleting) {return {color: "lightgreen",block:previousBlock}} // If we're deleting then pretend this never happened. almost....
    } else if (e.eventType === "edit") {
      if (e.newText === "") {
        // Does not tell us if it deleted to the right or the left... :( :( :(
        if (e.oldText.length > 1) action = "deleteMany"
        else action = "deleteOne"
      } else if (e.oldText === "") {
        if (e.newText.length > 1) action = "insertMany"
        else action = "insertOne"
      } else action = "special"
      // autocomplete --> oldText === newText
      // select and replace --> oldText === deleting but newText !== "" is instead a new letter
    } else if (e.eventType === "dom") {
      // set up to ignore the first move after a delete so don't get weird messages
      if (e.type === "keydown" && (e.key === "Backspace" || e.key === "Delete")) this.deleting = true
      action = "preDelete"
    }
    console.log("action -->",action)
    const data = this[action](e, beforeCursor, afterCursor, fileScope, previousBlock)
    return data
  }
}

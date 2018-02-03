"use babel"

import {CompositeDisposable, Disposable} from "atom"
import {html} from "../data/html-main"

export default class Renderer {

  constructor(serializedState, manager) {
    const rdr = this
    rdr.manager = manager
    rdr.language = null
    // QUESTION what if its a whole word not just a character...
    rdr.finders = { // boundries????!?!? that are finding rules. rule finders by boundry characters
      "html": {
        // quotes only matter inside opening tags!!!!!!!
        // "\"": function(beforeTrigger, afterTrigger, afterCursor){
        //   // search text before to find property
        //   // return object belonging to property
        //   return null
        // },
        // TODO stop a selection when it gets into something that can't be deleted as when cursor is dragged or when text is tripple clicked
        "<": function(beforeTrigger, afterTrigger, afterCursor){
          // <tag-plus attr-plus="value more-values_plus" more-attr="css-property: css-value;">
          // =".*[^"]
          // $ afterTrigger includes trigger up until cursor $
          // Looking for blocks to be inside an HTML tag (starting or ending...???)
          // Let's assume starting for now

          // TODO deal with ending tag and how to never ever be able to touch that
          // if afterCursor first char === "/" then whoa bro, go right back where you came from. No go zone. Or maybe delete zone?!?!?!? Or can only delete outside of a full tag bracket set.

          // otherwise do continue to narrow down your options
          let boundries = {
            // "<": function(){
            //   // tag
            // }, //QUESTION included in afterTrigger?!?!
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

          // TODO don't allow space after open angle bracket timez
          const illegalStartTagCharacters = /([^a-z-]+)/gm
          const illegalMidTagCharacters = /([^a-z- ]+)/gm
          // TODO should we even let the plebes type!?!?
          // QUESTION if in the middle of a tag name and press space then you're in attribute land. need to know when you're leaving a block and tests stuff then for validity... but space in middle of a tag is leaving the tag name block
          const undeletable = /([<"'=;:{}()])/ // QUESTION should we even use this or do we need to find more context!?!?
          const uneditable = /([=])/

          const found = {illegalActions:{}} // illegal actions

          // TODO in js must have semicolon before expression like regexp expression

          // TODO wat pwrs do MODS have?!!? Can they destroy their maker?!?!!?

          // TODO need to know if we're at the end of the tag!!! If not then if non-tag key is pressed (attribute key only) get to end of tag first before inserting attribute!!!
          // TODO if insert attribute and no space to the left then add space to the left

          // Now let's start taking this bad boy apart...
          const allAfterTrigger = afterTrigger + afterCursor

          // Important to know what tag we're in!!!
          // MUST HAVE A MATCH!!!
          const declaration = /(^<[\s\S]*>)/.exec(allAfterTrigger)[1]
          const contentsOfDeclaration = /^<([\s\S]*)>/.exec(allAfterTrigger)[1]
          const tagPlus = /<(\w+[-]?\w*[^\s]{1,})([\s\S]*)>/.exec(allAfterTrigger)
          const tag = tagPlus[1];
          // almost vvvv but breaks values apart too
          // const parts = /<((?!<|\s)\S+)>/.exec(allAfterTrigger)

          // NOTE How to get the last attribute pair
          // ^<(\w+[-]?\w*[^\s]{1,})((\s{1,})(.*[^=\s\n])(=)(")([\s\S]*?)(")?)*>
          // <some-tag-or attr="n"
          // other="sdjf d" > and other stuff
          // `<some-tag-or attr="n"
          // other="sdjf d" >`, `some-tag-or`, `
          // other="sdjf d" `
          // `
          // `, `other`, `=`, `"`, `sdjf d" `

          // afterTrigger: <some-tag-or-partial-tag maybeSom|
          // afterCursor: eAttributeOrAttributePartial="fridge" other="on-bridges"> and other stuff
          // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" other="sdjf d" > and other stuff

          // TODO leave default value behind?!?!!?

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

          // QUESTION 01/29/18 determine undeletable and then return or loop through all anyway?!?!

          // QUESTION position should be length of token till cursor?!?!? "start", "middle", "end"???!?
          // instead of that do chars before, chars after???!!?

          // Is tag, attribute, value? (or symbol?)

          // If at end of tag then
          // if (next character is space or ">") pulse the html && html attribute tabs
          // (else) If at middle or beginning of tag show tag options then replace whole tag
          found.tag = tag

          // TODO end tag
          if (contentsOfDeclaration[0]==="/") {
            // If we're at an ending tag then kill it my friends
            // have to do this in loop ya dope
            found.illegalActions.any = true
          }

          const lastIndex = afterTrigger.length-1
          let attributeEndInclusive = lastIndex
          for (let ii = lastIndex; ii >= 0; ii--) {
            // If it's really the tag then there won't be anything in here to trigger an if statement
            // If not tag then has a space at the start which is at 0
            let character = afterTrigger[ii]
            found.symbol = character
            // If right next to undeletable or uneditable symbol
            if (ii === lastIndex) {
              if (undeletable.test(character)) found.illegalActions.delete = true
              if (uneditable.test(character)) found.illegalActions.any = true
            }

            if (character === "<" && found.type !== "attribute") {
              // If found start angle bracket but not a space first am at tag
              found.nameStart = ii+1
              found.type = "tag"
              if (ii === lastIndex) {
                found.illegalPattern = illegalStartTagCharacters
              } else found.illegalPattern = illegalMidTagCharacters
            } else if (character === " ") {
              found.nameStart = ii+1
              found.type = "attribute" // in attribute next to tag or in value!! pick which later if needed
              // keep looking for the indicator of the type
            } else if (character === "=") {
              // the only time we'll find an "=" is when we're right next to it otherwise we'll find a quote first
              found.nameStart = ii
              found.type = "symbol" // ?!!?
              break
            } else if (character === "\"") {
              if (!found.nameStart) found.nameStart = ii+1
              if (afterTrigger[ii-1] === "=") {
                // If closest on the left is "=""
                found.type = "value"
                attributeEndInclusive = ii-2
              } else found.type = "attribute" // If not then we'll start an attribute next. attribute next to value on left
              break
            }
          } // for backwards through string without tag

          // TOnotDO If in tag then find matches for tag and show those
          // TOnotDO if tag then need containing tag to get valid tag values
          // QUESTION all that comes next?!?!?

          // TOnotDO IGNORE ME this is done earlier
          // TOnotDO If just left tag make sure tag is valid!?!? and if not then ask if custom tag is desired
          // QUESTION how to know if just left tag!?!?! maybe this is separate & done earlier

          // TODO Find token in declaration (which has start angle bracket just like afterTrigger)
          // QUESTION name === found[found.type]?!?!!
          // QUESTION name into [first half, second half]?
          // console.log("declared! -->", declaration);
          const fromStart = declaration.substring(found.nameStart)
          if (found.type === "tag") found.name = tag
          else if (found.type === "attribute") {
            found.name = /^([^=]\S*)=[\s\S]*>/.exec(fromStart)[1]
            found.attribute = found.name
          } else if (found.type === "value") {
            // QUESTION allow line breaks or tabs between values?!?!?
            found.name = /^([^" ]\S*)[" ][\s\S]*>/.exec(fromStart)[1]
            found.value = found.name
            // afterTrigger because we'll definitely have the whole attribute here
            const throughAttribute = afterTrigger.substring(0, attributeEndInclusive + 1)
            console.log(throughAttribute);
            const parts = throughAttribute.split(/\s/)
            // const regex = new RegExp("((?!<|\\s)\\S+)","g")
            // const parts = regex.exec(throughAttribute)
            // const parts = /(\S+)/g.exec(throughAttribute)
            found.attribute = parts[parts.length-1]
            console.log(parts.length, found.attribute, parts);
            // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" other="sdjf d" > and other stuff
          }
          // else if (found.type === "symbol") {}
          found.beforeCursor = afterTrigger.substring(found.nameStart)

          const data = {action:"editable", type:found.type}

          // TODO deal with cursor in equals --> CANNOT EDIT HERE & DELETE REMOVES WHOLE BLOCK
          if (found.illegalActions.any) {data.action = "undeletable"; return "red"}
          if (found.illegalActions.delete) {data.action = "uneditable"; return "tomato"}

          if (found.type === "tag") {return "orange"}

          // value (inside quotes)
          if (found.type === "value") return "white"
          // Find attribute to know what values are allowed

          // attribute (inside attribute name)
          if (found.type === "attribute") return "yellow"
          // Find tag to know what attributes are allowed

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
          // TODO how to convert from index to buffer position?!?!
          // block.location block.tag block.attribute
          // Tag value (important if type is tag or attribute)
          // Attribute value (important if type is value)

          // afterTrigger: "<some-tag-or-partial-tag maybeSomeAttributeOrAttributePartial>"
          // QUESTION can I even have a partial tag!?!?!!?? Have to be able to have partial tags r?
          // TODO Maybe can move through text by typing the text like with closing quotes but only through uneditable text...?!!?!?!!?!?

          // TODO boundary characters!!!!!!?!?
          // space, colon, semicolon, period?!?!, math operation, paren, open angle bracket?!?!!?

          // NOTE types in html: keyword, tag, attribute, value
        },
        ">": function(beforeTrigger, afterTrigger, afterCursor){
          // Looking for blocks to be inside an HTML element
          // We got all the text before the closing angle bracket, ">"
          const data = rdr.findTag(beforeTrigger)
          return "blue"
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
    // QUESTION Shouldn't there ALWAYS be something there?!?! At least in this particular case where we're in an element. But now we're abstracted!!!!
    // if (!matchGuaranteed && !match)
    return {rules: ruleSet, proximity: proximity, match: match}
  } // findRules

  // cursorPosition === index of the character before which the cursor appears
  locate(e, beforeCursor, afterCursor, cursorPosition, fileScope){
    // look at text surrounding cursor
    // discover language???!?!?
    // discover "context" (not window or w/e. instead what block we're in)
    // "'" starts a quotation block
    // If in uneditable return (keep track of previous cursor position and return curosor to that position but what if multiple cursors!??!?!)
    // uneditable can only be deleted and deletes whole block
    // TODO if event was keypress do different actions when analyzed (space is special etc)
    // QUESTION if event was selection then also different?!?!
    // QUESTION if event was paste then also diffrent?!!?!
    // TODO if deleting a block that is all selected then no confirmation needed
    // QUESTION if undoing is easy then why is confirmation ever needed?!?!??!

    // BRAINSTROM!!!!!!!
    // DO NOT PREVENT USER FROM TYPING THINGS IN
    // *DO* PREVENT USER FROM LEAVING INVALID CODE BEHIND

    // 1. assess previous token
    // 1b. if previous token invalid take measures
    // 2. assess location and current token
    // 3. provide matches for current token

    // Definitions
    // A "block" can be deleted by deleting certain symbols
    // A "part/atom" can be deleted without the "block" being deleted

    "<html sdf>leave it cleaner than you found it!</html>";
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
    let beforeFound = beforeCursor.substring(0,foundAt)
    let afterFound = beforeCursor.substring(foundAt)
    let color = finder(beforeFound, afterFound, afterCursor)
    // let rules = finder(beforeFound, afterFound, afterCursor)
    return color || "brick"
  }
}

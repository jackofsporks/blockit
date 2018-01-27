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

          // Is tag, attribute, or value

          // is it a tag?
          const hasNoSpacesBefore = /\s/.exec(afterTrigger) === null
          // If at end of tag then
          // if (next character is space or ">") pulse the html && html attribute tabs
          // (else) If at middle or beginning of tag show tag options then replace whole tag
          if (hasNoSpacesBefore) return "orange";

          // TODO in js must have semicolon before expression like regexp expression

          // TODO wat pwrs do MODS have?!!? Can they destroy their maker?!?!!?

          // TODO need to know if we're at the end of the tag!!! If not then if non-tag key is pressed (attribute key only) get to end of tag first before inserting attribute!!!
          // TODO if insert attribute and no space to the left then add space to the left

          // Now let's start taking this bad boy apart...
          const allAfterTrigger = afterTrigger + afterCursor

          // Important to know what tag we're in!!!
          // MUST HAVE A MATCH!!!
          const parts = /^<(\w+[-]?\w*[^ ]{1,})(.*)>/.exec(allAfterTrigger)
          // console.log(parts)
          const tag = parts[1];
          // console.log(tag, tag.length);

          // all: <some-tag-or-partial-tag maybeSom|eAttributeOrAttributePartial="n" other="sdjf d" > and other stuff
          // trigger: <some-tag-or-partial-tag maybeSom|
          // cursor: eAttributeOrAttributePartial other=""> and other stuff

          // TODO leave default value behind?!?!!?

          // cases (_ === space)
          // 2nd attribute and value
          // ...="...n"_
          // ...="...n"
          // ...="..._n
          // ...="
          // ...=
          // ...="...n"_n
          // back to top
          // 1st attribute & value
          // 5 the same
          // _n
          // _

          const withoutTag = afterTrigger.substring(tag.length-1)

          // trigger.length
          const found = {}
          for (let ii = withoutTag.length-1; ii >= 0; ii--) {
            found.index = ii+1
            let character = withoutTag[ii]
            // if (character === " ") {
            //   // in attribute or value!!!
            //   found.spaceFirst = true
            // }
            if (character === "=") {
              found.uneditable = true
              found.undeleteable = true
              break
            } else if (character === "\"") {
              found.quote = true
              if (ii === withoutTag.length-1) found.undeleteable = true
              else if (withoutTag[ii-1] === "=") found.isValue = true
              break
            }
          }

          // TODO deal with cursor in equals --> CANNOT EDIT HERE & DELETE REMOVES WHOLE BLOCK
          if (found.uneditable) return "red"
          if (found.undeleteable) return "tomato"

          // value (inside quotes)
          if (found.isValue) return "white"
          // Find attribute to know what values are allowed

          // attribute (inside attribute name)
          return "yellow"
          // Find tag to know what attributes are allowed

          // Notes
          // Different kinds of categories
          // Action categories
          // - editable (editing allowed, deleting is normal)
          // - undeleteable (editing allowed, delete deletes whole block)
          // - uneditable (editing prevented, delete deletes whole block)
          // Location categories
          // - tag
          // - attributes
          // - value
          // - start
          // - middle
          // - end

          // Situation Critical
          // afterTrigger: "<some-tag-or-partial-tag maybeSomeAttributeOrAttributePartial>"
          // All before the cursor
          // QUESTION can I even have a partial tag!?!?!!??
          // 1) after space
          //  a) in quotes
          //  b) not in quotes
          // 2) after a dash
          //  a) in quotes (new classname or id name?)
          //  b) not in quotes
          //    i) in custom tag name right after open angle bracket
          //    ii) in custom attribute name (maybe new custom one?!?!)
          // 3) just after the opened angle bracket or in the tagname

          // TODO Maybe can move through text by typing the text like with closing quotes but only through uneditable text...?!!?!?!!?!?

          // 1) in quotes (value) (how to find opening quote?!?!?! scope descriptor???)
          //    (find all quotes up until this quote and counting if even or odd)
          //  a) after space (new value)
          //    i) offer all valid values (no duplicates?) (in osk)
          //  b) not after space (editing value)
          //    i) offer completions (in osk)
          // 2) not in quotes
          //  a) right after angle bracket (need new tag)
          //  b) in word after angle bracket (editing tag)
          //  c) right after space (need to start attribute name)
          //  d) in word after space (editing attribute name)

          // # Within an opening tag
          // ## actions
          // > creating new vs. editing
          //  >> determine new
          //    >>> if tag then just next to "<" === new
          //    >>> if not tag after space === new (quote or not quote both work. anywhere other than tag)
          //    >>> if not tag after quote === new
          //    >>> if in style tag
          //      >>>> after colon === new
          //      >>>> after semicolon === new
          //      >>>> after paren === new
          //      >>>> after math operation === new
          //  >> otherwise editing??!?!? so find previous up to...
          //    >>> space, colon, semicolon, period???!??, math operation, paren

          // ## side-note
          // boundary characters!!!!!!
          // space, colon, semicolon, period?!?!, math operation, paren, "<"?!?!!?

          // ## types
          // > html: keyword, tag, attribute, value
          //  >> keyword --> lists of keywords/symbols (scope descriptors?!?!)
          //  >> tag --> after "<" but before a space (.*[^ ])
          //  >> attribute --> "<" after a space but just before "=" without quote after "="
          //  >> value --> inside quote

          // Maybe we need to do vvvv
          // Find closest left boundry character
          // Return boundry character and...?!!? characters between character and cursor location

          // case 1: "customizable part of attribute"
          // TODO search for (moving backwards) a - + "data"/"aria"/...? + space
          // case 2: "after other attribute value or tag or" (never leave an attribute without the quotes for a value)
          // TODO see if there's a space. if so, stop there
          // case 3: "next to or in a tag"
          // TODO see if there's a <. if so, stop there (multiple cases...??!??!)

          // case2
          let data = rdr.findRules(afterTrigger," ", /\s(\w+[-]?\w*)/, {"class":{}}, false)
          if (data.proximity === null) {
            // case 3
            // data = rdr.findRules(afterTrigger,"<",/<(\w+[-]?\w*)/,)
          }

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

    // BRAINSTROM!!!!!!!
    // DO NOT PREVENT USER FROM TYPING THINGS IN
    // *DO* PREVENT USER FROM LEAVING INVALID CODE BEHIND

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
    return color || "black"
  }
}

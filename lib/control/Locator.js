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
          const hasNoSpaces = /\s/.exec(afterTrigger) === null
          // prevent edit?!?!!?... put cursor at the end of the tag name and insert a space to the left of the cursor?!!?!?!?
          // show an attribute option
          // but then if nothing is added and the cursor is moved elsewhere remove the space!?!?!? (global variable...?!?!?)
          if (hasNoSpaces) return "red"

          // Just before ">" (after last value)
          // If not space to left add space to left of cursor
          // otherwise offer attribute
          if (/>/.exec(afterCursor) === null) return "yellow";

          // Attribute
          // find tag to know what is allowed
          /[^"].*?(=")/.exec(afterCursor)

          // value
          // find attribute to know what is allowed


          return "white"


          // Situation Critical
          // afterTrigger: "<some-tag-or-partial-tag maybeSomeAttributeOrAttributePartial"
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
    for (let ii = text.length - 1; ii >= 0; ii--) {
      let char = text[ii]
      if (char === stopper) {
        // Get the text from stopper and onwards
        let toSearchIn = text.substring(ii)
        // Find what we want in there
        let matches = regex.exec(toSearchIn)
        if (matches) {
          let match = matches[1]
          ruleSet = rules[match]
          proximity = ((text.length - 1) - ii)
        }
        break
      }
    }
    // QUESTION Shouldn't there ALWAYS be something there?!?! At least in this particular case where we're in an element. But now we're abstracted!!!!
    // if (!matchGuaranteed && !match)
    return {rules: ruleSet, proximity: proximity}
  } // findRules

  // cursorPosition === index of the character before which the cursor appears
  locate(e, beforeCursor, afterCursor, cursorPosition, fileScope){
    // look at text surrounding cursor
    // discover language???!?!?
    // discover "context" (not window or w/e. instead what block we're in)
    // "'" starts a quotation block
    // If in uneditable return (keep track of previous cursor position and return curosor to that position but what if multiple cursors!??!?!)

    "<html sdf>some text and stuff and thangs plus fridge</html>";
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

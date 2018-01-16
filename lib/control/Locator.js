"use babel"

import {CompositeDisposable, Disposable} from "atom"
import {html} from "../data/html-main"

export default class Renderer {

  constructor(serializedState, manager) {
    const rdr = this
    rdr.manager = manager
    rdr.language = null
    rdr.finders = {
      "html": {
        "\"": function(beforeTrigger, afterTrigger){
          // search text before to find property
          // return object belonging to property
          return null
        },
        "<": function(beforeTrigger, afterTrigger){
          // Looking for blocks to be inside an HTML tag (starting or ending...???)
          // Let's assume starting for now
          // TODO deal with ending tag and how to never ever be able to touch that

          // Situation Critical
          // afterTrigger: "<some-tag-or-partial-tag maybeSomeAttributeOrAttributePartial"
          // All before the cursor
          // QUESTION can I even have a partial tag!?!?!!??
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
        ">": function(beforeTrigger, afterTrigger){
          // Looking for blocks to be inside an HTML element
          // We got all the text before the closing angle bracket, ">"
          const data = rdr.findRules(beforeTrigger, "<", /<(\w+[-]?\w*)/, html, true)
          return data.rules
        } // >
      } // html
    } // finders
  }

  findRules(text, stopper, regex, rules, matchGuaranteed){
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
  locate(e, textBefore, textAfter, cursorPosition, fileScope){
    // look at text surrounding cursor
    // discover language???!?!?
    // discover "context" (not window or w/e. instead what block we're in)
    // "'" starts a quotation block
    "<html>some text and stuff and thangs plus fridge</html>";
    let trigger = null // the character that identifies the container of this block
    let finder = null // the function that will get us the rules that apply to this block
    let foundAt = null // the index at which the trigger is found
    for (let ii = textBefore.length - 1; ii >= 0; ii--) {
      trigger = textBefore[ii]
      finder = this.finders[fileScope][trigger]
      foundAt = ii
      if (finder) {break}
    }
    // If no matches were found (might happen at the very start)
    if (!finder) return null
    // We can assume there is an ender to this starter because we rock (also we have TOTAL CONTROL of the code)
    let beforeFound = textBefore.substring(0,foundAt)
    let afterFound = textBefore.substring(foundAt)
    let rules = finder(beforeFound, afterFound)
    // console.log(rules);
  }
}

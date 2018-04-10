"use babel";

import {CompositeDisposable, Disposable} from "atom"
import {html} from "../data/html-main"
import HTMLBlocks from "../langs/html/blocks"
import Block from "./block-parts"

/*
* Manages undo history
* Handles the buffer
* Triggers language functions
* Who handles finding matches for autcompleting?
*/
export default class Locator {

  constructor (serializedState, bufferChanger, manager) {
    const lctr = this
    lctr.manager = manager
    lctr.bufferChanger = bufferChanger
    lctr.language = null
    lctr.followUp = this.followUpDefault
    // QUESTION what if its a whole word not just a character... id:40 gh:46 ic:gh
    lctr.builders = { // boundries????!?!? that are finding rules. rule finders by boundry characters
      html: new HTMLBlocks()
    } // builders
  }

  getBlock (e, beforeCursor, afterCursor, fileScope, previousBlock) {
    let trigger = null // the character that identifies the container of this block
    let foundAt = null // the index at which the trigger is found
    for (let ii = beforeCursor.length - 1; ii >= 0; ii--) {
      trigger = beforeCursor[ii]
      foundAt = ii
    }
    // We can assume there is an ender to this starter because we rock (also we have TOTAL CONTROL of the code)
    const beforeFound = beforeCursor.substring(0,foundAt)
    const afterFound = beforeCursor.substring(foundAt)
    const build = this.builders[fileScope].getBuild(trigger) // the function that will build the block
    // If no matches were found (might happen at the very start) <-- y?
    if (!build) return null
    const newBlock = new Block()
    const data = build(newBlock, beforeFound, afterFound, afterCursor)
    return data
  }

  deleteBlock(e, previousBlock){
    this.followUp = this.getBlock
    // remove text (TODO and any extra whitespace)
    let start = previousBlock.startIndex || 0
    if (start > 0) start = start - 1 // primitive getting rid of white space
    const location = {start: start || 0, end: previousBlock.endIndex || 0}
    const locator = this
    // Return deletion first before moving!!!!
    setTimeout(function(){locator.bufferChanger.deleteIndexRange(location, e.oldText)},0)
    // wait for editor to update
    // #move# with new cursor position
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

  // BUG doesn't register move when go to new editor. WHY!?!?!! id:71 gh:77 ic:gh
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
    let newBlock = null
    newBlock = this.getBlock(e, beforeCursor, afterCursor, fileScope, previousBlock)
    // const reaction = previousBlock.leaveReaction(e, beforeCursor, afterCursor, fileScope, previousBlock)
    // if (reaction.cancel) this.cancelAction(e) // what does a cursor move event look like??
    // else newBlock = this.getBlock(e, beforeCursor, afterCursor, fileScope, previousBlock)
    return newBlock || previousBlock
  }

  /*Basically undo the action but it includes cursor movement*/
  cancelAction (e) {
    return "fridge"
  }

  domEvent = (e, beforeCursor, afterCursor, fileScope, previousBlock) => {
    // if prevent deletion then there will be no follow-up buffer event to hook into
    if (e.key === "Backspace" || e.key === "Delete") this.deleting = true;
    return {color:"lightgreen",block:previousBlock}
  }
  noChange = (e, beforeCursor, afterCursor, fileScope, previousBlock) => {
    return {color:"darkgreen",block:previousBlock}
  }

  deleteMany(e, beforeCursor, afterCursor, fileScope, previousBlock){
    // Procedures don't deal with deleting non-matching siblings or children
    // Block Procedure
    // 1. selection start is in start, middle, or end of block? --> yes
    // 1a. add this block to be deleted
    // 1b1. (should be #1? no, but something similar) selection end is in start, left, middle, right, or end --> yes
    // result --> delete block
    // 1b2. selection end is in start, left, middle, right, or end --> no
    // 1b2a1. is end of selection past middle of parent? --> yes
    // 1b2a1a. is end of selection past end of parent? --> yes
    // result --> repeat 1b2a till get to 1b2a2 or 1b2a2b then do those
    // 1b2a1b. is end of selection past end of parent? --> no
    // result --> delete this parent and all its contents
    // 1b2a2. is end of selection past middle of parent? --> no
    // result --> loop through younger siblings till find end of selection. collect deletions. delete them all.
    // 2. selection start is in start, middle, or end of block? --> no
    // 2a. selection end is in the same area? --> yes
    // result --> allow selection to go on as usual. reassess block.
    // 2b. seleciton end is in the same area? --> no
    // 2b1. selection end is past the end? --> no
    // result --> delete block
    // 2b2. selection end is past the end? --> yes
    // result --> do 1b2a and onwards/inwards

    // Multi/Syntax Procedure (left + body + right)
    // if start in left
      // if end in left - normal
      // if end in body - delete
      // if end in right - delete
      // if end past right - go to parents (then if in to siblings then add to deletion list)
    // if start in body
      // if end in body - normal
      // if end in right - delete
      // if end past right - go to parents (then if in to siblings then add to deletion list)
    // if start in right
      // if end in right - normal
      // if end past right - go to parents (then if in to siblings then add to deletion list)

    // Unarmed Procedure (left + right + separators)
    this.deleting = false
    return {color: "black", block: previousBlock}
  }
  // QUESTION what happens if comma is deleted --> int x, y, z = 4, 5, 6 id:76 gh:82 ic:gh
  deleteOne(e, beforeCursor, afterCursor, fileScope, previousBlock){
    return previousBlock
    // // if deleted a block-deleter for this block then delete whole block + extra whitespace using... text postition converted to buffer position?!?!?! + #move#
    // // else permit and #id#
    // // QUESTION how to decide what white space to delete!?!?!?! id:45 gh:51 ic:gh
    // // TEMP if deleters. gotta have em. gotta love em. In future start, middle, end values/patterns
    // let isDeleter = false
    // let data = null
    // if (Boolean(previousBlock.deleters)) isDeleter = previousBlock.deleters.test(e.oldText)
    //   console.log("deleting one test -->", e.oldText, previousBlock.deleters, isDeleter, previousBlock);
    // if (isDeleter){
    //   console.log("if -->", e.oldText, previousBlock.deleters, isDeleter);
    //   data = this.deleteBlock(e, previousBlock)
    // } else {
    //   console.log(beforeCursor + afterCursor);
    //   data = this.getBlock(e, beforeCursor, afterCursor, fileScope, previousBlock)
    // }
    // // TODO update block pls id:17 gh:19 ic:gh
    // this.deleting = false
    // return data
  }
  insertMany(e, beforeCursor, afterCursor, fileScope, previousBlock){return {color: "black", block: {}}}
  insertOne(e, beforeCursor, afterCursor, fileScope, previousBlock){return this.getBlock(e, beforeCursor, afterCursor, fileScope, previousBlock)}
  replace(e, beforeCursor, afterCursor, fileScope, previousBlock){console.log("replace!!!");return {color: "black", block: {}}}
  special(e, beforeCursor, afterCursor, fileScope, previousBlock){console.log("special!!!");return {color: "black", block: {}}}

  delete(e, beforeCursor, afterCursor, fileScope, previousBlock){
    this.shouldFollowup = function(){return true}
    this.followUp = this.getBlock
    // const locations = previousBlock.whereDelete(e, beforeCursor, afterCursor) // selection?? multiple cursors??
    const data = [{location:{start: 0, end: 3}, deleted:""},{location:{start: 12, end: 13}, deleted:""},{location:{start: 15, end: 16}, deleted:""}]
    // if deleting stuff then undo previous deletion
    // otherwise let them delete what they want to!
    // or maybe whereDelete should return what just got deleted??
    if (data && data.length > 0) this.bufferChanger.editor.undo()
    const hiker = this
    // Return deletion first before moving!!!!
    setTimeout(()=>{hiker.bufferChanger.deleteIndexRange(data)},0)
    // wait for editor to update
    // #move# with new cursor position
    return {color: "green", block: new Block()}
  }

  shouldFollowup(){return false}
  shouldSkip(){return this.bufferChanger.changingSelf}

  isBufferStillChanging(){
    return this.bufferChanger.changingSelf
  }

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
    // QUESTION if event was selection then also different?!?! id:51 gh:57 ic:gh
    // QUESTION if event was paste then also diffrent?!!?! id:58 gh:64 ic:gh
    // TODO if deleting a block that is all selected then no confirmation needed id:6 gh:8 ic:gh
    // QUESTION if undoing is easy then why is confirmation ever needed?!?!??! id:70 gh:76 ic:gh
    // QUESTION if paste then confirm each character in order??!?! **nope** then can't paste blocks id:63 gh:69 ic:gh
    // QUESTION validate block on copy?!?! even if in other editor.... **nope** what if copy outside of atom?!?! id:64 gh:70 ic:gh

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
    // QUESTION what's an atom mini editor?!?! id:52 gh:58 ic:gh
    // if e.newText === nothing then it was undo
    // QUESTION what if move inside the same name/value/found item id:59 gh:65 ic:gh
    // TODO Only some kinds of tokens can remain empty strings when moving id:77 gh:84 ic:gh
    // QUESTION stop a selection when it gets into something that can't be deleted as when cursor is dragged or when text is tripple clicked? id:0 gh:2 ic:gh
    // QUESTION Include areas in which rules do not apply? id:83 gh:93 ic:gh

    if (this.shouldSkip()) return previousBlock

    if (this.shouldFollowup() && this.followUp) {
      this.shouldFollowup = function(){return false}
      const data = this.followUp(e, beforeCursor, afterCursor, fileScope, previousBlock)
      return data
    }

    let action = null
    if (e.eventType === "cursor") {
      action = "move"
      // ignore a move right after delete because I don't like atom and because will show message we don't want in some instances
      if (this.deleting) {return {color: "lightgreen",block:previousBlock}} // If we're deleting then pretend this never happened. almost....
    } else if (e.eventType === "edit") {
      let newEmpty = e.newText.length === 0
      let oldEmpty = e.oldText.length === 0
      if (newEmpty && oldEmpty) action = "noChange"
      else if (newEmpty) action = "delete" // Does not tell us if it deleted to the right or the left... :( :( :(
      else if (oldEmpty) {
        if (e.newText.length > 1) action = "insertMany"
        else action = "insertOne"
      } else if (!newEmpty && !oldEmpty) {
        // select + replace or autocomplete
        action = "replace"
      } else action = "special" // when does this happen!?!
    } else if (e.eventType === "dom") {
      // set up to ignore the first move after a delete so don't get weird messages
      if (e.type === "keydown") action = "domEvent"
    }
    console.log(action, e);
    const data = this[action](e, beforeCursor, afterCursor, fileScope, previousBlock)
    return data
  }
}

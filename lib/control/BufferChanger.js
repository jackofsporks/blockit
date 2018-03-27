"use babel"

import {CompositeDisposable, Disposable} from "atom"

export default class BufferChanger {
// Don't want to have to pass in a buffer. This is always the active buffer

  constructor() {
    this.changingSelf = false
  }

  update(newEditor){
    this.editor = newEditor
    if (newEditor) this.buffer = newEditor.buffer
    else this.buffer = null
    return this
  }
  startChange(){this.changingSelf = true;return this}
  endChange(){this.changingSelf = false;return this}

  deleteRange(range, buffer){
    if (!buffer) {
      if (!this.editor) {console.log("WAHT NO EDITOR?!?!"); return null}
      buffer = this.editor.buffer
    }
    this.startChange()
    // delete buffer range
    const deleteResult = buffer.delete(range)
    // QUESTION does the delete function return a promise!??! NO IT DOES NOT id:37 gh:43 ic:gh
    // TODO Move cursor to start of range id:7 gh:9 ic:gh
  }

  deleteIndexRange(blockLocations, deletedText){
    if (!this.editor) {console.log("WAHT NO EDITOR?!?!"); return null}
    const buffer = this.editor.buffer

    for (let ii = 0; ii < blockLocations.length; ii++) {
      // QUESTION How will atom behave when there are multiple locations being deleted?
      // how will async stuff be going on?
      const location = blockLocations[ii]
      // convert index range to buffer range
      const range = {
        start: buffer.positionForCharacterIndex(location.start),
        // because one of the characters has just been deleted!!! have to subtract 1 <-- huh?
        end: buffer.positionForCharacterIndex(location.end - deletedText.length)
      }
      // DELETE IT ALLLLLLLLL
      this.deleteRange(range, buffer)
    }
    return this
  }
}

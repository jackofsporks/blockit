"use babel"

import {CompositeDisposable, Disposable} from "atom"

export default class BufferChanger {
// Don't want to have to pass in a buffer. This is always the active buffer

  constructor() {}

  update(newEditor){
    this.editor = newEditor
    return this
  }

  async deleteRange(range, buffer){
    if (!buffer) {
      if (!this.editor) {console.log("WAHT NO EDITOR?!?!"); return null}
      buffer = this.editor.buffer
    }
    // delete buffer range
    const deleteResult = await buffer.delete(range)
    // QUESTION does the delete function return a promise!??! NO IT DOES NOT
    console.log("deleteResult -->",deleteResult);
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // Move cursor to start of range
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  }

  async deleteIndexRange(blockLocation){
    if (!this.editor) {console.log("WAHT NO EDITOR?!?!"); return null}
    const buffer = this.editor.buffer
    // convert index range to buffer range
    const range = {
      start: buffer.positionForCharacterIndex(blockLocation.start),
      end: buffer.positionForCharacterIndex(blockLocation.end)
    }
    // DELETE IT ALLLLLLLLL
    return await this.deleteRange(range, buffer)
  }
}

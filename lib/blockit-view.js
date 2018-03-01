"use babel"

import {CompositeDisposable, Disposable, Range, Point} from "atom"
import Renderer from "./control/Renderer.js"
import Locator from "./control/Locator.js"
import BufferChanger from "./control/BufferChanger.js"

export default class BlockitView {

  constructor(serializedState) {
    this.renderer = new Renderer()
    this.bufferChanger = new BufferChanger()
    this.locator = new Locator(serializedState, this.bufferChanger, this)
    // Create root element
    this.element = document.createElement("div")
    this.element.classList.add("blockit")

    // Create message element
    const pasteHTML = document.createElement("button")
    pasteHTML.textContent = "<html>"
    pasteHTML.classList.add("insert")
    this.element.appendChild(pasteHTML)
    this.buttons = {}
    this.buttons.html = pasteHTML
    // editor and subscriptions in toggle
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    // TODO don't destroy every time just destroy subscriptions and resubscribe on toggle
    console.log("destroyer of worlds!!!");
    this.subscriptions.dispose()
    this.element.remove()
  }

  toggle(activating){
    if (activating) {
      this.getElement().style.display = "flex"
      this.refresh()
    } else {
      this.subscriptions.dispose()
      this.getElement().style.display = "none"
    }
  }

  getElement() {
    return this.element
  }

  insertHTML = async (e, type) => {
    e.eventType = type || "dom"
    const ed = this.editor
    const bufferPosition = ed.getCursorBufferPosition()
    const scope = ed.scopeDescriptorForBufferPosition(bufferPosition)
    let text = ed.getText()
    let rangeBefore = new Range(new Point(0, 0), bufferPosition)
    let before = ed.getTextInBufferRange(rangeBefore)
    let lastLineIndex = ed.getLastBufferRow()
    let lastRowText = ed.lineTextForBufferRow(lastLineIndex)
    let textLength = lastRowText.length
    let rangeAfter = new Range(bufferPosition, new Point(lastLineIndex, textLength))
    let after = ed.getTextInBufferRange(rangeAfter)
    // scope hardcoded for now
    console.log("e -->",e);
    const data = await this.locator.locate(e, before, after, "html", this.previousBlock)
    console.log("result -->", data.color, data.block);
    this.element.style.background = data.color
    this.previousBlock = data.block
    // this.renderer.insert(this.editor, scope, "html")
  }

  subscribe (editor) {
    let subs = new CompositeDisposable()
    subs.add(editor.buffer.onDidChange((e) => {
      this.insertHTML(e, "edit")
    }))
    subs.add(editor.onDidChangeCursorPosition((e) => {
      // halp!!! called on buffer change!!!
      if (!e.textChanged) this.insertHTML(e, "cursor")
    }))
    // To detect delete keydown
    let rdr = this
    document.body.addEventListener("keydown", this.insertHTML)
    const keydown = new Disposable(function(){document.body.removeEventListener("keydown", rdr.insertHTML)})
    subs.add(keydown)

    // set up next editor change
    subs.add(atom.workspace.onDidChangeActiveTextEditor((editor) => {
      // for going to settings or something like that
      if (!editor) {
        this.editor = null
        this.toggle(false) // hide this thing
        // placeholder since toggling the whole thing would be a pain and maybe not appropriate
        // all toggling stuff should be in this object anyway
      } else {
        this.editor = editor
        this.toggle(true) // this refreshes
      }
    }))
    this.subscriptions = subs
    return this
  }

  refresh(){
    if (this.subscriptions) this.subscriptions.dispose()
    if (!this.editor) this.editor = atom.workspace.getActiveTextEditor()
    this.subscribe(this.editor)
    this.bufferChanger.update(this.editor)
    return this
  } // subscribe
}

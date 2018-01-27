"use babel"

import {CompositeDisposable, Disposable, Range, Point} from "atom"
import Renderer from "./control/Renderer.js"
import Locator from "./control/Locator.js"

export default class BlockitView {

  constructor(serializedState) {
    this.renderer = new Renderer("fridge")
    this.locator = new Locator()
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

    this.editor = atom.workspace.getActiveTextEditor()
    this.subscriptions = this.subscribe()
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

  // toggle(activating){
  //   if (activating) this.subscriptions = this.subscribe()
  //   else this.subscriptions.dispose()
  // }

  getElement() {
    return this.element
  }

  insertHTML = (e) => {
    const ed = this.editor = atom.workspace.getActiveTextEditor()
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
    const color = this.locator.locate(e, before, after, bufferPosition, "html")
    this.element.style.background = color
    // this.renderer.insert(this.editor, scope, "html")
  }

  subscribe(){
    subs = new CompositeDisposable()
    document.body.addEventListener("click", this.insertHTML)
    const disHTML = new Disposable(() => {document.body.removeEventListener("click", this.insertHTML)})
    subs.add(disHTML)
    subs.add(atom.workspace.onDidChangeActiveTextEditor(function(editor){
      this.editor = editor
    }))
    return subs
  }
}

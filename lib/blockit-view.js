"use babel"

import {CompositeDisposable, Disposable} from "atom"
import Renderer from "./control/Renderer.js"

export default class BlockitView {

  constructor(serializedState) {
    this.renderer = new Renderer("fridge")
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
    this.element.remove()
  }

  getElement() {
    return this.element
  }

  getTitle() {
    // Used by Atom for tab text
    return "Block It"
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return "atom://blockit"
  }

  insertHTML = () => {
    const bufferPosition = this.editor.getCursorBufferPosition()
    const scope = this.editor.scopeDescriptorForBufferPosition(bufferPosition)
    this.renderer.insert(this.editor, scope, "html")
  }

  subscribe(){
    subs = new CompositeDisposable()
    this.buttons.html.addEventListener("click", this.insertHTML)
    const disHTML = new Disposable(() => {this.buttons.html.removeEventListener("click", this.insertHTML)})
    subs.add(disHTML)
    subs.add(atom.workspace.onDidChangeActiveTextEditor(function(editor){
      this.editor = editor
    }))
    return subs
  }
}

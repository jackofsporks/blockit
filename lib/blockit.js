"use babel"

import BlockitView from "./blockit-view";
import {CompositeDisposable} from "atom";

export default {

  blockitView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.state = state
    this.firstTime = true
    this.blockitViewState = state.blockitViewState
    this.blockitView = new BlockitView(state.blockitViewState)
    this.element = this.blockitView.getElement()
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'blockit:toggle': () => this.toggle()
    }));
  },

  reallyActivate(state) {
    this.panel = atom.views.getView(atom.workspace.panelContainers.bottom)
    this.panel.appendChild(this.element)
  },

  deactivate() {
    this.subscriptions.dispose();
    this.blockitView.destroy();
  },

  serialize () {
    return {
      blockitViewState: this.blockitView.serialize()
    };
  },

  toggle () {
    if (this.firstTime) {
      this.firstTime = false
      this.reallyActivate(this.state)
    }
    if (this.element.style.display === "flex") {
      this.blockitView.toggle(false)
      return "none"
    } else {
      this.blockitView.toggle(true)
      return "flex"
    }
  },

  // In future a language will have an actual interface
  // required functions: getChildren
  addLanguage (service) {
    return this.blockitView.addLanguage(service.name, service.functionality)
  }

};

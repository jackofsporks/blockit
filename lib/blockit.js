"use babel"

// import BlockitView from "./blockit-view"
// import {CompositeDisposable, Disposable} from "atom"
//
// export default {
//
//   blockitView: null,
//   modalPanel: null,
//   subscriptions: null,
//
//   activate(state) {
//
//     this.blockitView = new BlockitView(state.blockitViewState);
//     this.modalPanel = atom.workspace.addModalPanel({
//       item: this.blockitView.getElement(),
//       visible: false
//     });
//
//     // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
//     this.subscriptions = new CompositeDisposable();
//
//     // Register command that toggles this view
//     this.subscriptions.add(atom.commands.add('atom-workspace', {
//       'blockit:toggle': () => this.toggle()
//     }));
//
//
//     // this.subscriptions = new CompositeDisposable(
//     //   // Add an opener for our view.
//     //   atom.workspace.addOpener(uri => {
//     //     if (uri === "atom://blockit") {
//     //       return new BlockitView()
//     //     }
//     //   }),
//     //
//     //   // Register command that toggles this view
//     //   atom.commands.add("atom-workspace", {
//     //     "blockit:toggle": () => this.toggle()
//     //   }),
//     //
//     //   // Destroy any BlockitViews when the package is deactivated.
//     //   new Disposable(() => {
//     //     atom.workspace.getPaneItems().forEach(item => {
//     //       if (item instanceof BlockitView) {
//     //         item.destroy()
//     //       }
//     //     });
//     //   })
//     // );
//   },
//
//   deactivate() {
//     this.modalPanel.destroy();
//     this.subscriptions.dispose();
//     this.blockitView.destroy();
//   },
//
//   serialize() {
//     return {
//       blockitViewState: this.blockitView.serialize()
//     };
//   },
//
//   toggle() {
//     return (
//       this.modalPanel.isVisible() ?
//       this.modalPanel.hide() :
//       this.modalPanel.show()
//     );
//   }
//
// };


import BlockitView from "./blockit-view";
import { CompositeDisposable } from "atom";

export default {

  blockitView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.blockitViewState = state.blockitViewState
    this.blockitView = new BlockitView(state.blockitViewState)
    this.element = this.blockitView.getElement()
    this.panel = atom.views.getView(atom.workspace.panelContainers.bottom)
    this.panel.appendChild(this.element)

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'blockit:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.blockitView.destroy();
  },

  serialize() {
    return {
      blockitViewState: this.blockitView.serialize()
    };
  },

  toggle() {
    if (this.element.style.display === "flex") {
      this.element.style.display = "none"
      this.blockitView.destroy()
      return "none"
    } else {
      this.element.style.display = "flex"
      this.blockitView = new BlockitView(this.blockitViewState)
      return "flex"
    }
  }

};

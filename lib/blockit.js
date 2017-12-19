"use babel"

import BlockitView from "./blockit-view"
import {CompositeDisposable, Disposable} from "atom"

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === "atom://blockit") {
          return new BlockitView()
        }
      }),

      // Register command that toggles this view
      atom.commands.add("atom-workspace", {
        "blockit:toggle": () => this.toggle()
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof ActiveEditorInfoView) {
            item.destroy()
          }
        });
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  toggle() {
    atom.workspace.toggle("atom://blockit")
  }

};


// import BlockitView from './blockit-view';
// import { CompositeDisposable } from 'atom';
//
// export default {
//
//   blockitView: null,
//   modalPanel: null,
//   subscriptions: null,
//
//   activate(state) {
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
//     console.log('Blockit was toggled!');
//     return (
//       this.modalPanel.isVisible() ?
//       this.modalPanel.hide() :
//       this.modalPanel.show()
//     );
//   }
//
// };

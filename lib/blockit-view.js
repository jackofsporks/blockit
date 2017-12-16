"use babel";

export default class BlockitView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement("div");
    this.element.classList.add("blockit");

    // Create message element
    const message = document.createElement("div");
    message.textContent = "The Blockit package is Alive! It\'s ALIVE!";
    message.classList.add("message");
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return "Block It";
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return "atom://blockit";
  }

}

// <some-tag attribute1="value1 value2" attribute2>contents</some-tag>
//
// Definitions
// block: 1. a section of code/text that can be deleted as a group (has deleters)
// block: 2. a section of code/text whose behavior is determined by its left value?! (anchor??)
// block: 3. expression or declaration in a markup, styling, or programming language (controlled language?!)
// block: has a start, left, middle, right, end
// entities: block/phrase, multi, syntax, unarmed, token??
// multi: has start, body, end. can it have parts of different types??? No part determines the behavior of other parts? What about inpout's type attribute?!
// syntax: has start, body??, end <-- singular body + just manipulated by other stuff
// unarmed/internal/inside voice/contained/contents/innerds/guts: left + right + right + separators. follows 2 but not 1 or 3 rules of block.
// anchors + items + separators or entities + separators or left + entities + separators
// token: a word/name in two parts --> stuff around the cursor
// vvv Rules? vvv
// If it's editable then we need to know its indexes
let entity

// values --> multi
// attribute1="valu|e1 value2"
entity = {
  token: {
    parent: entity,
    type: "token",
    location: "parent.right.body.0.3",
    value: ["valu", "e1"], left: "valu", right: "e1"
    siblings: ["value2"]?? // Need to know siblings of entity. Example is input tag with type attribute of number then change value to type of address. Have to change other attributes maybe. Maybe just explore siblings if needed.
  },
  // ...
  right: {
    type: "multi",
    position: "right",
    body: ["value1", "value2"],
    // start: "\"", end: "\"", separator: /\s/ <-- need this?
    siblings...??
  },
  // ...
  siblings: [] // See notes in token siblings.
  // ...
}

// attribute --> block
// att|ribute1="value1 value2"
// The same thing... with differnt token position
entity = {
  parent: {"tag entity"},
  deleters: /[\s"=]/, // but whitespace in the right place. maybe a function instead.
  token: {
    parent: entity,
    type: "token",
    location: "parent.left.2", // of cursor
    value: ["att", "ribute"], left: "att", right: "ribute",
    siblings: ["attribute2"]??,
    edits: this.parent.left // don't need deletes:this.parent because it's assumed because its postion should be end
  },
  location:{start: 3, end: 28}
  start: /\s+/,
  left: "attribute",
  middle: /=\"/,
  right: {type: "multi"...}, // If change attribute then need to know values
  end: /\"/,
  // siblings: this.parent.children - this <-- use parent
  siblings: ["attribute2"]
}

// <ta|g attribute1="value1 value2">stoof<p>other stoof</p></targ>
// Has block props 2 but not 1 or 3 === unarmed entity?
// No deleters. Cannot be deleted as a unit.
entity = {
  start: "<",
  left: {
    type: ??,
    position: "left",
    start: "",
    left: "tag",
    middle: "",
    right: {start:/\s/, left:"attribute"...}
  },
  middle: ">",
  right: "stoof",
  end:{
    type: "syntax", position: "end",
    start: "</", left: "tag",
    middle: "", right: "",
    end: ">"
  }
}

entity = {
  parent: {"another tag entity"},
  isAnchor: false, // a block can't be an anchor. can a block have anchors instead??
  type: "block",
  deleters: /[<>{}]/, // start + middle + end...? Nopes can't do it for attributes with values. DO FUNCTION INSTEAD!
  token: { // NOTE Only current entity has a token id:80 gh:89 ic:gh
    parent: entity, // Just name of parent?
    type: "token",
    hierarchy: "parent.left.left.1", // Cursor position but why need this??
    value: ["ta", "g"], left: "ta", right: "g",
    siblings: [""], // No sibs for tags?? Repeats are ok so no need?? What about in a table when it matters which order the siblings come in?
    // siblings: [[older],[younger]]
    // siblings: {older:[], younger:[]}
    // For exporing up or down if needed. Then maybe don't need sibs and parent at start...? But really good to have access to them now... Maybe deeper access if needed.
    beforeCursor: "",
    afterCursor: "",
    edits: [parent.end.body.location], // don't need deletes:this.parent because it's assumed because its postion should be end
    // Index 0 is always self??
    // edits: ["parent.left.left","parent.end.body"], // don't need deletes:this.parent because it's assumed because its postion should be end
    // edits: [{start: 100, end: 112}]
  },
  location:{start: 0, end: 42},
  start: /</,
  left/anchor: {
    type: "unarmed",
    position: "left",
    parent: entity,
    // edits: "parent.end.body",
    separators: /\s/,
    left: "tag",
    right: {
      type: "multi",
      body: ["attribute1"] // Need more than strings??
    }
  },
  // leftModifier: {type: "multi", position:"leftModifier",},
  middle: />/,
  right/value/result: {type: "multi", body: [
    {type: "multi"??, name: "TextNode", location: {start: 5, end: 8}}, // body of words but don't need to know that
    // {type: "multi"??, species: "TextNode", body: ["stoof"]}, // body of words but don't need to know that
    {type: "block", name: "p", location: {start: 5, end: 8}} // NOTE location so when offereing to change tag name of entity then can highlight what will be deleted as invalid. id:81 gh:90 ic:gh
  ]}, // Everything as text or also direct children tag names? Multi?
  end:{
    type: "syntax", position: "end",
    start: "</", body: {value: "tag", location: {start: 100, end: 112}},
    end: ">",
    // edits: this.parent.left // don't need deletes:this.parent because it's assumed because its postion should be end
  },
  // siblings: this.parent.children - this <-- use parent
  siblings: [""] // older and younger sibs separate
}

// <some-tag jumbo="gumbo">and other stuff</some-tag>
// type --> "block"
// start --> "<"
// left --> "some-tag jumbo="gumbo""
//   type --> "unarmed"
//   left --> "some-tag"
//   right --> "jumbo="gumbo" attrb2="thing thing2""
//     type --> "multi" Nope because input's type attribute but is it unarmed??
//     body --> ["jumbo","attrb2"]
//   separators --> " "
// middle --> ">"
// right --> "and other stuff"
// end --> "</some-tag>"

// <ta|g attribute1="value1 value2">stoof<p>other stoof</p></tag>
entity = {
  parent: {"another tag entity"},
  type: "block",
  deleters: function(char){return true}, // start + middle + end...? Nopes can't do it for attributes with values. DO FUNCTION INSTEAD!
  token: { // NOTE Only current entity has a token id:80 gh:89 ic:gh
    parent: entity, // Just name of parent?
    type: "token",
    hierarchy: "", // "parent.left.left.1", // Cursor position but why need this??
    value: ["ta", "g"], left: "ta", right: "g",
    // siblings: [""], // No sibs for tags?? Repeats are ok so no need?? What about in a table when it matters which order the siblings come in?
    // siblings: [[older],[younger]],
    siblings: {older:[], younger:[]}, // token no siblings
    // For exporing up or down if needed. Then maybe don't need sibs and parent at start...? But really good to have access to them now... Maybe deeper access if needed.
    beforeCursor: "",
    afterCursor: "",
    edits: [],// [parent.end.body.location], // don't need deletes:this.parent because it's assumed because its postion should be end
    // Index 0 is always self??
    // edits: ["parent.left.left","parent.end.body"], // don't need deletes:this.parent because it's assumed because its postion should be end
    // edits: [{start: 100, end: 112}]
  },
  siblings: {older: ["tag", "tag"], younger: ["tag"]}, // block has siblings
  location:{start: 0, end: 42},
  start: /</,
  left/parent: {
    type: "block",
    position: "left",
    parent: entity,
    // edits: "parent.end.body", <-- it's on the token itself instead
    start: null, // or ""
    left: "tag",
    middle: null, // or ""
    right: {
      type: "multi",
      start: null,
      body: ["attribute1"], // Need more than strings??
      end: null
    },
    end: null
  },
  // leftModifier: {type: "multi", position:"leftModifier",},
  middle: />/,
  right/children: {type: "multi", body: [
    {type: "multi"??, name: "TextNode", location: {start: 5, end: 8}}, // body of words but don't need to know that
    // {type: "multi"??, species: "TextNode", body: ["stoof"]}, // body of words but don't need to know that
    {type: "block", name: "p", location: {start: 5, end: 8}} // NOTE location so when offereing to change tag name of entity then can highlight what will be deleted as invalid. id:81 gh:90 ic:gh
  ]}, // Everything as text or also direct children tag names? Multi?
  end:{
    type: "syntax", position: "end",
    start: "</", body: {value: "tag", location: {start: 100, end: 112}},
    end: ">",
    // edits: this.parent.left // don't need deletes:this.parent because it's assumed because its postion should be end
  },
  // siblings: this.parent.children - this <-- use parent
  siblings: [""] // older and younger sibs separate
}

// If select multiple entities and then delete
// Figure out first entity
// Figure out last entity
// Where those start and end delete all
// Check all entities in between?? ... probably yes
// Kills parent entity or siblings? Question is for all entities deleted.
// Example --> delete type attribute for input element then?
// Then make sure type is text? Delete all non-relevant sibling attributes?
// Confirm for deletion + add to deletion
// QUESTION When select entities then highlight dependent entities? id:82 gh:91 ic:gh

// If insert mutliple

// Replace = delete + insert

// Sometimes there are siblings
// Somtimes there's an anchor which affects the permitted values of other children and siblings
// Sometimes there are multiple anchors? (html input with type)
// Sometimes there's no anchors?? (x = 5)
// Cannot generalize??

// primitive --> token
// iterables --> sibling
// functions (declarations??) --> ??
// dictionaries --> block
// keywords (functions??) --> syntax??

// Characters that are undeletable without deleting the whole block...?? Nope?? Because instead have no middle!

// name stuff vvvv
// syntax + ui
// always valid code
// valid + armor + lock --> block lock

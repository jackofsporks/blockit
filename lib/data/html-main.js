"use babel"

// sgmljs.net/docs/w3c-html51-dtd.html

// the relationships between different
// items in html

// Props...?!?!?
// "mustContain"
// "includes"
// "excludes"
// "oneOf?"
// "anyOf?"
// "noneOf?"

const css = {}

const types = {
  "#PCDATA": "chars",
  "CDATA": "MIME content type, RFC1521?",
}

const attributes = {
  "class": {values:[types.CDATA]},
  "id": {values:[types["#PCDATA"]]}, // Not really #PCDATA, but doesn't say anything more useful!!!
  "title": {values:[types.CDATA]},
  "dir": {values:["ltr","rtl"]},
  "lang": {values:["RFC1766 language values"]}
}

const elementGroups = {}
  // >> Element tokens <<
  // special
elementGroups["special"] = {canContain:["a","bdo","br","img","object","map","q","span"]}
  // logical char styles
elementGroups["logicalStyles"] = {canContain:["abbr","acronym","cite","code","dfn","em","kbd","samp","strong","var"]}
  // logical char styles
elementGroups["physicalStyles"] = {canContain:["b","i","sub","sup","tt"]}
  // >> Model groups <<
elementGroups["block"] = {canContain:["blockquote","div","dl","fieldset","form","hr","ol","p","pre","table","ul"]}
elementGroups["formFields"] = {canContain:["button","input","label","select","textarea"]}
  // Character level
elementGroups["text"] = {canContain:[types["#PCDATA"],...elementGroups.physicalStyles.canContain,
  ...elementGroups.logicalStyles.canContain,...elementGroups.special.canContain,
  ...elementGroups.formFields.canContain
]}

const elementContentGroups = {
  "sectionContent": {
    min:1,max:Infinity,
    canContain: [...elementGroups.block.canContain,...elementGroups.text.canContain,"address"] // +
  },
  "tableContent": {
    min:1,max:Infinity,
    canContain: ["block","text"] // *
  }
}

const attributeGroups = {
  "core": ["class", "id", "title"],
  "i18n": ["dir", "lang"],
  "shape": ["circle","default","poly","rect"],
  "InputType": ["checkbox","file","hidden","password","radio","reset","submit","text"]
}

// Document structure
// ELEMENTS    MIN  CONTENT        (EXCEPTIONS)

const html = {
  html:{
    language:"html",
    name:"html",
    type:"tag",
    newLine:true,
    min:2,max:2,
    mustContain:["head","body"],
    canContain:["head","body"],
    attributes:attributeGroups.i18n
  },
  // ** >> Invisibles <<
  head:{
    name:"head",
    type:"tag",
    newLine:true,
    min:0, max:Infinity,
    mustContain:[],
    canContain:["title","link","meta","style"],
    attributes:[]
  },
  title:{
    name:"title",
    type:"tag",
    newLine:true,
    min:0, max:Infinity,
    mustContain:[],
    canContain:[types["#PCDATA"]],
    attributes:[]
  },
  link:{
    name:"link",
    type:"tag",
    newLine:false,
    min:0, max:Infinity,
    mustContain:[],
    canContain:[],
    attributes:[]
  },
  meta:{
    name:"meta",
    type:"tag",
    newLine:false,
    min:0, max:Infinity,
    mustContain:[],
    canContain:[],
    attributes:[]
  }, //????
  style:{
    name:"style",
    type:"tag",
    newLine:true,
    min:0, max:Infinity,
    mustContain:[],
    canContain:[css],
    attributes:[]
  },
  body:{
    name:"body",
    type:"tag",
    newLine:true,
    min:0, max:Infinity,
    mustContain:[],
    canContain:[...elementGroups.block.canContain,"h1","h2","h3","h4","h5","h6","del","ins"],
    attributes:[]
  },
  h1:{
    name:"h1",
    type:"tag",
    newLine:true,
    min:1,max:Infinity,
    mustContain:[],
    canContain:elementGroups.text.canContain,
    attributes:[]
  },
  h2:{
    name:"h2",
    type:"tag",
    newLine:true,
    min:1,max:Infinity,
    mustContain:[],
    canContain:elementGroups.text.canContain,
    attributes:[]
  },
  h3:{
    name:"h3",
    type:"tag",
    newLine:true,
    min:1,max:Infinity,
    mustContain:[],
    canContain:elementGroups.text.canContain,
    attributes:[]
  },
  h4:{
    name:"h4",
    type:"tag",
    newLine:true,
    min:1,max:Infinity,
    mustContain:[],
    canContain:elementGroups.text.canContain,
    attributes:[]
  },
  h5:{
    name:"h5",
    type:"tag",
    newLine:true,
    min:1,max:Infinity,
    mustContain:[],
    canContain:elementGroups.text.canContain,
    attributes:[]
  },
  h6:{
    name:"h6",
    type:"tag",
    newLine:true,
    min:1,max:Infinity,
    mustContain:[],
    canContain:elementGroups.text.canContain,
    attributes:[]
  },
  // div:elementContentGroups.sectionContent         - -  %section.content; >
  // address     - -  (%text;)+ -(img|object|map) >
  // p           - o  (%text;)+ >
  // (ol|ul)     - -  (li)+ >
  // li          - o  (%text; | %block;)+ >
  // dl          - -  (dt|dd)+ >
  // dt          - o  (%text;)+ >
  // dd          - o  %section.content; -(address) >
  // pre         - -  (%text;)+ -(img|map|object|sub|sup) >
  // blockquote  - -  (%block;)+ >
  // q           - -  (%text;)+ >
  // form        - -  (%block;)+ -(form) >
}

export {html}

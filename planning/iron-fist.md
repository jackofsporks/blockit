The Scholar vs. The Iron Fist

# Iron Fist
atom event --> me --> let it through or modify the event
html ast nodes
User starts with html doc with head and body
User moves cursor to inside the head tag
Move event is canceled because...

```js
// Assume this is everything
{
  name: "html", length: 2250,
  children: [
  {name: "html start tag", length: 40},
  {
    name: "head", length: 100,
    children: [{
      name: "title", length: 50
      children: [
        {type:"startTag", text:"title",length:5, edits:objRef or function}
        //... (length before is 38)
        {type: "text", text: "fridge", edits: null, length: 6}
        {type:"endTag", text:"title",length:5}
      ]
    }]
  },
  {
    name: "body", length: 2000
  }]
}
```

cursor: 80
operation
tracerPos = 0
start at 0 + first anything is "html"
"html" length + tracerPos > cursor position so go into children
"html start tag" length + tracerPos < cursorPosition so tracerPos += length (40)
"head" length + tracerPos > cursorPosition so go into children
"title" length + tracerPos > cursorPosition so go into children
other children length  + tracerPos < cursorPosition so tracerPos += length (40 + 38 = 78)
"text" length + tracerPos > cursorPosition but this is text so just split the text
--> cursor position is between text.text[1] ("fr") and text.text[2...] ("idge")

```js
{
  2250: "html",
  40: "html start tag",
  140: "head",
  90: "title"
  78: "a child of title"
}
```

interval tree data structure for selections etc. but updates would take longer?


Pasting from OUTSIDE
stackoverflow/autocomplete/other files
do we validate???!?!?!?!

1) Mark an area that has unvalidated text as an uncontrolled area. You paste it you buy it. I'm not going to track it you gotta take care of it yourself in there.
2) Use another parser/tokenizer to parse but not validate to keep the workload leaner. If errored then no paste.
3) Parse it in here

problem areas
(paste brackets???)

Pasting from inside
paste valid content into invalid position
same choices?
limit what can be copied to whole entities
know what the entity is so know where it fits


The Scholar vs. The Iron Fist
1) Always parser aka The Scholar
2) Control everything + object aka Iron Fist

1) Intercept events
2) Pasting problem

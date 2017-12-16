BRAINSTORM
- Don't
  . Rewrite whole file every time
- Identifying our files
  . Save sha sum, associate with serialized data of file??
  . On open read sha sum of file to tell if it's one of ours
  . On close save sha sum file as key?? for serialized object
  . When user starts a file they can id it as a controlled - by us >:) - file (face by userman2)
- Undoing
  . 1 Save SHA sums each time undone???
  . 2 Always assess current context on the fly
    * We assume the file is completely valid ALWAYS
    * Behavior
      + Scenario -- user is typing code
        o Check -- Look for surrounding code? or look at context?? to see what's allowed
        o don't allow anything that's not allowed (div in a tr)
      + Scenario -- user wants to type random text
        o Check --
          - In double quotes??? Unless escaping...
          - In backticks (name??)?? Unless escaping...
          - What about a single quotation mark???!!?!?
          - In something that can contain a text node element
        o let them type what they want
        o Option 2 -- prevent user from not escaping characters that need to be escaped
          - user identifies that they want to enter text node type format -->
            . user used single quotes (option in keyboard of which to use???) -->
              * user makes an apostophe or single quotes inside the quotations without identifying new text -->
                o 1 osk automatically escapes those but! in an html text node the escapement will show up
                o 2 osk automatically escapes in a context appropriate way ()
      + Scenario -- user wants to type text for partial code (an opening tag, but not a closing one). What to do?!?!?!
        o ..........
        o ..........
      + Scenario -- user wants to type text nodes that are valid html/w/e. What to do?!?!?!
        o Example user is typing string of html in js
        o Problem --
          - it's text so we don't want to prevent the user from putting in stuff they want to put in but
          - if they're trying to type valid html then we DO want to prevent invalid input
        o Option 1 --
          - if user is in a text-optional situation provide option for insertion that is either text or valid code
          - if they choose text then represent the carrots with unicode representations of carrots
          - if they choose code then keep it actual carrots and follow rules
          - NOW WE CAN ALWAYS CHECK FOR CARROTS
      + Scenario -- user wants to type html brainstorms into js just shootin' the breeze
        o ..........
        o ..........
    * Need
      + list of characters to escape and what to replace them with
    * Code
      + find the scope (our own scope - search for opening and closing tags or whatever)
        o 1. do not allow unescaped scope specific characters...???? FOR NO SCOPES. OR keep track of scopes in a serializeable way
          - Should the text (ABC) keyboard have code keyword/syntax options?
        o 2. look forward until find something on a list.
        o 3. based on what it is
          - figure out what we need to find and look back for it??!?!
          - or decide on our scope. fall back on document scope.
        o alt 2. Find first scope
        o alt 3. Work in to find current scope
        o alt 4. Always make sure to find scope closers
        o QUESTION - "<span></span>" delete spans and then undo
          - Keep track of SHA sums of undos/dones
          - When undoes and that operation was an osk scope changer...
          - MAYBE TEXT IS JUST TEXT FOR NOW

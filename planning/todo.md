# Blockit

## Continue

### Research
- Add own scopes?!?!?

### Structure
"<" opening tag opening bracket
"html" tagName
*** maybe a space
*** maybe an attribute object stuff
"/" maybe a self-closing slash
">" opening tag closing bracket
*** --- contents ----
"<" closing tag start bracket
"html" tagName
"/>" closing tag closing slash and bracket

### TODO
- Buttons to insert
- Insert text
- Color things purty
- Analyze surroundings
- Only allow full token selection, not deleting parts of token
- Prevent illegal contents
- Multi-cursor craziness???
- Identify our filezzz
  - File SHA sum?
  - Comment at top of file?
  - File extension? (ends in k?) jsk/htmlk/cssk/lessk/txtk? v? jsv/htmlv/cssv/lessv/jsxv/txtv
- Drag around blocks
- Draggable from board here? Or only when integrating with OSK?

### Behavior

#### Deleting
Tags. Can't delete part of a token only all of it.
- Options
  1. Get end and start tag and delete. un-indent contents (only if container is valid container for contents???!!??!)
  2. get everything between start and end tag and delete all
- Questions
  1. If delete language container
    - do contents retain the language?!??!
    - do contents become user controlled/uncontrolled???!?
    - delete everything in language container
Double tap?!? Double delete key to actually delete tag. First delete highlights everything that will be deleted. Second one actually deletes the stuff. Can be turned off in options so it only requires one delete.

#### New line
Around containers.
- Deleting. Options
  1. Delete with container
  2. Delete new line at start with container
  3. Collapse new lines (only add them if they're not already there)

User controlled. Options
1. How?

#### Adjusting
- dropdown to change to a different tag. Questions
  - How to deal with new invalid tags? Prevent changing till tags are made valid? but what if those tags contain tags that will be made invalid. Highlight everything invalid that will be deleted??!!?

#### User controls
Freeform typing area/type of block

#### Dragging

## Start
1. √ Brainstorm
2. √ New project
3. Transfer notes
4. Code

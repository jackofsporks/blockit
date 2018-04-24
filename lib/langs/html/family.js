"use babel"

export default getChildrenTags = function(parentTag){
  switch (parentTag) {
    case "html": return ["head","body"]
    case "head": return ["meta","title","script","style","link"]
    case "body": return ["div","section","h1","menu","p","span","table"]
    case "span": return ["b","i","em","strong","ins"]
    case "table": return ["theader","tfooter","td","tr","tbody"]
    case "tag": return [""]
    default: return []
  }
}

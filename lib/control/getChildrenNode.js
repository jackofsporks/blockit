"use babel"

import getChildrenTags from '../langs/html/family'

export default getChildrenNode = function (language, parent) {
  let children = null
  switch (language){
    case "html": {chidren = getChildrenTags(parent); break;}
    default: chidren = []
  }

  let childrenStr = children.join("|")
  return childrenStr
}

/**
 * Parse the tags out from the text description, rn just words ending with ';'
 * or starting with '#'. TODO NLP, reuse snugghash/ephemeron perhaps
 * TODO combine the both this and fn from App.js into utilities
 * TODO code between the two has diverged
 */
export function getTags(description) {
  const removeEdgeDoubleQuotes = function(description) {
    let newDesc = description;
    if(description.slice(0,1) == "\"") {
      newDesc = newDesc.slice(1);
    }
    if(description.slice(-1) == "\"") {
      newDesc = newDesc.slice(0,-1);
    }
    return newDesc;
  }
  if(description == undefined || description.length == 0) {
    return [];
  }
  description = removeEdgeDoubleQuotes(description);
  let endTags = description.split(" ").filter(function (word) {
    return word.slice(-1) === ";";
  }).map(function (word) {
    // TODO should we remove this?
    if(word[0] == '"') {
      return word.slice(1,-1);
    }
    return word.slice(0, -1);
  });
  let startTags = description.split(" ").filter(function (word) {
    return word.charAt(0) === "#";
  }).map(function (word) {
    return word.slice(1);
  });
  // console.log(new Set([...endTags], [...startTags])); // TODO convert to test
  return [...new Set([...endTags], [...startTags])]
};

export default getTags;

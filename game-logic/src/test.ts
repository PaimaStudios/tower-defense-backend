import { annotateMap, setPath } from "./map-processor.js"

const testmap = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 2, 6, 6, 6, 2, 6, 6, 6, 2,
  1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 2, 6, 2, 6, 2, 6, 2, 6, 2,
  1, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 6, 6, 2, 6, 6, 6, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 2, 6, 6, 6, 2, 2, 2, 6, 2,
  3, 5, 5, 5, 5, 1, 1, 5, 1, 5, 5, 5, 1, 2, 6, 2, 6, 2, 6, 6, 6, 4,
  1, 5, 1, 1, 5, 1, 5, 5, 1, 1, 1, 5, 1, 2, 6, 2, 6, 6, 6, 2, 6, 2,
  1, 5, 1, 1, 5, 5, 5, 1, 1, 1, 1, 5, 5, 6, 6, 2, 2, 2, 2, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 2, 2, 2, 6, 6, 6, 2, 6, 2,
  1, 5, 1, 5, 5, 5, 5, 1, 5, 1, 5, 1, 1, 2, 6, 6, 6, 2, 6, 2, 6, 2,
  1, 5, 5, 5, 1, 1, 5, 5, 5, 1, 5, 5, 5, 6, 6, 2, 2, 2, 6, 6, 6, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 4,
]
const mapHeight = 13;
const mapWidth = 22;
const a = annotateMap(testmap, mapWidth);

const testHeight = a.length === mapHeight;
const testWidth = a.every(row => row.length === mapWidth);
const withPath = setPath(a);
import util from "util";
console.log(util.inspect(withPath, {showHidden: false, depth: null, colors: true}))


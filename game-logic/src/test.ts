import { annotateMap, setPath } from "./map-processor.js"

const testmap = [
  3, 1, 1, 1, 1,
  5, 5, 1, 1, 1,
  2, 6, 6, 2, 2,
  2, 2, 6, 6, 4
]
const mapHeight = 4;
const mapWidth = 5;
const a = annotateMap(testmap, mapWidth);

const testHeight = a.length === mapHeight;
const testWidth = a.every(row => row.length === mapWidth);
const withPath = setPath(a);
import util from "util";
console.log(util.inspect(withPath, {showHidden: false, depth: null, colors: true}))


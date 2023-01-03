import {builder, consumer} from "paima-engine/paima-concise";
const string = `r|1|at;h100;c9|mc;h100;c10|`
const c = consumer.initialize(string);
console.log(c.nextValue(), "wtf")
console.log(c.nextValue(), "wtf2")
console.log(c.nextValue(), "wtf3")
console.log(c.nextValue(), "wtf4")
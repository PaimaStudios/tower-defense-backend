import P from 'parsimmon';


const semicolon = P.string(";");
const baseGoldRate = P.seqObj(
  P.string("gr"),
  semicolon
)
// const parser: P.Parser<ParsedSubmittedInput> = P.alt(create, join, moves, nft, zombie, stats, config);
const parser: P.Parser<ParsedSubmittedInput> = P.alt(config);

function parse(s: string): ParsedSubmittedInput {
  try {
    const res = parser.tryParse(s);
    return res;
  } catch (e) {
    console.log(e, 'parsing failure');
    return {
      input: 'invalidString',
    };
  }
}

export default parse;
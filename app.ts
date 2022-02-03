const allWords = require('./allwords.json').map((w) => w.word.toLowerCase());

class Solver {
  // length of words we are solving against
  private wordLength: number

  // chars that are not in the solution
  private excludedChars: string[];

  // Record<char, number position(s) char isn't at>
  // also doubles as position where char IS if all but one entry is full
  /*
  {
    r: [0],
    d: [0, 1, 2, 3]
  }
  */
  private charNotAtPos: Record<string, number[]>;

  constructor(
    // the complete wordlist we are solving against
    private wordlist: string[]
  ) {
    if (!Array.isArray(wordlist) || wordlist.length === 0) {
      throw new Error('invalid wordlist');
    }
    this.wordLength = wordlist[0].length;
  }

  public addExcludedChar(char: string): Solver {
    this.excludedChars.push(char);
    return this;
  }

  public addNegativeCharPos(char: string, pos: number): Solver {
    if (char in this.charNotAtPos) {
      this.charNotAtPos[char].push(pos);
    } else {
      this.charNotAtPos[char] = [pos];
    }
    return this;
  }

  public addPositiveCharPos(char: string, pos: number): Solver {
    if (char in this.charNotAtPos) throw new Error(`Invalid positive position for char '${char}', already exists as a negative position`);
      this.charNotAtPos[char] = [];
    for (let i = 0; i < this.wordLength; i++) {
      if (i === pos) {
        continue;
      }
      this.charNotAtPos[char].push(i);
    }
    return this;
  }

  public getPossibleAnswers(): string[] {
    const getPossibleAnswers = compose(
      excludeWrongChars(this.excludedChars),
      includeCorrectChars(this.charNotAtPos),
      excludeIncorrectPositions(this.charNotAtPos),
      sortWords
    )
    return getPossibleAnswers(this.wordlist)
  }
}



const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);

// exclude chars not in the solution
const excludeWrongChars = (excludedChars: string[]) => (words: string[]) => {
  return words.filter(w => {
    for (const char of excludedChars) {
      if (w.includes(char)) {
        return false;
      }
    }
    return true;
  });
}

const includeCorrectChars = (charNotAtPosition: Record<string, number[]>) => (words: string[]) => {
  return words.filter(w => {
    for (const char of Object.keys(charNotAtPosition)) {
      if (!w.includes(char)) {
        return false;
      }
    }
    return true;
  });
}

const excludeIncorrectPositions = (charNotAtPosition: Record<string, number[]>) => (words: string[]) => {
  return words.filter(w => {
    for (const [char, positions] of Object.entries(charNotAtPosition)) {
      for (const pos of positions) {
        if (w.charAt(pos) === char) {
          return false;
        }
      }
    }
    return true;
  });
}

const sortWords = (words: string[]) => words.sort((a, b) => a.localeCompare(b));
const possibleAnswers = new Solver(allWords)
.addExcludedChar('')
.addNegativeCharPos('', 2)
.addPositiveCharPos('', 1)
.getPossibleAnswers()

console.log(possibleAnswers);

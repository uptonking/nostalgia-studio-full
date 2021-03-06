import assert from 'assert'
import {
  codepointsIteratorRTL,
  getCharacterDistance,
  getWordDistance,
} from '../../src/utils/string'

const codepoints = [
  ['a', 1],
  ['0', 1],
  [' ', 1],
  ['# ', 1],
  ['* ', 1],
  ['2 ', 1],
  ['๐', 2],
  ['โบ๏ธ', 2],
  ['โบ๏ธ', 2],
  ['โฌ๏ธ', 2],
  ['๐ด', 2],
  ['โบ๏ธa', 2, 1],
  ['๐๐จ๐ณ', 2, 4],
  ['๐๐ฉ๐ช', 2, 4],
  ['๐ฉ๐บ๐ธ', 2, 4],
  ['๐จ๐ณ๐', 4, 2],
  ['๐ด๐ณ๏ธ', 2, 3],
  ['๐ท๐บ๐ฉ', 4, 2],
] as const

const zwjSequences = [
  ['๐โ๐จ', 5],
  ['๐จโ๐ฉโ๐งโ๐ง', 11],
  ['๐ฉโโค๏ธโ๐จ', 8],
  ['๐๐ฝโโ๏ธ', 7],
  ['๐โโ๏ธ', 5],
  ['๐ต๏ธโโ๏ธ', 6],
  ['๐จ๐ฟโ๐ฆณ', 7],
] as const

const regionalIndicatorSequences = [
  '๐ง๐ช',
  '๐ง๐ซ',
  '๐ง๐ฌ',
  '๐ง๐ญ',
  '๐ง๐ฎ',
  '๐ง๐ฏ',
  '๐ง๐ฑ',
  '๐ง๐ฒ',
  '๐ง๐ณ',
  '๐ง๐ด',
]

const keycapSequences = [
  '#๏ธโฃ',
  '*๏ธโฃ',
  '0๏ธโฃ',
  '1๏ธโฃ',
  '2๏ธโฃ',
  '3๏ธโฃ',
  '4๏ธโฃ',
  '5๏ธโฃ',
  '6๏ธโฃ',
  '7๏ธโฃ',
  '8๏ธโฃ',
  '9๏ธโฃ',
]

const tagSequences = [
  ['๐ด๓ ง๓ ข๓ ฅ๓ ฎ๓ ง๓ ฟ', 14],
  ['๐ด๓ ง๓ ข๓ ณ๓ ฃ๓ ด๓ ฟ', 14],
  ['๐ด๓ ง๓ ข๓ ท๓ ฌ๓ ณ๓ ฟ', 14],
] as const

// Sample strings from https://www.unicode.org/Public/UCD/latest/ucd/auxiliary/GraphemeBreakTest.html#samples
// In some strings, explicit Unicode code points are used to prevent accidental normalization.
// Zero-width joiners (U+200D), which are hard to tell, are also made explicit.
const sampleStrings = {
  '2': ['a\u0308'],
  '3': [' \u200d', 'ู'],
  '4': ['ู\u200d', ' '],
  '5': ['แแ'],
  '6': ['๊ฐ\u11a8', 'แ'],
  '7': ['๊ฐแจ', 'แ'],
  '8': ['๐ฆ๐ง', '๐จ', 'b'],
  '9': ['a', '๐ฆ๐ง', '๐จ', 'b'],
  '10': ['a', '๐ฆ๐ง\u200d', '๐จ', 'b'],
  '11': ['a', '๐ฆ\u200d', '๐ง๐จ', 'b'],
  '12': ['a', '๐ฆ๐ง', '๐จ๐ฉ', 'b'],
  '13': ['a\u200d'],
  '14': ['a\u0308', 'b'],
  '15': ['aเค', 'b'],
  '16': ['a', 'ุb'],
  '17': ['๐ถ๐ฟ', '๐ถ'],
  '18': ['a๐ฟ', '๐ถ'],
  '19': ['a๐ฟ', '๐ถ\u200d๐'],
  '20': ['๐ถ๐ฟฬ\u200d๐ถ๐ฟ'],
  '21': ['๐\u200d๐'],
  '22': ['a\u200d', '๐'],
  '23': ['โ\u200dโ'],
  '24': ['a\u200d', 'โ'],
}

const dirs = ['ltr', 'rtl']

dirs.forEach(dir => {
  const isRTL = dir === 'rtl'

  describe(`getCharacterDistance - ${dir}`, () => {
    codepoints.forEach(([str, ltrDist, rtlDist]) => {
      const dist = isRTL && rtlDist != null ? rtlDist : ltrDist

      it(str, () => {
        assert.strictEqual(getCharacterDistance(str + str, isRTL), dist)
      })
    })

    zwjSequences.forEach(([str, dist]) => {
      it(str, () => {
        assert.strictEqual(getCharacterDistance(str + str, isRTL), dist)
      })
    })

    regionalIndicatorSequences.forEach(str => {
      it(str, () => {
        assert.strictEqual(getCharacterDistance(str + str, isRTL), 4)
      })
    })

    keycapSequences.forEach(str => {
      it(str, () => {
        assert.strictEqual(getCharacterDistance(str + str, isRTL), 3)
      })
    })

    tagSequences.forEach(([str, dist]) => {
      it(str, () => {
        assert.strictEqual(getCharacterDistance(str + str, isRTL), dist)
      })
    })

    Object.entries(sampleStrings).forEach(([label, strs]) => {
      for (let i = 0; i < strs.length; i++) {
        let str = ''
        if (isRTL) {
          str = strs.slice(0, i + 1).join('')
        } else {
          str = strs.slice(i).join('')
        }
        it(`Sample string ${label}, boundary ${isRTL ? i : i + 1}`, () => {
          assert.strictEqual(getCharacterDistance(str, isRTL), strs[i].length)
        })
      }
    })
  })
})

const ltrCases = [
  ['hello foobarbaz', 5],
  ['๐ด๓ ง๓ ข๓ ฅ๓ ฎ๓ ง๓ ฟ๐ด๓ ง๓ ข๓ ณ๓ ฃ๓ ด๓ ฟ ๐ด๓ ง๓ ข๓ ท๓ ฌ๓ ณ๓ ฟ', 28],
  ["Don't do this", 5],
  ["I'm ok", 3],
] as const

const rtlCases = [
  ['hello foobarbaz', 9],
  ['๐ด๓ ง๓ ข๓ ฅ๓ ฎ๓ ง๓ ฟ๐ด๓ ง๓ ข๓ ณ๓ ฃ๓ ด๓ ฟ ๐ด๓ ง๓ ข๓ ท๓ ฌ๓ ณ๓ ฟ', 14],
  ["Don't", 5],
  ["Don't do this", 4],
  ["I'm", 3],
  ['Tags ๐ด๓ ง๓ ข๓ ฅ๓ ฎ๓ ง๓ ฟ๐ด๓ ง๓ ข๓ ณ๓ ฃ๓ ด๓ ฟ', 28],
] as const

describe(`getWordDistance - ltr`, () => {
  ltrCases.forEach(([str, dist]) => {
    it(str, () => {
      assert.strictEqual(getWordDistance(str), dist)
    })
  })
})

describe(`getWordDistance - rtl`, () => {
  rtlCases.forEach(([str, dist]) => {
    it(str, () => {
      assert.strictEqual(getWordDistance(str, true), dist)
    })
  })
})

const cases = [
  ...[...codepoints, ...zwjSequences, ...tagSequences, ...rtlCases].map(
    ([str]) => str
  ),
  ...keycapSequences,
  ...regionalIndicatorSequences,
]

describe('codepointsIteratorRTL', () => {
  cases.forEach(str => {
    it(str, () => {
      const arr1 = [...codepointsIteratorRTL(str)]
      const arr2 = Array.from(str).reverse()

      assert.deepStrictEqual(arr1, arr2)
    })
  })
})

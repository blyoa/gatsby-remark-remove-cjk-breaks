import visit from 'unist-util-visit'
import { Data, Literal, Node } from 'unist'

// prettier-ignore
/* eslint-disable no-multi-spaces */
const cjkChars = [
  '\\p{scx=Hani}',
  '\\p{scx=Bopomofo}',
  '\\p{scx=Yi}',
  '\\p{scx=Hiragana}',
  '\\p{scx=Katakana}',
  '\\p{Radical}',

  // Code points of CJK characters that are not included in the Unicode property escapes above
  // CJK Symbols and Punctuation
  '\\u{3004}', // ... CJK symbols and punctuation (Japanese Industrial Standard Symbol)
  '\\u{3012}', // ... CJK symbols (Postal Mark)
  '\\u{3020}', // ... CJK symbols (Postal Mark Face)
  '\\u{3036}', // ... Other CJK symbols (Circled Postal Mark)

  // Enclosed CJK Letters and Months
  '\\u{3248}-\\u{324F}', // ... Circled numbers on black squares from ARIB STD B24
  '\\u{3248}-\\u{325F}', // ... Circled numbers
  '\\u{327F}',           // ... Symbol (Korean Standard Symbol)
  '\\u{32B1}-\\u{32BF}', // ... Circled numbers

  // Enclosed Ideographic Supplement
  '\\u{1F201}-\\u{1F202}', // ... Squared katakana
  '\\u{1F210}-\\u{1F23B}', // ... Squared ideographs and kana from ARIB STD B24, Squared ideographs
  '\\u{1F240}-\\u{1F248}', // ... Ideographs with tortoise shell brackets from ARIB STD B24
  '\\u{1F260}-\\u{1F265}', // ... Symbols for Chinese folk religion

  // CJK Compatibility Forms
  '\\u{FE30}-\\u{FE44}', // Glyphs for vertical variants
  '\\u{FE47}-\\u{FE4F}', // Glyphs for vertical variants, Overscores and underscores

  // Halfwidth and Fullwidth Forms
  '\\u{FF01}-\\u{FF60}',    // Fullwidth ASCII variants
  '\\u{FFE0}-\\u{FFE6}',    // Fullwidth symbol variants
  // '\\u{FFE8}-\\u{FFEE}', // Halfwidth symbol variants

  // Small Form Variants
  '\\u{FE50}-\\u{FE52}', // ... Small form variants
  '\\u{FE54}-\\u{FE66}', // ... Small form variants
  '\\u{FE68}-\\u{FE6B}', // ... Small form variants

  // Vertical Forms
  '\\u{FE10}-\\u{FE12}',  // ... Glyphs for vertical variants
  // '\u{FE13}-\u{FE16}', // ... Glyphs for vertical variants (Latin symbols of vertical form)
  '\\u{FE17}-\\u{FE18}',  // ... Glyphs for vertical variants
  // '\u{FE19}',          // ... Glyphs for vertical variants (Presentation Form for Vertical Horizontal Ellipsis)

  // References:
  // https://unicode.org/charts/
  // https://unicode.org/Public/UCD/latest/ucd/Scripts.txt
  // https://unicode.org/Public/UNIDATA/ScriptExtensions.txt
  // https://unicode-table.com/en/
]

// prettier-ignore
const squaredLatinAbbrChars = [
  // Enclosed CJK Letters and Months
  '\\u{3250}',           // ... Squared Latin abbreviation (Partnership Sign)
  '\\u{32CC}-\\u{32CF}', // ... Squared Latin abbreviations

  // CJK Compatibility
  '\\u{3371}-\\u{337A}', // ... Squared Latin abbreviations
  '\\u{3380}-\\u{33DF}', // ... Squared Latin abbreviations, Abbreviations involving iter symbols, Squared Latin abbreviations
  '\\u{33FF}',           // ... Squared Latin abbreviations (Square Gal)
]
/* eslint-enable no-multi-spaces */

// Emoji
const emojiFlagSequence = '\\p{RI}\\p{RI}' // emoji flag sequence
const emojiPresentationSequence = '\\p{Emoji}\\u{EF0F}'
const emojiKeycapSequence = '[0-9#*]\\u{FE0F}\\u{20E3}'
const emojiModifierSequence = '\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}'
const emojiTagSequence = `(?:\\p{Emoji}|${emojiModifierSequence}|${emojiPresentationSequence})[\\u{E0020}-\\u{E007E}]+\\u{E007F}`
const emojiCoreSequence = [
  '\\p{Emoji}',
  emojiPresentationSequence,
  emojiKeycapSequence,
  emojiModifierSequence,
  emojiFlagSequence,
].join('|')
const emojiZWJSequence = `(?:\\p{Emoji}|${emojiPresentationSequence}|${emojiModifierSequence})(?:\\u{200d}(?:\\p{Emoji}|${emojiPresentationSequence}|${emojiModifierSequence}))+`
const emojiPattern = [
  '\\p{Emoji_Presentation}', // default emoji presentation _character_
  emojiCoreSequence,
  emojiZWJSequence,
  emojiTagSequence,
].join('|')
// Reference:
// https://unicode.org/reports/tr51/#Definitions
//

export default (
  { markdownAST }: { markdownAST: Node<Data> },
  {
    includeHangul = false,
    includeEmoji = false,
    includeSquaredLatinAbbrs = false,
    additionalRegexpPairs,
  }: {
    includeHangul?: boolean
    includeEmoji?: boolean
    includeSquaredLatinAbbrs?: boolean
    additionalRegexpPairs?: {
      beforeBreak?: string
      afterBreak?: string
    }[]
  } = {}
) => {
  const charGroup = cjkChars
  if (includeSquaredLatinAbbrs) charGroup.push(...squaredLatinAbbrChars)
  if (includeHangul) charGroup.push('\\p{scx=Hangul}')

  let pattern = `[${charGroup.join('')}]`
  if (includeEmoji) pattern = `${pattern}|${emojiPattern}`

  const regexpPairs = additionalRegexpPairs ?? [
    { beforeBreak: undefined, afterBreak: undefined },
  ]

  visit(markdownAST, 'text', (node: Literal<string>) => {
    for (const pair of regexpPairs) {
      const patBeforeBreak =
        pattern + (pair.beforeBreak ? `|${pair.beforeBreak}` : '')
      const patAfterBreak =
        pattern + (pair.afterBreak ? `|${pair.afterBreak}` : '')

      const regexp = new RegExp(
        `(${patBeforeBreak})(?:\r\n|\r|\n)(${patAfterBreak})`,
        'gu'
      )

      node.value = node.value.replace(regexp, '$1$2')
    }
  })
  return markdownAST
}

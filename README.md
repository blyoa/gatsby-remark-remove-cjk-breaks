# gatsby-remark-remove-cjk-breaks

[![npm version](https://badge.fury.io/js/gatsby-remark-remove-cjk-breaks.svg)](https://badge.fury.io/js/gatsby-remark-remove-cjk-breaks)
[![test](https://github.com/blyoa/gatsby-remark-remove-cjk-breaks/actions/workflows/node.js.yml/badge.svg)](https://github.com/blyoa/gatsby-remark-remove-cjk-breaks/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://https://github.com/blyoa/gatsby-remark-remove-cjk-breaks/blob/main/LICENSE)


This plugin removes line breaks between CJK characters to avoid an unexpected space between the characters.

## Example Output

**input markdown**

```
上午好。
这是一个美丽的早晨。

おはようございます。
良い朝ですね。
```

**rendered text on browsers without this plugin**
```
上午好。 这是一个美丽的早晨。

おはようございます。 良い朝ですね。
```
(A space is unexpectedly inserted between a punctuation and the next character)


**rendered text on browsers with this plugin**
```
上午好。这是一个美丽的早晨。

おはようございます。良い朝ですね。
```

## Installation

```
npm install gatsby-remark-remove-cjk-breaks
```

## Usage

```js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-remove-cjk-breaks`,
          options: {
            // include Hangul characters into CJK character set.
            // default: false
            // NOTE:
            // Hangul is not included in the default CJK character set
            // to avoid the unexpected concatenation of Hangul characters
            // because Korean has a rule to separate characters with a space.
            includeHangul: false,

            // include squared Latin abbreviation characters.
            // (e.g. ㎅, ㎆) to CJK character set
            // default: false
            includeSquaredLatinAbbrs: false,

            // include emoji sequences into CJK character set.
            // default: false
            includeEmoji: false,

            // add regexp that expresses an additional characters to the default character set.
            // Regular expressions of each object in this array are exclusively added to
            // the CJK character set, which may be extended the above options, and
            // each extended character set is used for the replacing.
            additionalRegexpPairs: [
              {
                // add regexp to the default character set before a line break.
                // It is useful if you use half-width parenthesis without a space n CJK text.
                // default: undefined (that means that only the default character set is used)
                breforeBreak: '\\p{ASCII}',

                // add regexp to the default character set after a line break.
                // It is useful if you use half-width parenthesis without a space in CJK text.
                // default: undefined (that means that only the default character set is used)
                afterBreak: undefined,
              },
            ],
          },
        },
      ]
    }
  },
]
```


## Setting Examples

### To use ASCII words without a space in CJK text

```js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-remove-cjk-breaks`,
          options: {
            additionalRegexpPairs: [
              {
                breforeBreak: '\\p{ASCII}',
                afterBreak: undefined,
              },
              {
                breforeBreak: undefined,
                afterBreak: '\\p{ASCII}',
              },
            ],
          },
        },
      ]
    }
  },
]
```

This setting converts, for example,
“中文句子\nan english word\n日本語の文” to
“中文句子an english word日本語の文”


### To use half-width parentheses without a space in CJK text:
```js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-remove-cjk-breaks`,
          options: {
            additionalRegexpPairs: [
              {
                breforeBreak: '(',
                afterBreak: undefined,
              },
              {
                breforeBreak: undefined,
                afterBreak: ')',
              },
            ],
          },
        },
      ]
    }
  },
]
```

This setting converts, for example,
“半角の丸括弧\n(全角の丸括弧はデフォルトに含まれる)を追加” to
“半角の丸括弧(全角の丸括弧はデフォルトに含まれる)を追加”


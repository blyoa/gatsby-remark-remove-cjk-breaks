# gatsby-remark-remove-cjk-breaks

This plugin removes line breaks between CJK characters to avoid an unexpected space between the characters.


## Example

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
    options: [
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

            // add regexp to the default character set before a line break.
            // It is useful if you use half-width parenthesis without a space n CJK text.
            // default: ''
            regexpBeforeBreak: ')',

            // add regexp to the default character set after a line break.
            // It is useful if you use half-width parenthesis without a space in CJK text.
            // default: ''
            regexpAfterBreak: '(',
          },
        },
      ]
    ]
  },
]
```

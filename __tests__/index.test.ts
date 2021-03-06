import { remark } from 'remark'
import { Literal } from 'unist'
import visit from 'unist-util-visit'

import plugin from '../src'

const processor = remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

describe('nothing should be changed', () => {
  it('no line break exists', () => {
    const markdownAST = processor.parse('おはようございます。')
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('おはようございます。')
    })
  })

  it('Latin characters are separated with a line break', () => {
    const markdownAST = processor.parse(`Good morning.\nHave a nice day.`)
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(`Good morning.\nHave a nice day.`)
    })
  })

  it('CJK characters are separated with a space', () => {
    const markdownAST = processor.parse('おはよう ございます。')
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('おはよう ございます。')
    })
  })

  it('CJK characters are separated with a line break, but an extra space exists', () => {
    const markdownAST = processor.parse(`
    おはよう
     ございます。`)
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(`
    おはよう
     ございます。`)
    })
  })
})

describe('a line break should be removed', () => {
  it('Chinese characters are separeted with a line feed', () => {
    const markdownAST = processor.parse('上午好。\n这是个美丽的日子。')
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('上午好。这是个美丽的日子。')
    })
  })

  it('Chinese characters are separeted with a carriage return', () => {
    const markdownAST = processor.parse('上午好。\r这是个美丽的日子。')
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('上午好。这是个美丽的日子。')
    })
  })

  it('Chinese characters are separeted with a carriage return and a line feed', () => {
    const markdownAST = processor.parse('上午好。\r\n这是个美丽的日子。')
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('上午好。这是个美丽的日子。')
    })
  })

  it('Japanese characters are separeted with a line feed', () => {
    const markdownAST = processor.parse(
      'おはようございます。\n今日はいい天気ですね。'
    )
    const transformed = plugin({ markdownAST }, {})

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('おはようございます。今日はいい天気ですね。')
    })
  })
})

describe('Hangul support', () => {
  it('Hangul characters between a line feed without the option', () => {
    const markdownAST = processor.parse('안녕\n하세요')
    const transformed = plugin({ markdownAST }, { includeHangul: false })

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('안녕\n하세요')
    })
  })
  it('Hangul characters between a line feed with the option', () => {
    const markdownAST = processor.parse('안녕\n하세요')
    const transformed = plugin({ markdownAST }, { includeHangul: true })

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('안녕하세요')
    })
  })

  it('Latin characters between a line feed with the option', () => {
    const markdownAST = processor.parse(`Good morning.\nHave a nice day.`)
    const transformed = plugin({ markdownAST }, { includeHangul: true })

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(`Good morning.\nHave a nice day.`)
    })
  })
})

describe('squared Latin abbreviation support', () => {
  it('squared Latin abbreviation characters between a line feed without option', () => {
    const markdownAST = processor.parse('㎅\n㎆')
    const transformed = plugin(
      { markdownAST },
      { includeSquaredLatinAbbrs: false }
    )

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('㎅\n㎆')
    })
  })

  it('squared Latin abbreviation characters between a line feed with option', () => {
    const markdownAST = processor.parse('㎅\n㎆')
    const transformed = plugin(
      { markdownAST },
      { includeSquaredLatinAbbrs: true }
    )

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('㎅㎆')
    })
  })

  it('Latin characters between a line feed with the option', () => {
    const markdownAST = processor.parse(`Good morning.\nHave a nice day.`)
    const transformed = plugin(
      { markdownAST },
      { includeSquaredLatinAbbrs: true }
    )

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(`Good morning.\nHave a nice day.`)
    })
  })
})

describe('Emoji support', () => {
  it('Emoji characters are separeted with a line feed without the option', () => {
    const markdownAST = processor.parse('😊\n😊')
    const transformed = plugin({ markdownAST }, { includeEmoji: false })

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('😊\n😊')
    })
  })
  it('Emoji characters are separeted with a line feed with the option', () => {
    const markdownAST = processor.parse('😊\n😊')
    const transformed = plugin({ markdownAST }, { includeEmoji: true })

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('😊😊')
    })
  })

  it('Latin characters between a line feed with the option', () => {
    const markdownAST = processor.parse(`Good morning.\nHave a nice day.`)
    const transformed = plugin({ markdownAST }, { includeEmoji: true })

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(`Good morning.\nHave a nice day.`)
    })
  })
})

describe('additional regexp support', () => {
  it('add right parenthesis', () => {
    const markdownAST = processor.parse(
      '(全角はデフォルトでサポートしているので)\n半角の丸括弧を追加しました。'
    )
    const transformed = plugin(
      { markdownAST },
      { additionalRegexpPairs: [{ beforeBreak: '[)]' }] }
    )

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(
        '(全角はデフォルトでサポートしているので)半角の丸括弧を追加しました。'
      )
    })
  })

  it('add left parenthesis', () => {
    const markdownAST = processor.parse(
      '半角の丸括弧\n(全角の丸括弧はデフォルトに含まれる)を追加しました。'
    )
    const transformed = plugin(
      { markdownAST },
      { additionalRegexpPairs: [{ afterBreak: '[(]' }] }
    )

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe(
        '半角の丸括弧(全角の丸括弧はデフォルトに含まれる)を追加しました。'
      )
    })
  })

  it('remove a space between a CJK character and an ASCII character', () => {
    const markdownAST = processor.parse('中文句子\nan english word\n日本語の文')
    const transformed = plugin(
      { markdownAST },
      {
        additionalRegexpPairs: [
          { beforeBreak: '\\p{ASCII}', afterBreak: undefined },
          { beforeBreak: undefined, afterBreak: '\\p{ASCII}' },
        ],
      }
    )

    visit(transformed, 'text', (node: Literal<string>) => {
      expect(node.value).toBe('中文句子an english word日本語の文')
    })
  })
})

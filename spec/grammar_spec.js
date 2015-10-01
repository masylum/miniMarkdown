var assert = require('assert')
var miniMarkdown = require('../miniMarkdown.js')
var Tokenizer = miniMarkdown.Tokenizer

// dummy link detector
function isLink (text) {
  var match = text.match(/^https?:\/\/[a-zA-Z]*\.[a-zA-Z]*/)

  return match && match[0].length
}

// dummy emoji detector
function isEmoji (text) {
  var emojis = [':+1:', ':trollface:']
  var emoji

  emojis.some(function (e) {
    if (text.indexOf(e) === 0) {
      emoji = e
      return true
    }
  })

  if (!emoji) {
    return false
  }

  return emoji.length
}

var link = new miniMarkdown.TokenType('link', {constraint: isLink})
var grammar = [
  link,
  new miniMarkdown.TokenType('label-link', {start: '<', end: '>', grammar: [link]}),
  new miniMarkdown.TokenType('emoji', {constraint: isEmoji})
]

function test (text, result) {
  var tokenizer = new Tokenizer(text, grammar)
  return assert.deepEqual(tokenizer.run(), result)
}

describe('experimental grammars', function () {
  var text

  context('when it contains a link', function () {
    beforeEach(function () { text = 'ola http://google.com' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola '},
        {type: 'link', text: 'http://google.com'}
      ])
    })
  })

  context('when it contains a labeled link', function () {
    beforeEach(function () { text = 'ola <http://google.com|lol>' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola '},
        {
          type: 'label-link', children: [
            {type: 'link', text: 'http://google.com'},
            {type: 'word', text: '|lol'}
          ]
        }
      ])
    })
  })

  context('when it contains an emoji', function () {
    beforeEach(function () { text = ':+1: works, :-1: no' })

    it('tokenizes', function () {
      test(text, [
        {type: 'emoji', text: ':+1:'},
        {type: 'word', text: ' works, :-1: no'}
      ])
    })
  })
})

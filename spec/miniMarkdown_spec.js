var assert = require('assert')
var miniMarkdown = require('../miniMarkdown.js')
var Tokenizer = miniMarkdown.Tokenizer
var grammar = miniMarkdown.DEFAULT_GRAMMAR

function test (text, result) {
  var tokenizer = new Tokenizer(text, grammar)
  return assert.deepEqual(tokenizer.run(), result)
}

describe('MinimalMarkdown', function () {
  var text

  context('when it contains only words', function () {
    beforeEach(function () { text = 'ola k ase' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola k ase'}
      ])
    })
  })

  context('when it contains *', function () {
    beforeEach(function () { text = 'ola *k ase*' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola '},
       {type: 'bold', children: [{type: 'word', text: 'k ase'}]}
      ])
    })
  })

  context('when a branch node is not closed', function () {
    beforeEach(function () { text = 'ola *k ase' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola *k ase'}
      ])
    })
  })

  context('when it contains _', function () {
    beforeEach(function () { text = 'ola _k ase_' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola '},
        {type: 'italic', children: [{type: 'word', text: 'k ase'}]}
      ])
    })
  })

  context('when it contains ~', function () {
    beforeEach(function () { text = 'ola ~k ase~' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola '},
        {type: 'strike', children: [{type: 'word', text: 'k ase'}]}
      ])
    })
  })

  context('when it contains a backtick', function () {
    beforeEach(function () { text = 'ola `k ase`' })

    it('tokenizes', function () {
      test(text, [
        {type: 'word', text: 'ola '},
        {type: 'code', children: [{type: 'word', text: 'k ase'}]}
      ])
    })
  })

  context('when it contains ```', function () {
    context('and does not contain newlines', function () {
      beforeEach(function () { text = 'ola ```k ase```' })

      it('tokenizes', function () {
        test(text, [
          {type: 'word', text: 'ola '},
          {type: 'pre', children: [{type: 'word', text: 'k ase'}]}
        ])
      })
    })

    context('and contains newlines', function () {
      beforeEach(function () { text = 'ola ```k \n ase```' })

      it('tokenizes', function () {
        test(text, [
          {type: 'word', text: 'ola '},
          {type: 'pre', children: [{type: 'word', text: 'k \n ase'}]}
        ])
      })
    })
  })

  context('when there is a bit of everything', function () {
    beforeEach(function () {
      text = '*hey* have _you_ seen ~how *amazing* this~ is? ```may *this* work?```, `lol`'
    })

    it('tokenizes', function () {
      test(text, [
        {type: 'bold', children: [{type: 'word', text: 'hey'}]},
        {type: 'word', text: ' have '},
        {type: 'italic', children: [{type: 'word', text: 'you'}]},
        {type: 'word', text: ' seen '},
        {
          type: 'strike', children: [
            {type: 'word', text: 'how '},
            {type: 'bold', children: [{type: 'word', text: 'amazing'}]},
            {type: 'word', text: ' this'}
          ]
        },
        {type: 'word', text: ' is? '},
        {type: 'pre', children: [{type: 'word', text: 'may *this* work?'}]},
        {type: 'word', text: ', '},
        {type: 'code', children: [{type: 'word', text: 'lol'}]}
      ])
    })
  })
})

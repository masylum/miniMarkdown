# miniMarkdown

![](https://media.giphy.com/media/qs6ev2pm8g9dS/giphy.gif)

^ Markdown

An easy to extend parser for a subset of markdown.

[![travis](https://img.shields.io/travis/masylum/miniMarkdown.svg?style=flat)](https://travis-ci.org/masylum/miniMarkdown)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Markdown support

miniMarkdown supports:

  - ```` ```pre``` ````
  - `` `code` ``
  - ` _Italics_ `
  - ` *Bold* `
  - ` ~Strike~ `

You can easily add more grammar to make your own extensions

## API

To run with the default grammar:

```js
let miniMarkdown = require('miniMarkdown');
let text = 'this *is* an _example_';
let grammar = miniMarkdown.DEFAULT_GRAMMAR;
let tokenizer = new miniMarkdown.Tokenizer(text, grammar);

tokenizer.run();
=> [
     {type: 'word', text: 'this '}
   , {type: 'bold', children: [{type: 'word', text: 'is'}]}
   , {type: 'word', text: ' an '}
   , {type: 'italic', children: [{type: 'word', text: 'example'}]}
   ]
```

If you are interested into adding more grammar you can also do so!

`TokenType` offers you an API to define grammar:

  - `start`: The string that defines the beggining of a token.
  - `end`: The string that defines the ending of a token.
  - `surround`: When both start and end delimiters are the same you can use this instead.
  - `grammar`: If you want a different grammar for a given token.
  - `constraint`: If you want to validate whether the token is valid before pushing it to the tree.

You can see grammar examples on the `spec/grammar_spec.js` test file.

## TEST

To test just run `npm test`

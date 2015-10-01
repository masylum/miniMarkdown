(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.miniMarkdown = factory()
  }
}(this, function () {
  // ------------------------
  // -- Token
  // ------------------------

  /**
   * Struct for a given token
   */
  function Token (type, children, text) {
    this.type = type

    if (children) {
      this.children = children
    }

    if (text) {
      this.text = text
    }
  }

  // ------------------------
  // -- TokenType
  // ------------------------

  /**
   * Struct to define a token type
   * This allows the tokenizer to match the string or not
   *
   * @param {String} type
   * @param {Object} options
   *   - {Function} chunker
   */
  function TokenType (type, options) {
    this.type = type

    if (options.grammar) {
      this.grammar = [this].concat(options.grammar)
    }

    this.constraint = options.constraint

    if (options.surround) {
      this.start = this.end = options.surround
    } else {
      this.start = options.start
      this.end = options.end
    }

    this.leaf = !this.start && !this.end
  }

  /**
   * Is the following chunk a token of my type?
   *
   * @param {TokenType} contextType
   * @param {String} text
   * @param {Boolean}
   */
  TokenType.prototype.match = function (contextType, text) {
    if (this.leaf) return this.constraint ? this.constraint(text) : true

    var start, end

    if (contextType === this && this.end) {
      end = text.slice(0, this.end.length)
      return end === this.end
    }

    if (!this.start) {
      return true
    }

    start = text.slice(0, this.start.length)
    return start === this.start
  }

  // ------------------------
  // -- DEFAULT_GRAMMAR
  // ------------------------

  var word = new TokenType('word', {})
  var DEFAULT_GRAMMAR = [
    new TokenType('pre', {surround: '```', grammar: []}),
    new TokenType('code', {surround: '`'}),
    new TokenType('italic', {surround: '_'}),
    new TokenType('bold', {surround: '*'}),
    new TokenType('strike', {surround: '~'})
  ]

  // ------------------------
  // -- Tokenizer
  // ------------------------

  /**
   * This is the responsible for consuming
   * the text and generate an array of tokens
   *
   * @param {String} text
   * @param {Array<TokenType} grammar
   */
  function Tokenizer (text, grammar, contextType) {
    this.text = text
    this.grammar = grammar.concat([word])

    this.i = 0
    this.start = 0
    this.tokens = []
    this.currentType = null
    this.contextType = contextType || null
    this.chunk = this.text
  }

  Tokenizer.prototype.run = function () {
    do {
      var tuple = this.fetchNextToken()
      var length = tuple[0]
      var tokenType = tuple[1]

      if (tokenType === this.currentType) continue
      if (tokenType === this.contextType) return this.finishIncompleteLeaf()

      if (tokenType.leaf) {
        this.finishIncompleteLeaf()
        this.start = this.i
        this.currentType = tokenType

        if (length > 1) {
          this.i += length
          this.finishIncompleteLeaf()
          this.i -= 1
          this.currentType = null
        }
      } else {
        this.pushBranchToken(tokenType)
      }
    } while (this.next())

    if (this.contextType) return []

    return this.finishIncompleteLeaf()
  }

  Tokenizer.prototype.finishIncompleteLeaf = function () {
    if (this.currentType) this.pushLeafToken()

    return this.tokens
  }

  Tokenizer.prototype.pushLeafToken = function () {
    var text = this.text.slice(this.start, this.i)

    this.tokens.push(new Token(this.currentType.type, null, text))
  }

  /**
   * Starts a new Tokenizer to evaluate the branch
   * and pushes both the leaf (if was open) and the
   * closed branch
   *
   * @param {TokenType} tokenType
   */
  Tokenizer.prototype.pushBranchToken = function (tokenType) {
    var nextChunk = this.chunk.slice(tokenType.start ? tokenType.start.length : 0)
    var tokenizer
    var children

    if (!nextChunk.length) return

    tokenizer = new Tokenizer(nextChunk, tokenType.grammar || this.grammar, tokenType)
    children = tokenizer.run()

    if (!children.length) return
    if (this.currentType) this.pushLeafToken()

    this.i += tokenType.start.length + tokenizer.i + tokenType.end.length - 1
    this.tokens.push(new Token(tokenType.type, children, null))
    this.currentType = null
  }

  /**
   * Set the chuck to be evaluated
   *
   * @return {Boolean}
   */
  Tokenizer.prototype.next = function () {
    this.i++
    this.chunk = this.text.slice(this.i)

    return !!this.chunk.length
  }

  /**
   * Iterates all the token types
   * until finding one that matches
   *
   * @return {Array<Number, TokenType>}
   */
  Tokenizer.prototype.fetchNextToken = function () {
    var length = this.grammar.length
    var i = 0
    var match
    var token_type

    for (i = 0; i < length; i++) {
      token_type = this.grammar[i]
      match = token_type.match(this.contextType, this.chunk)
      if (match) {
        return [match, token_type]
      }
    }
  }

  return {
    Tokenizer: Tokenizer,
    DEFAULT_GRAMMAR: DEFAULT_GRAMMAR,
    TokenType: TokenType
  }
}))

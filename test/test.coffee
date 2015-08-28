should = require 'should'
Man = require '../'

Error.stackTraceLimit = Infinity

make = (fn)->
  result = ''
  man = new Man
  man.on 'data', (str)->
    result += str.toString()
  fn man, (expect)->
    if expect.constructor is String
      result.should.equal expect
    else
      expect result

it 'should format an argument', ->
  (Man.prototype.formatArgument 'foo').should.equal 'foo'
  (Man.prototype.formatArgument 'foo bar').should.equal '"foo bar"'

it 'should write', ->
  make (man, expect)->
    man.write 'hello, world!'
    expect 'hello, world!\n'

it 'should format periods', ->
  make (man, expect)->
    man.write 'hello. I am doge.'
    expect 'hello\\. I am doge\\.\n'

it 'should make a comment', ->
  make (man, expect)->
    man.comment 'hello!'
    man.comment 'there!'
    expect '\\." hello!\n\\." there!\n'

it 'should make a title head', ->
  make (man, expect)->
    man.header()
    expect ".TH UNTITLED 7 \"#{Man.prototype.formatDate new Date()}\" Linux " +
      '""\n'

  make (man, expect)->
    man.header 'foo'
    expect ".TH FOO 7 \"#{Man.prototype.formatDate new Date()}\" Linux " +
      '""\n'

  make (man, expect)->
    man.header 'foo', 3
    expect ".TH FOO 3 \"#{Man.prototype.formatDate new Date()}\" Linux " +
      '"Linux Programmer\'s Manual"\n'

  make (man, expect)->
    man.header 'foo', 3, new Date(0)
    expect '.TH FOO 3 "January 4, 1970" Linux ' +
      '"Linux Programmer\'s Manual"\n'

  make (man, expect)->
    man.header 'foo', 3, new Date(0), 'Some Source'
    expect '.TH FOO 3 "January 4, 1970" "Some Source" ' +
      '"Linux Programmer\'s Manual"\n'

  make (man, expect)->
    man.header 'foo', 3, new Date(0), 'Some Source', 'FooMan'
    expect '.TH FOO 3 "January 4, 1970" "Some Source" FooMan\n'

it 'should make a section head', ->
  make (man, expect)->
    man.section 'foobar'
    expect '.SH FOOBAR\n'

it 'should make a sub-section head', ->
  make (man, expect)->
    man.subSection 'foobar'
    expect '.SS foobar\n'

it 'should make a NAME section', ->
  make (man, expect)->
    man.name 'foobar', 'a foo in a bar'
    expect '.SH NAME\nfoobar \\- a foo in a bar\n'

it 'should make a new paragraph', ->
  make (man, expect)->
    man.write 'hello!'
    man.paragraph()
    man.write 'there!'
    expect 'hello!\n.PP\nthere!\n'

it 'should clamp argument counts to 6 arguments', ->
  make (man, expect)->
    man.bold '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17'
    expect '.B 1 2 3 4 5 6\n.B 7 8 9 10 11 12\n.B 13 14 15 16 17\n'

it 'should make some bold text', ->
  make (man, expect)->
    man.write 'hello!'
    man.bold 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.B Hello, world! This is great\\.\nthere!\n'

it 'should make some italic text', ->
  make (man, expect)->
    man.write 'hello!'
    man.italics 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.I Hello, world! This is great\\.\nthere!\n'

it 'should make some small text', ->
  make (man, expect)->
    man.write 'hello!'
    man.small 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.SM Hello, world! This is great\\.\nthere!\n'

it 'should make some bold-normal alternating text', ->
  make (man, expect)->
    man.write 'hello!'
    man.boldNormal 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.BR Hello, world! This is great\\.\nthere!\n'

it 'should make some bold-italic alternating text', ->
  make (man, expect)->
    man.write 'hello!'
    man.boldItalic 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.BI Hello, world! This is great\\.\nthere!\n'

it 'should make some italic-bold alternating text', ->
  make (man, expect)->
    man.write 'hello!'
    man.italicBold 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.IB Hello, world! This is great\\.\nthere!\n'

it 'should make some italic-normal alternating text', ->
  make (man, expect)->
    man.write 'hello!'
    man.italicNormal 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.IR Hello, world! This is great\\.\nthere!\n'

it 'should make some small-bold alternating text', ->
  make (man, expect)->
    man.write 'hello!'
    man.smallBold 'Hello, world! This is great.'
    man.write 'there!'
    expect 'hello!\n.SB Hello, world! This is great\\.\nthere!\n'

it 'should indent', ->
  make (man, expect)->
    man.indentBegin 4
    expect '.RS 4\n'

it 'should end indentation', ->
  make (man, expect)->
    man.indentEnd()
    expect '.RE\n'

it 'should indent some text', ->
  make (man, expect)->
    man.indent 2, 'hello!'
    expect '.RS 2\nhello!\n.RE\n'

it 'should insert a hanging indent', ->
  make (man, expect)->
    man.paragraphHanging 2
    man.write 'hello!'
    expect '.HP 2\nhello!\n'

it 'should make an indented paragraph', ->
  make (man, expect)->
    man.write 'hello!'
    man.paragraphIndented 2
    man.write 'hello!'
    expect 'hello!\n.IP 2\nhello!\n'

it 'should make an indented paragraph with tag', ->
  make (man, expect)->
    man.write 'hello!'
    man.paragraphIndented 2, '>'
    man.write 'hello!'
    expect 'hello!\n.IP > 2\nhello!\n'

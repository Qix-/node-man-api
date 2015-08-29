# node-man-api [![Travis-CI.org Build Status](https://img.shields.io/travis/Qix-/node-man-api.svg?style=flat-square)](https://travis-ci.org/Qix-/node-man-api) [![Coveralls.io Coverage Rating](https://img.shields.io/coveralls/Qix-/node-man-api.svg?style=flat-square)](https://coveralls.io/r/Qix-/node-man-api)
> Wrapper around standards compliant Manpage tags

This library is a lightweight wrapper around Manpage tags. It is meant to
facilitate the generation of compliant tags, and aims to aid in the replacement
of incredibly non-standard Markdown-to-Manpage converters.

## Example
```javascript
var Man = require('man-api');

var man = new Man();
man.on('data', function (str) {
	/* append `str` somewhere */
});

// or

var man = new Man(function (str) {
	/* append `str` somewhere */
});


// all methods are chainable.
man.header('foobar', 3).name('foobar', 'foo into the bar');

// using .header() and .name() now allow your command to appear in the
// `whatis foobar` database.

man.section('Other').write('This is some other text.').bold('This is bold');
```

## API

#### `Man([fn])`
Constructor; creates a new manpage instance. Returns objects are `instanceof
events.EventEmitter`, and only emit `data` events.

- `fn`: Optional function that receives strings upon calling methods. Can be
  fed directly to Manpage files.

See [above example](#example).

#### `.write(...)`

Writes text to the manpage.

- `...`: Arguments to be `.toString()` coerced and then concatenated with a
  single space.

This method appends a newline to the end of the string. It does not add
any tags nor does it abide by the 6 argument rule.

The method is safe to use within designated paragraph (sub)sections, but does
not perform any intelligent argument quoting - only standard textual
replacement.

```javascript
man.write('There are', 3, 'piggies.');
```

#### `.header([title, [section, [date, [source, [manual]]]]])`
Writes the manpage header. **This is required for all man-pages and should be
the first method called.**

- `title`: the title of your manpage.
- `section`: which [section](http://linux.die.net/man/7/man-pages) your manpage
  belongs to.
	- can be a number or a pre-defined helper string listed in `sections` in
		[index.js](blob/master/index.js).
- `date`: the date the manpage was created
	- if passed, can be `Date` object, unix timestamp (`Number`), or a string
    (which is simply returned verbatim). Uses `.formatDate()`.
- `source`: the source of the manpage; *this has nothing to do with source
	code*. Check [this manpage](http://linux.die.net/man/7/man-pages) for more
  information on the `source` parameter.
- `manual`: the overarching manual this manpage belongs to. Check
  [this manpage](http://linux.die.net/man/7/man-pages) for more
  information on the `manual` parameter.

> **This _must_ be the _first_ call in your manpage** after any comments.

#### `.section(name)`
Starts a new section.

- `name`: the name of the section

Automatically coverts `name` to upper-case.

> Note: You should section names that correspond to the
> [standard list](http://linux.die.net/man/7/man-pages) (see *Sections within
> a manual page*).

```javascript
man.section('Synopsis'); //-> .SH SYNOPSIS
```

#### `.subSection(name)`
Starts a new sub-section.

- `name`: the name of the sub-section

> Note: There are no standard sub-sections; therefore, `name` is *not*
> automatically converted to upper-case.

> Headings capitalize the first word in heading, but otherwise use
> lower case, except where English usage (e.g., proper nouns) or
> programming language requirements (e.g., identifier names)
> dictate otherwise.
>
> Due to this, we do no formatting here.

```javascript
man.subSection('Portability'); //-> .SS Portability
```

#### `.name(name, description)`
Starts the **NAME** section with the name of the function and the `whatis`
description. This section is **required** to be standard, and **should be
called second**, right after `.header()`.

- `name`: the name of the function/command the man page is about
- `description`: the `whatis` description to use

> Keep descriptions nice and concise, like a GitHub repository description.

```javascript
man.name('some_function', 'performs some operation');

/*
	.SH NAME
	some_function \- performs some operation
*/
```

#### `.paragraph()`
Starts a new paragraph.

```javascript
man.paragraph(); //-> .PP
```

#### `.bold(str)`
#### `.italic(str)`
#### `.small(str)`
Writes some bold/italic/small text.

> `.small()` is not very widely supported, and is historically used for
> acronyms. Keep this in mind before using it.

- `str`: the string to write

These are font tags, and to comply with portability standards we break `str`
up by spaces/new-lines and clump them into 6-word commands as old
implementations only supported that many. Keep this in mind if whitespace is
an issue.

Note that font tags do not cause a line break. Switching from regular ("roman")
font to bold/italic/small does require a new tag but doesn't cause a new line to
form. To do this, you need to use `.paragraph()` (`.PP`).

```javascript
man.bold('hello, world!'); //-> .B hello, world!
man.italic('hello, world!'); //-> .I hello, world!
man.small('hello, world!'); //-> .SM hello, world!
```

#### `.boldItalic(str)`
#### `.boldNormal(str)`
#### `.italicBold(str)`
#### `.italicNormal(str)`
#### `.normalBold(str)`
#### `.normalItalic(str)`
#### `.smallBold(str)`
Write **alternating font** words (see notes below).

- `str`: the string to write

**These methods do not combine two styles**. Instead, they *alternate* between
two styles. The alternation occurs at a space character, and **the resulting
text does not include a space!**

The naming convention used can be read *X-to-Y* (e.g. *bold-to-italic*). This
means `.boldItalic` will start with bold and alternate to italic, whereas
`.italicBold` will start with italics and alternate to bold.

```javascript
man.boldItalic("hello there chap"); //-> .BI hello there chap
```

#### `.indentBegin([n])`
#### `.indentEnd()`
Begins/ends an indentation.

- `n`: the number of columns to indent. If not supplied, will increase current
  indent by the last indent used. Can be negative (or even an expression string,
  e.g. `+11-4`)

Indentation amount is relative to current indentation.

Ending an indentation will set indentation level back to previous value.

```javascript
man.indentBegin(5).bold('Hello, world!').indentEnd();

/*
	.RS 5
	.B Hello, world!
	.RE
*/
```

#### `.indent(n, str)`
Writes some indented text.

- `n`: the number of columns to indent
- `str`: the string to indent

This is a simple wrapper around `.indentBegin(n).write(str).indentEnd()`.


```javscript
man.indent(5, "This is indented!");

/*
	.RS 5
	This is indented!
	.RE
*/
```

#### `.paragraphHanging(n)`
Starts a paragraph with a hanging indent (first line starts at col +0,
subsequent lines start at col +`n`).

- `n`: the number of columns to indent by

```javascript
man.paragraphHanging(5); //-> .HP 5
```

#### `.paragraphIndented(n, [tag])`
Starts a new indented paragraph with an optional starting "tag".

- `n`: the number of columns to indent
- `tag`: if specified, starts preceds the paragraph with a tag (or textual
  "icon") in the margin.

```javascript
man.paragraphIndented(4, '>'); //-> .IP > 4
```

#### `.writeRaw(...)`
> This is an internal method and may not pertain to your use-case

Writes some raw text to the output.

- `...`: the arguments to concatenate using a space, and then write

> **Does not perform textual replacements.**

```javascript
man.writeRaw('foo', 1234, true); //-> foo 1234 true
```

#### `.put(tag, ...)`
> This is an internal method and may not pertain to your use-case

Writes a tag and some arguments.

- `tag`: the tag to write (do not prepend `.`)
- `...`: arguments to pass to `formatArgument()` and then `writeRaw()`

Formats each argument using `.formatArgument()`.

```javascript
man.put('B', 'foobar', 3, true); //-> .B foobar 3 true
```

#### `.formatDate([date])`
> This is an internal method and may not pertain to your use-case

Formats a date to a `Month DD, YYYY` format.

- `date`: A valid date (see notes below). If not passed, `new Date()` is passed.

Can be passed a string (which is returned verbatim), a number (which is treated
as a Unix timestamp), or a
[`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
object.

Uses UTC offsets.

```javascript
man.formatDate() //-> August 28, 2015
```

#### `.formatArgument(str)`
> This is an internal method and may not pertain to your use-case

Formats a string as a single manpage tag argument. If the string has spaces, or
has a `.length === 0`, then it wraps it in double-quotes. Also performs various
textual replacements to keep things more standard (i.e. <sup>TM</sup> symbol
replacement, etc).

```javascript
man.formatArgument('foo bar.'); //-> "foo bar\."
```

## License
Licensed under the [MIT License](http://opensource.org/licenses/MIT).
You can find a copy of it in [LICENSE](LICENSE).

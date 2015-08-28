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

### `.header([title, [section, [data, [source, [manual]]]]])`
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

### `.writeRaw(...)`
> This is an internal method and may not pertain to your use-case

Writes some raw text to the output.

- `...`: the arguments to concatenate using a space, and then write

> **Does not perform textual replacements.**

```javascript
man.writeRaw('foo', 1234, true);
```

### `.put(tag, ...)`
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

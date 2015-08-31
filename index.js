'use strict';
/*
	Some notes:

	- Using the standard described at http://linux.die.net/man/7/man-pages
	- Manpages use American spelling conventions! This is specified in the
	  standard!
	- While this library doesn't enforce a .TH and a subsequent .SH NAME are
	  put in, they are still "required" and as such you should always be
	  placing them in.
	- Formatting operators use a 6 argument chunk, as it is a historical
	  portability concern. This is taken care of for you, though :)
*/

var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var sections = {
	command: 1,
	program: 1,
	sysCall: 2,
	systemCall: 2,
	libCall: 3,
	libraryCall: 3,
	library: 3,
	libc: 3,
	special: 4,
	device: 4,
	fileFormat: 5,
	format: 5,
	fileConvention: 5,
	game: 6,
	overview: 7,
	convention: 7,
	misc: 7,
	miscellaneous: 7,
	sys: 8,
	systemCommand: 8,
	system: 8,
	systemManagement: 8,
	administration: 8,
	admin: 8,
	root: 8,
	sudo: 8
};

var sources = {
	1: 'GNU',
	8: 'GNU',
	2: 'Linux',
	4: 'Linux'
};

var manuals = {
	2: 'Linux Programmer\'s Manual',
	3: 'Linux Programmer\'s Manual'
};

function Man(fn) {
	EventEmitter.call(this);

	if (fn) {
		this.on('data', fn);
	}
}

util.inherits(Man, EventEmitter);

Man.sections = sections;
Man.sources = sources;
Man.manuals = manuals;

var P = Man.prototype;

P.normalizeString = function (str) {
	str = str.replace(/\./g, '\\&.');
	str = str.replace('®', '\\*R');
	str = str.replace('™', '\\*Tm');
	str = str.replace('“', '\\*(lq');
	str = str.replace('”', '\\*(rq');
	return str;
};

P.formatArgument = function (str) {
	str = str.toString();
	if (!str.length || str.indexOf(' ') !== -1) {
		str = '"' + str.replace('"', '""') + '"';
	}

	return str;
};

var months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

P.formatDate = function (date) {
	if (date.constructor === String) {
		return date;
	}

	if (date.constructor === Number) {
		date = new Date(date);
	}

	return months[date.getUTCMonth()] + ' ' + date.getUTCDay() + ', ' +
		date.getUTCFullYear();
};

P.trimSpaces = function (str) {
	return str.replace(/^[\t\x20]+|[\t\x20]+$/g, '');
};

P.writeRaw = function () {
	this.emit('data', this.trimSpaces([].join.call(arguments, ' ')) + '\n');
	return this;
};

P.write = function () {
	var data = [].join.call(arguments, ' ');
	data = this.trimSpaces(data);
	data = this.normalizeString(data);
	data += os.EOL;
	this.emit('data', data);
	return this;
};

P.put = function (tag) {
	var args = [].slice.call(arguments, 1)
		.filter(function (a) {
			return a !== null && a !== undefined;
		}).map(P.formatArgument).join(' ');
	args = this.normalizeString(args);
	return this.writeRaw('.' + tag, args);
};

P.comment = function () {
	return this.writeRaw('\\."', [].slice.call(arguments));
};

P.header = function (title, section, date, source, manual) {
	title = title || 'Untitled';
	section = sections[section] || section || 7;
	date = date || new Date();
	source = source || sources[section] || 'Linux';
	manual = manual || manuals[section] || '';

	return this.put('TH',
			title.toUpperCase(),
			section,
			this.formatDate(date),
			source,
			manual);
};

P.section = function (name) {
	return this.put('SH', name.toUpperCase());
};

/*
	> headings capitalize the first word in heading, but otherwise use
	lower case, except where English usage (e.g., proper nouns) or
	programming language requirements (e.g., identifier names)
	dictate otherwise.

	Due to this, we do no formatting here.
*/
P.subSection = function (name) {
	return this.put('SS', name);
};

P.name = function (name, description) {
	this.section('name');
	return this.write(name, '\\-', description);
};

P.paragraph = function () {
	return this.put('PP');
};

P.formatFont = function (tag, str) {
	var words = str.split(/[\s\t]+/g);

	for (var i = 0, len = words.length; i < len; i += 6) {
		this.put.apply(this, [tag].concat(words.slice(i, i + 6)));
	}

	return this;
};

P.bold = function (str) {
	return this.formatFont('B', str);
};

P.strong = P.bold;

P.italics = function (str) {
	return this.formatFont('I', str);
};

P.italic = P.italics;
P.underline = P.italics;

P.small = function (str) {
	return this.formatFont('SM', str);
};

P.acronym = P.small;

/* warning - this might not do what you think it does! :) */
P.boldItalic = function (str) {
	return this.formatFont('BI', str);
};

/* warning - this might not do what you think it does! :) */
P.boldNormal = function (str) {
	return this.formatFont('BR', str);
};

/* warning - this might not do what you think it does! :) */
P.italicBold = function (str) {
	return this.formatFont('IB', str);
};

/* warning - this might not do what you think it does! :) */
P.italicNormal = function (str) {
	return this.formatFont('IR', str);
};

/* warning - this might not do what you think it does! :) */
P.normalBold = function (str) {
	return this.formatFont('RB', str);
};

/* warning - this might not do what you think it does! :) */
P.normalItalic = function (str) {
	return this.formatFont('RI', str);
};

/* warning - this might not do what you think it does! :) */
P.smallBold = function (str) {
	return this.formatFont('SB', str);
};

P.indentBegin = function (i) {
	return this.put('RS', i);
};

P.indentEnd = function () {
	return this.put('RE');
};

P.indent = function (i, str) {
	this.indentBegin(i);
	this.write(str);
	return this.indentEnd();
};

P.paragraphHanging = function (i) {
	return this.put('HP', i);
};

P.paragraphIndented = function (i, tag) {
	return this.put('IP', tag, i);
};

module.exports = Man;

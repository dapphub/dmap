(self["webpackChunk"] = self["webpackChunk"] || []).push([[697],{

/***/ 173:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*
syntax ::= RULE_EOL* rule+
rule ::= " "* "<" rule-name ">" " "* "::=" firstExpression otherExpression* " "* RULE_EOL+ " "*
firstExpression ::= " "* list
otherExpression ::= " "* "|" " "* list
RULE_EOL ::= "\r" | "\n"
list ::= term " "* list | term
term ::= literal | "<" rule-name ">"
literal ::= '"' RULE_CHARACTER1* '"' | "'" RULE_CHARACTER2* "'"
RULE_CHARACTER ::= " " | RULE_LETTER | RULE_DIGIT | RULE_SYMBOL
RULE_LETTER ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
RULE_DIGIT ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
RULE_SYMBOL ::= "-" | "_" | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | ":" | ";" | "<" | "=" | ">" | "?" | "@" | "[" | "\" | "]" | "^" | "_" | "`" | "{" | "|" | "}" | "~"
RULE_CHARACTER1 ::= RULE_CHARACTER | "'"
RULE_CHARACTER2 ::= RULE_CHARACTER | '"'
rule-name ::= RULE_LETTER RULE_CHAR*
RULE_CHAR ::= RULE_LETTER | RULE_DIGIT | "_" | "-"
*/
const SemanticHelpers_1 = __webpack_require__(241);
const Parser_1 = __webpack_require__(489);
var BNF;
(function (BNF) {
    BNF.RULES = [
        {
            name: 'syntax',
            bnf: [['RULE_EOL*', 'rule+']]
        },
        {
            name: 'rule',
            bnf: [
                [
                    '" "*',
                    '"<"',
                    'rule-name',
                    '">"',
                    '" "*',
                    '"::="',
                    'firstExpression',
                    'otherExpression*',
                    '" "*',
                    'RULE_EOL+',
                    '" "*'
                ]
            ]
        },
        {
            name: 'firstExpression',
            bnf: [['" "*', 'list']]
        },
        {
            name: 'otherExpression',
            bnf: [['" "*', '"|"', '" "*', 'list']]
        },
        {
            name: 'RULE_EOL',
            bnf: [['"\\r"'], ['"\\n"']]
        },
        {
            name: 'list',
            bnf: [['term', '" "*', 'list'], ['term']]
        },
        {
            name: 'term',
            bnf: [['literal'], ['"<"', 'rule-name', '">"']]
        },
        {
            name: 'literal',
            bnf: [[`'"'`, 'RULE_CHARACTER1*', `'"'`], [`"'"`, 'RULE_CHARACTER2*', `"'"`]]
        },
        {
            name: 'RULE_CHARACTER',
            bnf: [['" "'], ['RULE_LETTER'], ['RULE_DIGIT'], ['RULE_SYMBOL']]
        },
        {
            name: 'RULE_LETTER',
            bnf: [
                ['"A"'],
                ['"B"'],
                ['"C"'],
                ['"D"'],
                ['"E"'],
                ['"F"'],
                ['"G"'],
                ['"H"'],
                ['"I"'],
                ['"J"'],
                ['"K"'],
                ['"L"'],
                ['"M"'],
                ['"N"'],
                ['"O"'],
                ['"P"'],
                ['"Q"'],
                ['"R"'],
                ['"S"'],
                ['"T"'],
                ['"U"'],
                ['"V"'],
                ['"W"'],
                ['"X"'],
                ['"Y"'],
                ['"Z"'],
                ['"a"'],
                ['"b"'],
                ['"c"'],
                ['"d"'],
                ['"e"'],
                ['"f"'],
                ['"g"'],
                ['"h"'],
                ['"i"'],
                ['"j"'],
                ['"k"'],
                ['"l"'],
                ['"m"'],
                ['"n"'],
                ['"o"'],
                ['"p"'],
                ['"q"'],
                ['"r"'],
                ['"s"'],
                ['"t"'],
                ['"u"'],
                ['"v"'],
                ['"w"'],
                ['"x"'],
                ['"y"'],
                ['"z"']
            ]
        },
        {
            name: 'RULE_DIGIT',
            bnf: [['"0"'], ['"1"'], ['"2"'], ['"3"'], ['"4"'], ['"5"'], ['"6"'], ['"7"'], ['"8"'], ['"9"']]
        },
        {
            name: 'RULE_SYMBOL',
            bnf: [
                ['"-"'],
                ['"_"'],
                ['"!"'],
                ['"#"'],
                ['"$"'],
                ['"%"'],
                ['"&"'],
                ['"("'],
                ['")"'],
                ['"*"'],
                ['"+"'],
                ['","'],
                ['"-"'],
                ['"."'],
                ['"/"'],
                ['":"'],
                ['";"'],
                ['"<"'],
                ['"="'],
                ['">"'],
                ['"?"'],
                ['"@"'],
                ['"["'],
                ['"\\"'],
                ['"]"'],
                ['"^"'],
                ['"_"'],
                ['"`"'],
                ['"{"'],
                ['"|"'],
                ['"}"'],
                ['"~"']
            ]
        },
        {
            name: 'RULE_CHARACTER1',
            bnf: [['RULE_CHARACTER'], [`"'"`]]
        },
        {
            name: 'RULE_CHARACTER2',
            bnf: [['RULE_CHARACTER'], [`'"'`]]
        },
        {
            name: 'rule-name',
            bnf: [['RULE_LETTER', 'RULE_CHAR*']]
        },
        {
            name: 'RULE_CHAR',
            bnf: [['RULE_LETTER'], ['RULE_DIGIT'], ['"_"'], ['"-"']]
        }
    ];
    BNF.defaultParser = new Parser_1.Parser(BNF.RULES, { debug: false });
    function getAllTerms(expr) {
        let terms = SemanticHelpers_1.findChildrenByType(expr, 'term').map(term => {
            return SemanticHelpers_1.findChildrenByType(term, 'literal').concat(SemanticHelpers_1.findChildrenByType(term, 'rule-name'))[0].text;
        });
        SemanticHelpers_1.findChildrenByType(expr, 'list').forEach(expr => {
            terms = terms.concat(getAllTerms(expr));
        });
        return terms;
    }
    function getRules(source, parser = BNF.defaultParser) {
        let ast = parser.getAST(source);
        if (!ast)
            throw new Error('Could not parse ' + source);
        if (ast.errors && ast.errors.length) {
            throw ast.errors[0];
        }
        let rules = SemanticHelpers_1.findChildrenByType(ast, 'rule');
        let ret = rules.map((rule) => {
            let name = SemanticHelpers_1.findChildrenByType(rule, 'rule-name')[0].text;
            let expressions = SemanticHelpers_1.findChildrenByType(rule, 'firstExpression').concat(SemanticHelpers_1.findChildrenByType(rule, 'otherExpression'));
            let bnf = [];
            expressions.forEach(expr => {
                bnf.push(getAllTerms(expr));
            });
            return {
                name: name,
                bnf
            };
        });
        if (!ret.some(x => x.name == 'EOL')) {
            ret.push({
                name: 'EOL',
                bnf: [['"\\r\\n"', '"\\r"', '"\\n"']]
            });
        }
        return ret;
    }
    BNF.getRules = getRules;
    function Transform(source, subParser = BNF.defaultParser) {
        return getRules(source.join(''), subParser);
    }
    BNF.Transform = Transform;
    class Parser extends Parser_1.Parser {
        constructor(source, options) {
            const subParser = options && options.debugRulesParser === true ? new Parser_1.Parser(BNF.RULES, { debug: true }) : BNF.defaultParser;
            super(getRules(source, subParser), options);
            this.source = source;
        }
        emitSource() {
            return this.source;
        }
    }
    BNF.Parser = Parser;
})(BNF || (BNF = {}));
exports["default"] = BNF;
//# sourceMappingURL=BNF.js.map

/***/ }),

/***/ 657:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://www.w3.org/TR/REC-xml/#NT-Name
// http://www.bottlecaps.de/rr/ui
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Grammar	::=	Production*
// Production	::=	NCName '::=' Choice
// NCName	::=	[http://www.w3.org/TR/xml-names/#NT-NCName]
// Choice	::=	SequenceOrDifference ( '|' SequenceOrDifference )*
// SequenceOrDifference	::=	(Item ( '-' Item | Item* ))?
// Item	::=	Primary ( '?' | '*' | '+' )?
// Primary	::=	NCName | StringLiteral | CharCode | CharClass | '(' Choice ')'
// StringLiteral	::=	'"' [^"]* '"' | "'" [^']* "'"
// CharCode	::=	'#x' [0-9a-fA-F]+
// CharClass	::=	'[' '^'? ( RULE_Char | CharCode | CharRange | CharCodeRange )+ ']'
// RULE_Char	::=	[http://www.w3.org/TR/xml#NT-RULE_Char]
// CharRange	::=	RULE_Char '-' ( RULE_Char - ']' )
// CharCodeRange	::=	CharCode '-' CharCode
// RULE_WHITESPACE	::=	RULE_S | Comment
// RULE_S	::=	#x9 | #xA | #xD | #x20
// Comment	::=	'/*' ( [^*] | '*'+ [^*/] )* '*'* '*/'
const TokenError_1 = __webpack_require__(217);
const Parser_1 = __webpack_require__(489);
var BNF;
(function (BNF) {
    BNF.RULES = [
        {
            name: 'Grammar',
            bnf: [['RULE_S*', 'Attributes?', 'RULE_S*', '%Atomic*', 'EOF']]
        },
        {
            name: '%Atomic',
            bnf: [['Production', 'RULE_S*']],
            fragment: true
        },
        {
            name: 'Production',
            bnf: [
                [
                    'NCName',
                    'RULE_S*',
                    '"::="',
                    'RULE_WHITESPACE*',
                    '%Choice',
                    'RULE_WHITESPACE*',
                    'Attributes?',
                    'RULE_EOL+',
                    'RULE_S*'
                ]
            ]
        },
        {
            name: 'NCName',
            bnf: [[/[a-zA-Z][a-zA-Z_0-9]*/]]
        },
        {
            name: 'Attributes',
            bnf: [['"{"', 'Attribute', '%Attributes*', 'RULE_S*', '"}"']]
        },
        {
            name: '%Attributes',
            bnf: [['RULE_S*', '","', 'Attribute']],
            fragment: true
        },
        {
            name: 'Attribute',
            bnf: [['RULE_S*', 'NCName', 'RULE_WHITESPACE*', '"="', 'RULE_WHITESPACE*', 'AttributeValue']]
        },
        {
            name: 'AttributeValue',
            bnf: [['NCName'], [/[1-9][0-9]*/]]
        },
        {
            name: '%Choice',
            bnf: [['SequenceOrDifference', '%_Choice_1*']],
            fragment: true
        },
        {
            name: '%_Choice_1',
            bnf: [['RULE_S*', '"|"', 'RULE_S*', 'SequenceOrDifference']],
            fragment: true
        },
        {
            name: 'SequenceOrDifference',
            bnf: [['%Item', 'RULE_WHITESPACE*', '%_Item_1?']]
        },
        {
            name: '%_Item_1',
            bnf: [['Minus', '%Item'], ['%Item*']],
            fragment: true
        },
        {
            name: 'Minus',
            bnf: [['"-"']]
        },
        {
            name: '%Item',
            bnf: [['RULE_WHITESPACE*', 'PrimaryPreDecoration?', '%Primary', 'PrimaryDecoration?']],
            fragment: true
        },
        {
            name: 'PrimaryDecoration',
            bnf: [['"?"'], ['"*"'], ['"+"']]
        },
        {
            name: 'PrimaryPreDecoration',
            bnf: [['"&"'], ['"!"'], ['"~"']]
        },
        {
            name: '%Primary',
            bnf: [['NCName'], ['StringLiteral'], ['CharCode'], ['CharClass'], ['SubItem']],
            fragment: true
        },
        {
            name: 'SubItem',
            bnf: [['"("', 'RULE_S*', '%Choice', 'RULE_S*', '")"']]
        },
        {
            name: 'StringLiteral',
            bnf: [[`'"'`, /[^"]*/, `'"'`], [`"'"`, /[^']*/, `"'"`]]
        },
        {
            name: 'CharCode',
            bnf: [['"#x"', /[0-9a-zA-Z]+/]]
        },
        {
            name: 'CharClass',
            bnf: [["'['", "'^'?", '%RULE_CharClass_1+', '"]"']]
        },
        {
            name: '%RULE_CharClass_1',
            bnf: [['CharCodeRange'], ['CharRange'], ['CharCode'], ['RULE_Char']],
            fragment: true
        },
        {
            name: 'RULE_Char',
            bnf: [[/\x09/], [/\x0A/], [/\x0D/], [/[\x20-\x5c]/], [/[\x5e-\uD7FF]/], [/[\uE000-\uFFFD]/]]
        },
        {
            name: 'CharRange',
            bnf: [['RULE_Char', '"-"', 'RULE_Char']]
        },
        {
            name: 'CharCodeRange',
            bnf: [['CharCode', '"-"', 'CharCode']]
        },
        {
            name: 'RULE_WHITESPACE',
            bnf: [['%RULE_WHITESPACE_CHAR*'], ['Comment', 'RULE_WHITESPACE*']]
        },
        {
            name: 'RULE_S',
            bnf: [['RULE_WHITESPACE', 'RULE_S*'], ['RULE_EOL', 'RULE_S*']]
        },
        {
            name: '%RULE_WHITESPACE_CHAR',
            bnf: [[/\x09/], [/\x20/]],
            fragment: true
        },
        {
            name: 'Comment',
            bnf: [['"/*"', '%RULE_Comment_Body*', '"*/"']]
        },
        {
            name: '%RULE_Comment_Body',
            bnf: [[/[^*]/], ['"*"+', /[^/]*/]],
            fragment: true
        },
        {
            name: 'RULE_EOL',
            bnf: [[/\x0D/, /\x0A/], [/\x0A/], [/\x0D/]]
        },
        {
            name: 'Link',
            bnf: [["'['", 'Url', "']'"]]
        },
        {
            name: 'Url',
            bnf: [[/[^\x5D:/?#]/, '"://"', /[^\x5D#]+/, '%Url1?']]
        },
        {
            name: '%Url1',
            bnf: [['"#"', 'NCName']],
            fragment: true
        }
    ];
    BNF.defaultParser = new Parser_1.Parser(BNF.RULES, { debug: false });
    const preDecorationRE = /^(!|&)/;
    const decorationRE = /(\?|\+|\*)$/;
    const subExpressionRE = /^%/;
    function getBNFRule(name, parser) {
        if (typeof name == 'string') {
            let decoration = decorationRE.exec(name);
            let preDecoration = preDecorationRE.exec(name);
            let preDecorationText = preDecoration ? preDecoration[0] : '';
            let decorationText = decoration ? decoration[0] + ' ' : '';
            let subexpression = subExpressionRE.test(name);
            if (subexpression) {
                let lonely = isLonelyRule(name, parser);
                if (lonely)
                    return preDecorationText + getBNFBody(name, parser) + decorationText;
                return preDecorationText + '(' + getBNFBody(name, parser) + ')' + decorationText;
            }
            return name.replace(preDecorationRE, preDecorationText);
        }
        else {
            return name.source
                .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
                .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
        }
    }
    /// Returns true if the rule is a string literal or regular expression without a descendant tree
    function isLonelyRule(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        return (rule &&
            rule.bnf.length == 1 &&
            rule.bnf[0].length == 1 &&
            (rule.bnf[0][0] instanceof RegExp || rule.bnf[0][0][0] == '"' || rule.bnf[0][0][0] == "'"));
    }
    function getBNFChoice(rules, parser) {
        return rules.map(x => getBNFRule(x, parser)).join(' ');
    }
    function getBNFBody(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        if (rule)
            return rule.bnf.map(x => getBNFChoice(x, parser)).join(' | ');
        return 'RULE_NOT_FOUND {' + name + '}';
    }
    function emit(parser) {
        let acumulator = [];
        parser.grammarRules.forEach(l => {
            if (!/^%/.test(l.name)) {
                let recover = l.recover ? ' { recoverUntil=' + l.recover + ' }' : '';
                acumulator.push(l.name + ' ::= ' + getBNFBody(l.name, parser) + recover);
            }
        });
        return acumulator.join('\n');
    }
    BNF.emit = emit;
    let subitems = 0;
    function restar(total, resta) {
        console.log('reberia restar ' + resta + ' a ' + total);
        throw new Error('Difference not supported yet');
    }
    function convertRegex(txt) {
        return new RegExp(txt
            .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
            .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
            .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
            .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1'));
    }
    function getSubItems(tmpRules, seq, parentName, parentAttributes) {
        let anterior = null;
        let bnfSeq = [];
        seq.children.forEach((x, i) => {
            if (x.type == 'Minus') {
                restar(anterior, x);
            }
            else {
            }
            let decoration = seq.children[i + 1];
            decoration = (decoration && decoration.type == 'PrimaryDecoration' && decoration.text) || '';
            let preDecoration = '';
            if (anterior && anterior.type == 'PrimaryPreDecoration') {
                preDecoration = anterior.text;
            }
            let pinned = preDecoration == '~' ? 1 : undefined;
            if (pinned) {
                preDecoration = '';
            }
            switch (x.type) {
                case 'SubItem':
                    let name = '%' + (parentName + subitems++);
                    createRule(tmpRules, x, name, parentAttributes);
                    bnfSeq.push(preDecoration + name + decoration);
                    break;
                case 'NCName':
                    bnfSeq.push(preDecoration + x.text + decoration);
                    break;
                case 'StringLiteral':
                    if (decoration || preDecoration || !/^['"/()a-zA-Z0-9&_.:=,+*\-\^\\]+$/.test(x.text)) {
                        bnfSeq.push(preDecoration + x.text + decoration);
                    }
                    else {
                        for (const c of x.text.slice(1, -1)) {
                            if (parentAttributes && parentAttributes["ignoreCase"] == "true" && /[a-zA-Z]/.test(c)) {
                                bnfSeq.push(new RegExp("[" + c.toUpperCase() + c.toLowerCase() + "]"));
                            }
                            else {
                                bnfSeq.push(new RegExp(Parser_1.escapeRegExp(c)));
                            }
                        }
                    }
                    break;
                case 'CharCode':
                case 'CharClass':
                    if (decoration || preDecoration) {
                        let newRule = {
                            name: '%' + (parentName + subitems++),
                            bnf: [[convertRegex(x.text)]],
                            pinned
                        };
                        tmpRules.push(newRule);
                        bnfSeq.push(preDecoration + newRule.name + decoration);
                    }
                    else {
                        bnfSeq.push(convertRegex(x.text));
                    }
                    break;
                case 'PrimaryPreDecoration':
                case 'PrimaryDecoration':
                    break;
                default:
                    throw new Error(' HOW SHOULD I PARSE THIS? ' + x.type + ' -> ' + JSON.stringify(x.text));
            }
            anterior = x;
        });
        return bnfSeq;
    }
    function createRule(tmpRules, token, name, parentAttributes = undefined) {
        let attrNode = token.children.filter(x => x.type == 'Attributes')[0];
        let attributes = {};
        if (attrNode) {
            attrNode.children.forEach(x => {
                let name = x.children.filter(x => x.type == 'NCName')[0].text;
                if (name in attributes) {
                    throw new TokenError_1.TokenError('Duplicated attribute ' + name, x);
                }
                else {
                    attributes[name] = x.children.filter(x => x.type == 'AttributeValue')[0].text;
                }
            });
        }
        let bnf = token.children.filter(x => x.type == 'SequenceOrDifference').map(s => getSubItems(tmpRules, s, name, parentAttributes ? parentAttributes : attributes));
        let rule = {
            name,
            bnf
        };
        if (name.indexOf('%') == 0)
            rule.fragment = true;
        if (attributes['recoverUntil']) {
            rule.recover = attributes['recoverUntil'];
            if (rule.bnf.length > 1)
                throw new TokenError_1.TokenError('only one-option productions are suitable for error recovering', token);
        }
        if ('pin' in attributes) {
            let num = parseInt(attributes['pin']);
            if (!isNaN(num)) {
                rule.pinned = num;
            }
            if (rule.bnf.length > 1)
                throw new TokenError_1.TokenError('only one-option productions are suitable for pinning', token);
        }
        if ('ws' in attributes) {
            rule.implicitWs = attributes['ws'] != 'explicit';
        }
        else {
            rule.implicitWs = null;
        }
        rule.fragment = rule.fragment || attributes['fragment'] == 'true';
        rule.simplifyWhenOneChildren = attributes['simplifyWhenOneChildren'] == 'true';
        tmpRules.push(rule);
    }
    function getRules(source, parser = BNF.defaultParser) {
        let ast = parser.getAST(source);
        if (!ast)
            throw new Error('Could not parse ' + source);
        if (ast.errors && ast.errors.length) {
            throw ast.errors[0];
        }
        let implicitWs = null;
        let attrNode = ast.children.filter(x => x.type == 'Attributes')[0];
        let attributes = {};
        if (attrNode) {
            attrNode.children.forEach(x => {
                let name = x.children.filter(x => x.type == 'NCName')[0].text;
                if (name in attributes) {
                    throw new TokenError_1.TokenError('Duplicated attribute ' + name, x);
                }
                else {
                    attributes[name] = x.children.filter(x => x.type == 'AttributeValue')[0].text;
                }
            });
        }
        implicitWs = attributes['ws'] == 'implicit';
        let tmpRules = [];
        ast.children.filter(x => x.type == 'Production').map((x) => {
            let name = x.children.filter(x => x.type == 'NCName')[0].text;
            createRule(tmpRules, x, name);
        });
        tmpRules.forEach(rule => {
            if (rule.implicitWs === null)
                rule.implicitWs = implicitWs;
        });
        return tmpRules;
    }
    BNF.getRules = getRules;
    function Transform(source, subParser = BNF.defaultParser) {
        return getRules(source.join(''), subParser);
    }
    BNF.Transform = Transform;
    class Parser extends Parser_1.Parser {
        constructor(source, options) {
            const subParser = options && options.debugRulesParser === true ? new Parser_1.Parser(BNF.RULES, { debug: true }) : BNF.defaultParser;
            super(getRules(source, subParser), options);
        }
        emitSource() {
            return emit(this);
        }
    }
    BNF.Parser = Parser;
})(BNF || (BNF = {}));
exports["default"] = BNF;
//# sourceMappingURL=Custom.js.map

/***/ }),

/***/ 575:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://www.w3.org/TR/REC-xml/#NT-Name
// http://www.bottlecaps.de/rr/ui
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Grammar	::=	Production*
// Production	::=	NCName '::=' Choice
// NCName	::=	[http://www.w3.org/TR/xml-names/#NT-NCName]
// Choice	::=	SequenceOrDifference ( '|' SequenceOrDifference )*
// SequenceOrDifference	::=	(Item ( '-' Item | Item* ))?
// Item	::=	Primary ( '?' | '*' | '+' )?
// Primary	::=	NCName | StringLiteral | CharCode | CharClass | '(' Choice ')'
// StringLiteral	::=	'"' [^"]* '"' | "'" [^']* "'"
// CharCode	::=	'#x' [0-9a-fA-F]+
// CharClass	::=	'[' '^'? ( RULE_Char | CharCode | CharRange | CharCodeRange )+ ']'
// RULE_Char	::=	[http://www.w3.org/TR/xml#NT-RULE_Char]
// CharRange	::=	RULE_Char '-' ( RULE_Char - ']' )
// CharCodeRange	::=	CharCode '-' CharCode
// RULE_WHITESPACE	::=	RULE_S | Comment
// RULE_S	::=	#x9 | #xA | #xD | #x20
// Comment	::=	'/*' ( [^*] | '*'+ [^*/] )* '*'* '*/'
const Parser_1 = __webpack_require__(489);
var BNF;
(function (BNF) {
    BNF.RULES = [
        {
            name: 'Grammar',
            bnf: [['RULE_S*', '%Atomic*', 'EOF']]
        },
        {
            name: '%Atomic',
            bnf: [['Production', 'RULE_S*']],
            fragment: true
        },
        {
            name: 'Production',
            bnf: [['NCName', 'RULE_S*', '"::="', 'RULE_WHITESPACE*', 'Choice', 'RULE_WHITESPACE*', 'RULE_EOL+', 'RULE_S*']]
        },
        {
            name: 'NCName',
            bnf: [[/[a-zA-Z][a-zA-Z_0-9]*/]]
        },
        {
            name: 'Choice',
            bnf: [['SequenceOrDifference', '%_Choice_1*']],
            fragment: true
        },
        {
            name: '%_Choice_1',
            bnf: [['RULE_WHITESPACE*', '"|"', 'RULE_WHITESPACE*', 'SequenceOrDifference']],
            fragment: true
        },
        {
            name: 'SequenceOrDifference',
            bnf: [['Item', 'RULE_WHITESPACE*', '%_Item_1?']]
        },
        {
            name: '%_Item_1',
            bnf: [['Minus', 'Item'], ['Item*']],
            fragment: true
        },
        {
            name: 'Minus',
            bnf: [['"-"']]
        },
        {
            name: 'Item',
            bnf: [['RULE_WHITESPACE*', '%Primary', 'PrimaryDecoration?']],
            fragment: true
        },
        {
            name: 'PrimaryDecoration',
            bnf: [['"?"'], ['"*"'], ['"+"']]
        },
        {
            name: 'DecorationName',
            bnf: [['"ebnf://"', /[^\x5D#]+/]]
        },
        {
            name: '%Primary',
            bnf: [['NCName'], ['StringLiteral'], ['CharCode'], ['CharClass'], ['SubItem']],
            fragment: true
        },
        {
            name: 'SubItem',
            bnf: [['"("', 'RULE_WHITESPACE*', 'Choice', 'RULE_WHITESPACE*', '")"']]
        },
        {
            name: 'StringLiteral',
            bnf: [[`'"'`, /[^"]*/, `'"'`], [`"'"`, /[^']*/, `"'"`]],
            pinned: 1
        },
        {
            name: 'CharCode',
            bnf: [['"#x"', /[0-9a-zA-Z]+/]]
        },
        {
            name: 'CharClass',
            bnf: [["'['", "'^'?", '%RULE_CharClass_1+', '"]"']]
        },
        {
            name: '%RULE_CharClass_1',
            bnf: [['CharCodeRange'], ['CharRange'], ['CharCode'], ['RULE_Char']],
            fragment: true
        },
        {
            name: 'RULE_Char',
            bnf: [[/\x09/], [/\x0A/], [/\x0D/], [/[\x20-\x5c]/], [/[\x5e-\uD7FF]/], [/[\uE000-\uFFFD]/]]
        },
        {
            name: 'CharRange',
            bnf: [['RULE_Char', '"-"', 'RULE_Char']]
        },
        {
            name: 'CharCodeRange',
            bnf: [['CharCode', '"-"', 'CharCode']]
        },
        {
            name: 'RULE_WHITESPACE',
            bnf: [['%RULE_WHITESPACE_CHAR*'], ['Comment', 'RULE_WHITESPACE*']]
        },
        {
            name: 'RULE_S',
            bnf: [['RULE_WHITESPACE', 'RULE_S*'], ['RULE_EOL', 'RULE_S*']]
        },
        {
            name: '%RULE_WHITESPACE_CHAR',
            bnf: [[/\x09/], [/\x20/]],
            fragment: true
        },
        {
            name: 'Comment',
            bnf: [['"/*"', '%RULE_Comment_Body*', '"*/"']]
        },
        {
            name: '%RULE_Comment_Body',
            bnf: [['!"*/"', /[^*]/]],
            fragment: true
        },
        {
            name: 'RULE_EOL',
            bnf: [[/\x0D/, /\x0A/], [/\x0A/], [/\x0D/]]
        },
        {
            name: 'Link',
            bnf: [["'['", 'Url', "']'"]]
        },
        {
            name: 'Url',
            bnf: [[/[^\x5D:/?#]/, '"://"', /[^\x5D#]+/, '%Url1?']]
        },
        {
            name: '%Url1',
            bnf: [['"#"', 'NCName']],
            fragment: true
        }
    ];
    BNF.defaultParser = new Parser_1.Parser(BNF.RULES, { debug: false });
    const preDecorationRE = /^(!|&)/;
    const decorationRE = /(\?|\+|\*)$/;
    const subExpressionRE = /^%/;
    function getBNFRule(name, parser) {
        if (typeof name == 'string') {
            if (preDecorationRE.test(name))
                return '';
            let subexpression = subExpressionRE.test(name);
            if (subexpression) {
                let decoration = decorationRE.exec(name);
                let decorationText = decoration ? decoration[0] + ' ' : '';
                let lonely = isLonelyRule(name, parser);
                if (lonely)
                    return getBNFBody(name, parser) + decorationText;
                return '(' + getBNFBody(name, parser) + ')' + decorationText;
            }
            return name;
        }
        else {
            return name.source
                .replace(/\\(?:x|u)([a-zA-Z0-9]+)/g, '#x$1')
                .replace(/\[\\(?:x|u)([a-zA-Z0-9]+)-\\(?:x|u)([a-zA-Z0-9]+)\]/g, '[#x$1-#x$2]');
        }
    }
    /// Returns true if the rule is a string literal or regular expression without a descendant tree
    function isLonelyRule(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        return (rule &&
            rule.bnf.length == 1 &&
            rule.bnf[0].length == 1 &&
            (rule.bnf[0][0] instanceof RegExp || rule.bnf[0][0][0] == '"' || rule.bnf[0][0][0] == "'"));
    }
    function getBNFChoice(rules, parser) {
        return rules.map(x => getBNFRule(x, parser)).join(' ');
    }
    function getBNFBody(name, parser) {
        let rule = Parser_1.findRuleByName(name, parser);
        if (rule)
            return rule.bnf.map(x => getBNFChoice(x, parser)).join(' | ');
        return 'RULE_NOT_FOUND {' + name + '}';
    }
    function emit(parser) {
        let acumulator = [];
        parser.grammarRules.forEach(l => {
            if (!/^%/.test(l.name)) {
                let recover = l.recover ? ' /* { recoverUntil=' + l.recover + ' } */' : '';
                acumulator.push(l.name + ' ::= ' + getBNFBody(l.name, parser) + recover);
            }
        });
        return acumulator.join('\n');
    }
    BNF.emit = emit;
    let subitems = 0;
    function restar(total, resta) {
        console.log('reberia restar ' + resta + ' a ' + total);
        throw new Error('Difference not supported yet');
    }
    function convertRegex(txt) {
        return new RegExp(txt
            .replace(/#x([a-zA-Z0-9]{4})/g, '\\u$1')
            .replace(/#x([a-zA-Z0-9]{3})/g, '\\u0$1')
            .replace(/#x([a-zA-Z0-9]{2})/g, '\\x$1')
            .replace(/#x([a-zA-Z0-9]{1})/g, '\\x0$1'));
    }
    function getSubItems(tmpRules, seq, parentName) {
        let anterior = null;
        let bnfSeq = [];
        seq.children.forEach((x, i) => {
            if (x.type == 'Minus') {
                restar(anterior, x);
            }
            else {
            }
            let decoration = seq.children[i + 1];
            decoration = (decoration && decoration.type == 'PrimaryDecoration' && decoration.text) || '';
            let preDecoration = '';
            switch (x.type) {
                case 'SubItem':
                    let name = '%' + (parentName + subitems++);
                    createRule(tmpRules, x, name);
                    bnfSeq.push(preDecoration + name + decoration);
                    break;
                case 'NCName':
                case 'StringLiteral':
                    bnfSeq.push(preDecoration + x.text + decoration);
                    break;
                case 'CharCode':
                case 'CharClass':
                    if (decoration || preDecoration) {
                        let newRule = {
                            name: '%' + (parentName + subitems++),
                            bnf: [[convertRegex(x.text)]]
                        };
                        tmpRules.push(newRule);
                        bnfSeq.push(preDecoration + newRule.name + decoration);
                    }
                    else {
                        bnfSeq.push(convertRegex(x.text));
                    }
                    break;
                case 'PrimaryDecoration':
                    break;
                default:
                    throw new Error(' HOW SHOULD I PARSE THIS? ' + x.type + ' -> ' + JSON.stringify(x.text));
            }
            anterior = x;
        });
        return bnfSeq;
    }
    function createRule(tmpRules, token, name) {
        let bnf = token.children.filter(x => x.type == 'SequenceOrDifference').map(s => getSubItems(tmpRules, s, name));
        let rule = {
            name,
            bnf
        };
        let recover = null;
        bnf.forEach(x => {
            recover = recover || x['recover'];
            delete x['recover'];
        });
        if (name.indexOf('%') == 0)
            rule.fragment = true;
        if (recover)
            rule.recover = recover;
        tmpRules.push(rule);
    }
    function getRules(source, parser = BNF.defaultParser) {
        let ast = parser.getAST(source);
        if (!ast)
            throw new Error('Could not parse ' + source);
        if (ast.errors && ast.errors.length) {
            throw ast.errors[0];
        }
        let tmpRules = [];
        ast.children.filter(x => x.type == 'Production').map((x) => {
            let name = x.children.filter(x => x.type == 'NCName')[0].text;
            createRule(tmpRules, x, name);
        });
        return tmpRules;
    }
    BNF.getRules = getRules;
    function Transform(source, subParser = BNF.defaultParser) {
        return getRules(source.join(''), subParser);
    }
    BNF.Transform = Transform;
    class Parser extends Parser_1.Parser {
        constructor(source, options) {
            const subParser = options && options.debugRulesParser === true ? new Parser_1.Parser(BNF.RULES, { debug: true }) : BNF.defaultParser;
            super(getRules(source, subParser), options);
        }
        emitSource() {
            return emit(this);
        }
    }
    BNF.Parser = Parser;
})(BNF || (BNF = {}));
exports["default"] = BNF;
//# sourceMappingURL=W3CEBNF.js.map

/***/ }),

/***/ 652:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var BNF_1 = __webpack_require__(173);
Object.defineProperty(exports, "BNF", ({ enumerable: true, get: function () { return BNF_1.default; } }));
var W3CEBNF_1 = __webpack_require__(575);
Object.defineProperty(exports, "W3C", ({ enumerable: true, get: function () { return W3CEBNF_1.default; } }));
var Custom_1 = __webpack_require__(657);
Object.defineProperty(exports, "Custom", ({ enumerable: true, get: function () { return Custom_1.default; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 489:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// https://www.ics.uci.edu/~pattis/ICS-33/lectures/ebnf.pdf
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Parser = exports.findRuleByName = exports.parseRuleName = exports.escapeRegExp = exports.readToken = void 0;
const UPPER_SNAKE_RE = /^[A-Z0-9_]+$/;
const decorationRE = /(\?|\+|\*)$/;
const preDecorationRE = /^(@|&|!)/;
const WS_RULE = 'WS';
const TokenError_1 = __webpack_require__(217);
function readToken(txt, expr) {
    let result = expr.exec(txt);
    if (result && result.index == 0) {
        if (result[0].length == 0 && expr.source.length > 0)
            return null;
        return {
            type: null,
            text: result[0],
            rest: txt.substr(result[0].length),
            start: 0,
            end: result[0].length - 1,
            fullText: result[0],
            errors: [],
            children: [],
            parent: null
        };
    }
    return null;
}
exports.readToken = readToken;
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
function fixRest(token) {
    token.rest = '';
    token.children && token.children.forEach(c => fixRest(c));
}
function fixPositions(token, start) {
    token.start += start;
    token.end += start;
    token.children && token.children.forEach(c => fixPositions(c, token.start));
}
function agregateErrors(errors, token) {
    if (token.errors && token.errors.length)
        token.errors.forEach(err => errors.push(err));
    token.children && token.children.forEach(tok => agregateErrors(errors, tok));
}
function parseRuleName(name) {
    let postDecoration = decorationRE.exec(name);
    let preDecoration = preDecorationRE.exec(name);
    let postDecorationText = (postDecoration && postDecoration[0]) || '';
    let preDecorationText = (preDecoration && preDecoration[0]) || '';
    let out = {
        raw: name,
        name: name.replace(decorationRE, '').replace(preDecorationRE, ''),
        isOptional: postDecorationText == '?' || postDecorationText == '*',
        allowRepetition: postDecorationText == '+' || postDecorationText == '*',
        atLeastOne: postDecorationText == '+',
        lookupPositive: preDecorationText == '&',
        lookupNegative: preDecorationText == '!',
        pinned: preDecorationText == '@',
        lookup: false,
        isLiteral: false
    };
    out.isLiteral = out.name[0] == "'" || out.name[0] == '"';
    out.lookup = out.lookupNegative || out.lookupPositive;
    return out;
}
exports.parseRuleName = parseRuleName;
function findRuleByName(name, parser) {
    let parsed = parseRuleName(name);
    return parser.cachedRules[parsed.name] || null;
}
exports.findRuleByName = findRuleByName;
/// Removes all the nodes starting with 'RULE_'
function stripRules(token, re) {
    if (token.children) {
        let localRules = token.children.filter(x => x.type && re.test(x.type));
        for (let i = 0; i < localRules.length; i++) {
            let indexOnChildren = token.children.indexOf(localRules[i]);
            if (indexOnChildren != -1) {
                token.children.splice(indexOnChildren, 1);
            }
        }
        token.children.forEach(c => stripRules(c, re));
    }
}
const ignoreMissingRules = ['EOF'];
class Parser {
    constructor(grammarRules, options) {
        this.grammarRules = grammarRules;
        this.options = options;
        this.cachedRules = {};
        this.debug = options ? options.debug === true : false;
        let errors = [];
        let neededRules = [];
        grammarRules.forEach(rule => {
            let parsedName = parseRuleName(rule.name);
            if (parsedName.name in this.cachedRules) {
                errors.push('Duplicated rule ' + parsedName.name);
                return;
            }
            else {
                this.cachedRules[parsedName.name] = rule;
            }
            if (!rule.bnf || !rule.bnf.length) {
                let error = 'Missing rule content, rule: ' + rule.name;
                if (errors.indexOf(error) == -1)
                    errors.push(error);
            }
            else {
                rule.bnf.forEach(options => {
                    if (typeof options[0] === 'string') {
                        let parsed = parseRuleName(options[0]);
                        if (parsed.name == rule.name) {
                            let error = 'Left recursion is not allowed, rule: ' + rule.name;
                            if (errors.indexOf(error) == -1)
                                errors.push(error);
                        }
                    }
                    options.forEach(option => {
                        if (typeof option == 'string') {
                            let name = parseRuleName(option);
                            if (!name.isLiteral &&
                                neededRules.indexOf(name.name) == -1 &&
                                ignoreMissingRules.indexOf(name.name) == -1)
                                neededRules.push(name.name);
                        }
                    });
                });
            }
            if (WS_RULE == rule.name)
                rule.implicitWs = false;
            if (rule.implicitWs) {
                if (neededRules.indexOf(WS_RULE) == -1)
                    neededRules.push(WS_RULE);
            }
            if (rule.recover) {
                if (neededRules.indexOf(rule.recover) == -1)
                    neededRules.push(rule.recover);
            }
        });
        neededRules.forEach(ruleName => {
            if (!(ruleName in this.cachedRules)) {
                errors.push('Missing rule ' + ruleName);
            }
        });
        if (errors.length)
            throw new Error(errors.join('\n'));
    }
    getAST(txt, target) {
        if (!target) {
            target = this.grammarRules.filter(x => !x.fragment && x.name.indexOf('%') != 0)[0].name;
        }
        let result = this.parse(txt, target);
        if (result) {
            agregateErrors(result.errors, result);
            fixPositions(result, 0);
            // REMOVE ALL THE TAGS MATCHING /^%/
            stripRules(result, /^%/);
            if (!this.options || !this.options.keepUpperRules)
                stripRules(result, UPPER_SNAKE_RE);
            let rest = result.rest;
            if (rest) {
                new TokenError_1.TokenError('Unexpected end of input: \n' + rest, result);
            }
            fixRest(result);
            result.rest = rest;
        }
        return result;
    }
    emitSource() {
        return 'CANNOT EMIT SOURCE FROM BASE Parser';
    }
    parse(txt, target, recursion = 0) {
        let out = null;
        let type = parseRuleName(target);
        let expr;
        let printable = this.debug && /*!isLiteral &*/ !UPPER_SNAKE_RE.test(type.name);
        printable &&
            console.log(new Array(recursion).join('│  ') + 'Trying to get ' + target + ' from ' + JSON.stringify(txt.split('\n')[0]));
        let realType = type.name;
        let targetLex = findRuleByName(type.name, this);
        if (type.name == 'EOF') {
            if (txt.length) {
                return null;
            }
            else if (txt.length == 0) {
                return {
                    type: 'EOF',
                    text: '',
                    rest: '',
                    start: 0,
                    end: 0,
                    fullText: '',
                    errors: [],
                    children: [],
                    parent: null
                };
            }
        }
        try {
            if (!targetLex && type.isLiteral) {
                // tslint:disable-next-line: no-eval
                let src = eval(type.name);
                if (src === '') {
                    return {
                        type: '%%EMPTY%%',
                        text: '',
                        rest: txt,
                        start: 0,
                        end: 0,
                        fullText: '',
                        errors: [],
                        children: [],
                        parent: null
                    };
                }
                expr = new RegExp(escapeRegExp(src));
                realType = null;
            }
        }
        catch (e) {
            if (e instanceof ReferenceError) {
                console.error(e);
            }
            return null;
        }
        if (expr) {
            let result = readToken(txt, expr);
            if (result) {
                result.type = realType;
                return result;
            }
        }
        else {
            let options = targetLex.bnf;
            if (options instanceof Array) {
                options.forEach(phases => {
                    if (out)
                        return;
                    let pinned = null;
                    let tmp = {
                        type: type.name,
                        text: '',
                        children: [],
                        end: 0,
                        errors: [],
                        fullText: '',
                        parent: null,
                        start: 0,
                        rest: txt
                    };
                    if (targetLex.fragment)
                        tmp.fragment = true;
                    let tmpTxt = txt;
                    let position = 0;
                    let allOptional = phases.length > 0;
                    let foundSomething = false;
                    for (let i = 0; i < phases.length; i++) {
                        if (typeof phases[i] == 'string') {
                            let localTarget = parseRuleName(phases[i]);
                            allOptional = allOptional && localTarget.isOptional;
                            let got;
                            let foundAtLeastOne = false;
                            do {
                                got = null;
                                if (targetLex.implicitWs) {
                                    got = this.parse(tmpTxt, localTarget.name, recursion + 1);
                                    if (!got) {
                                        let WS;
                                        do {
                                            WS = this.parse(tmpTxt, WS_RULE, recursion + 1);
                                            if (WS) {
                                                tmp.text = tmp.text + WS.text;
                                                tmp.end = tmp.text.length;
                                                WS.parent = tmp;
                                                tmp.children.push(WS);
                                                tmpTxt = tmpTxt.substr(WS.text.length);
                                                position += WS.text.length;
                                            }
                                            else {
                                                break;
                                            }
                                        } while (WS && WS.text.length);
                                    }
                                }
                                got = got || this.parse(tmpTxt, localTarget.name, recursion + 1);
                                // rule ::= "true" ![a-zA-Z]
                                // negative lookup, if it does not match, we should continue
                                if (localTarget.lookupNegative) {
                                    if (got)
                                        return /* cancel this path */;
                                    break;
                                }
                                if (localTarget.lookupPositive) {
                                    if (!got)
                                        return;
                                }
                                if (!got) {
                                    if (localTarget.isOptional)
                                        break;
                                    if (localTarget.atLeastOne && foundAtLeastOne)
                                        break;
                                }
                                if (got && targetLex.pinned == i + 1) {
                                    pinned = got;
                                    printable && console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' PINNED');
                                }
                                if (!got)
                                    got = this.parseRecovery(targetLex, tmpTxt, recursion + 1);
                                if (!got) {
                                    if (pinned) {
                                        out = tmp;
                                        got = {
                                            type: 'SyntaxError',
                                            text: tmpTxt,
                                            children: [],
                                            end: tmpTxt.length,
                                            errors: [],
                                            fullText: '',
                                            parent: null,
                                            start: 0,
                                            rest: ''
                                        };
                                        if (tmpTxt.length) {
                                            new TokenError_1.TokenError(`Unexpected end of input. Expecting ${localTarget.name} Got: ${tmpTxt}`, got);
                                        }
                                        else {
                                            new TokenError_1.TokenError(`Unexpected end of input. Missing ${localTarget.name}`, got);
                                        }
                                        printable &&
                                            console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' ' + JSON.stringify(got.text));
                                    }
                                    else {
                                        return;
                                    }
                                }
                                foundAtLeastOne = true;
                                foundSomething = true;
                                if (got.type == '%%EMPTY%%') {
                                    break;
                                }
                                got.start += position;
                                got.end += position;
                                if (!localTarget.lookupPositive && got.type) {
                                    if (got.fragment) {
                                        got.children &&
                                            got.children.forEach(x => {
                                                x.start += position;
                                                x.end += position;
                                                x.parent = tmp;
                                                tmp.children.push(x);
                                            });
                                    }
                                    else {
                                        got.parent = tmp;
                                        tmp.children.push(got);
                                    }
                                }
                                if (localTarget.lookup)
                                    got.lookup = true;
                                printable &&
                                    console.log(new Array(recursion + 1).join('│  ') + '└─ ' + got.type + ' ' + JSON.stringify(got.text));
                                // Eat it from the input stream, only if it is not a lookup
                                if (!localTarget.lookup && !got.lookup) {
                                    tmp.text = tmp.text + got.text;
                                    tmp.end = tmp.text.length;
                                    tmpTxt = tmpTxt.substr(got.text.length);
                                    position += got.text.length;
                                }
                                tmp.rest = tmpTxt;
                            } while (got && localTarget.allowRepetition && tmpTxt.length && !got.lookup);
                        } /* IS A REGEXP */
                        else {
                            let got = readToken(tmpTxt, phases[i]);
                            if (!got) {
                                return;
                            }
                            printable &&
                                console.log(new Array(recursion + 1).join('│  ') + '└> ' + JSON.stringify(got.text) + phases[i].source);
                            foundSomething = true;
                            got.start += position;
                            got.end += position;
                            tmp.text = tmp.text + got.text;
                            tmp.end = tmp.text.length;
                            tmpTxt = tmpTxt.substr(got.text.length);
                            position += got.text.length;
                            tmp.rest = tmpTxt;
                        }
                    }
                    if (foundSomething) {
                        out = tmp;
                        printable &&
                            console.log(new Array(recursion).join('│  ') + '├<─┴< PUSHING ' + out.type + ' ' + JSON.stringify(out.text));
                    }
                });
            }
            if (out && targetLex.simplifyWhenOneChildren && out.children.length == 1) {
                out = out.children[0];
            }
        }
        if (!out) {
            printable && console.log(target + ' NOT RESOLVED FROM ' + txt);
        }
        return out;
    }
    parseRecovery(recoverableToken, tmpTxt, recursion) {
        if (recoverableToken.recover && tmpTxt.length) {
            let printable = this.debug;
            printable &&
                console.log(new Array(recursion + 1).join('│  ') +
                    'Trying to recover until token ' +
                    recoverableToken.recover +
                    ' from ' +
                    JSON.stringify(tmpTxt.split('\n')[0] + tmpTxt.split('\n')[1]));
            let tmp = {
                type: 'SyntaxError',
                text: '',
                children: [],
                end: 0,
                errors: [],
                fullText: '',
                parent: null,
                start: 0,
                rest: ''
            };
            let got;
            do {
                got = this.parse(tmpTxt, recoverableToken.recover, recursion + 1);
                if (got) {
                    new TokenError_1.TokenError('Unexpected input: "' + tmp.text + `" Expecting: ${recoverableToken.name}`, tmp);
                    break;
                }
                else {
                    tmp.text = tmp.text + tmpTxt[0];
                    tmp.end = tmp.text.length;
                    tmpTxt = tmpTxt.substr(1);
                }
            } while (!got && tmpTxt.length > 0);
            if (tmp.text.length > 0 && got) {
                printable && console.log(new Array(recursion + 1).join('│  ') + 'Recovered text: ' + JSON.stringify(tmp.text));
                return tmp;
            }
        }
        return null;
    }
}
exports.Parser = Parser;
exports["default"] = Parser;
//# sourceMappingURL=Parser.js.map

/***/ }),

/***/ 241:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findChildrenByType = void 0;
/**
 * Finds all the direct childs of a specifyed type
 */
function findChildrenByType(token, type) {
    return token.children ? token.children.filter(x => x.type == type) : [];
}
exports.findChildrenByType = findChildrenByType;
//# sourceMappingURL=SemanticHelpers.js.map

/***/ }),

/***/ 217:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenError = void 0;
class TokenError extends Error {
    constructor(message, token) {
        super(message);
        this.message = message;
        this.token = token;
        if (token && token.errors)
            token.errors.push(this);
        else
            throw this;
    }
    inspect() {
        return 'SyntaxError: ' + this.message;
    }
}
exports.TokenError = TokenError;
//# sourceMappingURL=TokenError.js.map

/***/ }),

/***/ 425:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Parser_1 = __webpack_require__(489);
Object.defineProperty(exports, "Parser", ({ enumerable: true, get: function () { return Parser_1.Parser; } }));
var TokenError_1 = __webpack_require__(217);
Object.defineProperty(exports, "TokenError", ({ enumerable: true, get: function () { return TokenError_1.TokenError; } }));
exports.Grammars = __webpack_require__(652);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 338:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var INPUT_ERROR = 'input is invalid type';
  var FINALIZE_ERROR = 'finalize already called';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA3_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = __webpack_require__.g;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && "object" === 'object' && module.exports;
  var AMD =  true && __webpack_require__.amdO;
  var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
    0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
    2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
    2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
    2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];
  var CSHAKE_BYTEPAD = {
    '128': 168,
    '256': 136
  };

  if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };

  var createShakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    };
  };

  var createCshakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits, n, s) {
      return methods['cshake' + bits].update(message, outputBits, n, s)[outputType]();
    };
  };

  var createKmacOutputMethod = function (bits, padding, outputType) {
    return function (key, message, outputBits, s) {
      return methods['kmac' + bits].update(key, message, outputBits, s)[outputType]();
    };
  };

  var createOutputMethods = function (method, createMethod, bits, padding) {
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createMethod(bits, padding, type);
    }
    return method;
  };

  var createMethod = function (bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');
    method.create = function () {
      return new Keccak(bits, padding, bits);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    return createOutputMethods(method, createOutputMethod, bits, padding);
  };

  var createShakeMethod = function (bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits) {
      return new Keccak(bits, padding, outputBits);
    };
    method.update = function (message, outputBits) {
      return method.create(outputBits).update(message);
    };
    return createOutputMethods(method, createShakeOutputMethod, bits, padding);
  };

  var createCshakeMethod = function (bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createCshakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits, n, s) {
      if (!n && !s) {
        return methods['shake' + bits].create(outputBits);
      } else {
        return new Keccak(bits, padding, outputBits).bytepad([n, s], w);
      }
    };
    method.update = function (message, outputBits, n, s) {
      return method.create(outputBits, n, s).update(message);
    };
    return createOutputMethods(method, createCshakeOutputMethod, bits, padding);
  };

  var createKmacMethod = function (bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createKmacOutputMethod(bits, padding, 'hex');
    method.create = function (key, outputBits, s) {
      return new Kmac(bits, padding, outputBits).bytepad(['KMAC', s], w).bytepad([key], w);
    };
    method.update = function (key, message, outputBits, s) {
      return method.create(key, outputBits, s).update(message);
    };
    return createOutputMethods(method, createKmacOutputMethod, bits, padding);
  };

  var algorithms = [
    { name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod },
    { name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod },
    { name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod },
    { name: 'cshake', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createCshakeMethod },
    { name: 'kmac', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createKmacMethod }
  ];

  var methods = {}, methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits = algorithm.bits;
    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name + '_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
      if (algorithm.name !== 'sha3') {
        var newMethodName = algorithm.name + bits[j];
        methodNames.push(newMethodName);
        methods[newMethodName] = methods[methodName];
      }
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.finalized = false;
    this.block = 0;
    this.start = 0;
    this.blockCount = (1600 - (bits << 1)) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    if (this.finalized) {
      throw new Error(FINALIZE_ERROR);
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }
      notString = true;
    }
    var blocks = this.blocks, byteCount = this.byteCount, length = message.length,
      blockCount = this.blockCount, index = 0, s = this.s, i, code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;
        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }
      if (notString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }
      this.lastByteIndex = i;
      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];
        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }
        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }
    return this;
  };

  Keccak.prototype.encode = function (x, right) {
    var o = x & 255, n = 1;
    var bytes = [o];
    x = x >> 8;
    o = x & 255;
    while (o > 0) {
      bytes.unshift(o);
      x = x >> 8;
      o = x & 255;
      ++n;
    }
    if (right) {
      bytes.push(n);
    } else {
      bytes.unshift(n);
    }
    this.update(bytes);
    return bytes.length;
  };

  Keccak.prototype.encodeString = function (str) {
    var notString, type = typeof str;
    if (type !== 'string') {
      if (type === 'object') {
        if (str === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
          str = new Uint8Array(str);
        } else if (!Array.isArray(str)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }
      notString = true;
    }
    var bytes = 0, length = str.length;
    if (notString) {
      bytes = length;
    } else {
      for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        if (code < 0x80) {
          bytes += 1;
        } else if (code < 0x800) {
          bytes += 2;
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes += 3;
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
          bytes += 4;
        }
      }
    }
    bytes += this.encode(bytes * 8);
    this.update(str);
    return bytes;
  };

  Keccak.prototype.bytepad = function (strs, w) {
    var bytes = this.encode(w);
    for (var i = 0; i < strs.length; ++i) {
      bytes += this.encodeString(strs[i]);
    }
    var paddingBytes = w - bytes % w;
    var zeros = [];
    zeros.length = paddingBytes;
    this.update(zeros);
    return this;
  };

  Keccak.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];
    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];
      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }
    blocks[blockCount - 1] |= 0x80000000;
    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }
    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var hex = '', block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
          HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
          HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
          HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
      }
      if (j % blockCount === 0) {
        f(s);
        i = 0;
      }
    }
    if (extraBytes) {
      block = s[i];
      hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
      if (extraBytes > 1) {
        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
      }
      if (extraBytes > 2) {
        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
      }
    }
    return hex;
  };

  Keccak.prototype.arrayBuffer = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;
    if (extraBytes) {
      buffer = new ArrayBuffer((outputBlocks + 1) << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }
    var array = new Uint32Array(buffer);
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        array[j] = s[i];
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }
    return buffer;
  };

  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

  Keccak.prototype.digest = Keccak.prototype.array = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var array = [], offset, block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = (block >> 8) & 0xFF;
        array[offset + 2] = (block >> 16) & 0xFF;
        array[offset + 3] = (block >> 24) & 0xFF;
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      offset = j << 2;
      block = s[i];
      array[offset] = block & 0xFF;
      if (extraBytes > 1) {
        array[offset + 1] = (block >> 8) & 0xFF;
      }
      if (extraBytes > 2) {
        array[offset + 2] = (block >> 16) & 0xFF;
      }
    }
    return array;
  };

  function Kmac(bits, padding, outputBits) {
    Keccak.call(this, bits, padding, outputBits);
  }

  Kmac.prototype = new Keccak();

  Kmac.prototype.finalize = function () {
    this.encode(this.outputBits, true);
    return Keccak.prototype.finalize.call(this);
  };

  var f = function (s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
      b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
      b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
      b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;

      b0 = s[0];
      b1 = s[1];
      b32 = (s[11] << 4) | (s[10] >>> 28);
      b33 = (s[10] << 4) | (s[11] >>> 28);
      b14 = (s[20] << 3) | (s[21] >>> 29);
      b15 = (s[21] << 3) | (s[20] >>> 29);
      b46 = (s[31] << 9) | (s[30] >>> 23);
      b47 = (s[30] << 9) | (s[31] >>> 23);
      b28 = (s[40] << 18) | (s[41] >>> 14);
      b29 = (s[41] << 18) | (s[40] >>> 14);
      b20 = (s[2] << 1) | (s[3] >>> 31);
      b21 = (s[3] << 1) | (s[2] >>> 31);
      b2 = (s[13] << 12) | (s[12] >>> 20);
      b3 = (s[12] << 12) | (s[13] >>> 20);
      b34 = (s[22] << 10) | (s[23] >>> 22);
      b35 = (s[23] << 10) | (s[22] >>> 22);
      b16 = (s[33] << 13) | (s[32] >>> 19);
      b17 = (s[32] << 13) | (s[33] >>> 19);
      b48 = (s[42] << 2) | (s[43] >>> 30);
      b49 = (s[43] << 2) | (s[42] >>> 30);
      b40 = (s[5] << 30) | (s[4] >>> 2);
      b41 = (s[4] << 30) | (s[5] >>> 2);
      b22 = (s[14] << 6) | (s[15] >>> 26);
      b23 = (s[15] << 6) | (s[14] >>> 26);
      b4 = (s[25] << 11) | (s[24] >>> 21);
      b5 = (s[24] << 11) | (s[25] >>> 21);
      b36 = (s[34] << 15) | (s[35] >>> 17);
      b37 = (s[35] << 15) | (s[34] >>> 17);
      b18 = (s[45] << 29) | (s[44] >>> 3);
      b19 = (s[44] << 29) | (s[45] >>> 3);
      b10 = (s[6] << 28) | (s[7] >>> 4);
      b11 = (s[7] << 28) | (s[6] >>> 4);
      b42 = (s[17] << 23) | (s[16] >>> 9);
      b43 = (s[16] << 23) | (s[17] >>> 9);
      b24 = (s[26] << 25) | (s[27] >>> 7);
      b25 = (s[27] << 25) | (s[26] >>> 7);
      b6 = (s[36] << 21) | (s[37] >>> 11);
      b7 = (s[37] << 21) | (s[36] >>> 11);
      b38 = (s[47] << 24) | (s[46] >>> 8);
      b39 = (s[46] << 24) | (s[47] >>> 8);
      b30 = (s[8] << 27) | (s[9] >>> 5);
      b31 = (s[9] << 27) | (s[8] >>> 5);
      b12 = (s[18] << 20) | (s[19] >>> 12);
      b13 = (s[19] << 20) | (s[18] >>> 12);
      b44 = (s[29] << 7) | (s[28] >>> 25);
      b45 = (s[28] << 7) | (s[29] >>> 25);
      b26 = (s[38] << 8) | (s[39] >>> 24);
      b27 = (s[39] << 8) | (s[38] >>> 24);
      b8 = (s[48] << 14) | (s[49] >>> 18);
      b9 = (s[49] << 14) | (s[48] >>> 18);

      s[0] = b0 ^ (~b2 & b4);
      s[1] = b1 ^ (~b3 & b5);
      s[10] = b10 ^ (~b12 & b14);
      s[11] = b11 ^ (~b13 & b15);
      s[20] = b20 ^ (~b22 & b24);
      s[21] = b21 ^ (~b23 & b25);
      s[30] = b30 ^ (~b32 & b34);
      s[31] = b31 ^ (~b33 & b35);
      s[40] = b40 ^ (~b42 & b44);
      s[41] = b41 ^ (~b43 & b45);
      s[2] = b2 ^ (~b4 & b6);
      s[3] = b3 ^ (~b5 & b7);
      s[12] = b12 ^ (~b14 & b16);
      s[13] = b13 ^ (~b15 & b17);
      s[22] = b22 ^ (~b24 & b26);
      s[23] = b23 ^ (~b25 & b27);
      s[32] = b32 ^ (~b34 & b36);
      s[33] = b33 ^ (~b35 & b37);
      s[42] = b42 ^ (~b44 & b46);
      s[43] = b43 ^ (~b45 & b47);
      s[4] = b4 ^ (~b6 & b8);
      s[5] = b5 ^ (~b7 & b9);
      s[14] = b14 ^ (~b16 & b18);
      s[15] = b15 ^ (~b17 & b19);
      s[24] = b24 ^ (~b26 & b28);
      s[25] = b25 ^ (~b27 & b29);
      s[34] = b34 ^ (~b36 & b38);
      s[35] = b35 ^ (~b37 & b39);
      s[44] = b44 ^ (~b46 & b48);
      s[45] = b45 ^ (~b47 & b49);
      s[6] = b6 ^ (~b8 & b0);
      s[7] = b7 ^ (~b9 & b1);
      s[16] = b16 ^ (~b18 & b10);
      s[17] = b17 ^ (~b19 & b11);
      s[26] = b26 ^ (~b28 & b20);
      s[27] = b27 ^ (~b29 & b21);
      s[36] = b36 ^ (~b38 & b30);
      s[37] = b37 ^ (~b39 & b31);
      s[46] = b46 ^ (~b48 & b40);
      s[47] = b47 ^ (~b49 & b41);
      s[8] = b8 ^ (~b0 & b2);
      s[9] = b9 ^ (~b1 & b3);
      s[18] = b18 ^ (~b10 & b12);
      s[19] = b19 ^ (~b11 & b13);
      s[28] = b28 ^ (~b20 & b22);
      s[29] = b29 ^ (~b21 & b23);
      s[38] = b38 ^ (~b30 & b32);
      s[39] = b39 ^ (~b31 & b33);
      s[48] = b48 ^ (~b40 & b42);
      s[49] = b49 ^ (~b41 & b43);

      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  if (COMMON_JS) {
    module.exports = methods;
  } else {
    for (i = 0; i < methodNames.length; ++i) {
      root[methodNames[i]] = methods[methodNames[i]];
    }
    if (AMD) {
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return methods;
      }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
  }
})();


/***/ }),

/***/ 551:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fS": () => (/* binding */ equals),
/* harmony export */   "oQ": () => (/* binding */ coerce)
/* harmony export */ });
/* unused harmony exports isBinary, fromHex, toHex, fromString, toString, empty */
const empty = new Uint8Array(0);
const toHex = d => d.reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
const fromHex = hex => {
  const hexes = hex.match(/../g);
  return hexes ? new Uint8Array(hexes.map(b => parseInt(b, 16))) : empty;
};
const equals = (aa, bb) => {
  if (aa === bb)
    return true;
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }
  return true;
};
const coerce = o => {
  if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array')
    return o;
  if (o instanceof ArrayBuffer)
    return new Uint8Array(o);
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error('Unknown type, must be binary type');
};
const isBinary = o => o instanceof ArrayBuffer || ArrayBuffer.isView(o);
const fromString = str => new TextEncoder().encode(str);
const toString = b => new TextDecoder().decode(b);


/***/ }),

/***/ 598:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "CID": () => (/* binding */ CID)
});

// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/varint.js + 1 modules
var varint = __webpack_require__(209);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/hashes/digest.js
var hashes_digest = __webpack_require__(122);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/vendor/base-x.js
function base(ALPHABET, name) {
  if (ALPHABET.length >= 255) {
    throw new TypeError('Alphabet too long');
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + ' is ambiguous');
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256);
  var iFACTOR = Math.log(256) / Math.log(BASE);
  function encode(source) {
    if (source instanceof Uint8Array);
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array');
    }
    if (source.length === 0) {
      return '';
    }
    var zeroes = 0;
    var length = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    var b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      var carry = source[pbegin];
      var i = 0;
      for (var it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      pbegin++;
    }
    var it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== 'string') {
      throw new TypeError('Expected String');
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    if (source[psz] === ' ') {
      return;
    }
    var zeroes = 0;
    var length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    var size = (source.length - psz) * FACTOR + 1 >>> 0;
    var b256 = new Uint8Array(size);
    while (source[psz]) {
      var carry = BASE_MAP[source.charCodeAt(psz)];
      if (carry === 255) {
        return;
      }
      var i = 0;
      for (var it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      psz++;
    }
    if (source[psz] === ' ') {
      return;
    }
    var it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  }
  function decode(string) {
    var buffer = decodeUnsafe(string);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${ name } character`);
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;
/* harmony default export */ const base_x = (_brrp__multiformats_scope_baseX);
// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/bytes.js
var src_bytes = __webpack_require__(551);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base.js


class Encoder {
  constructor(name, prefix, baseEncode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }
  encode(bytes) {
    if (bytes instanceof Uint8Array) {
      return `${ this.prefix }${ this.baseEncode(bytes) }`;
    } else {
      throw Error('Unknown type, must be binary type');
    }
  }
}
class Decoder {
  constructor(name, prefix, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseDecode = baseDecode;
  }
  decode(text) {
    if (typeof text === 'string') {
      switch (text[0]) {
      case this.prefix: {
          return this.baseDecode(text.slice(1));
        }
      default: {
          throw Error(`Unable to decode multibase string ${ JSON.stringify(text) }, ${ this.name } decoder only supports inputs prefixed with ${ this.prefix }`);
        }
      }
    } else {
      throw Error('Can only multibase decode strings');
    }
  }
  or(decoder) {
    return or(this, decoder);
  }
}
class ComposedDecoder {
  constructor(decoders) {
    this.decoders = decoders;
  }
  or(decoder) {
    return or(this, decoder);
  }
  decode(input) {
    const prefix = input[0];
    const decoder = this.decoders[prefix];
    if (decoder) {
      return decoder.decode(input);
    } else {
      throw RangeError(`Unable to decode multibase string ${ JSON.stringify(input) }, only inputs prefixed with ${ Object.keys(this.decoders) } are supported`);
    }
  }
}
const or = (left, right) => new ComposedDecoder({
  ...left.decoders || { [left.prefix]: left },
  ...right.decoders || { [right.prefix]: right }
});
class Codec {
  constructor(name, prefix, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name, prefix, baseEncode);
    this.decoder = new Decoder(name, prefix, baseDecode);
  }
  encode(input) {
    return this.encoder.encode(input);
  }
  decode(input) {
    return this.decoder.decode(input);
  }
}
const from = ({name, prefix, encode, decode}) => new Codec(name, prefix, encode, decode);
const baseX = ({prefix, name, alphabet}) => {
  const {encode, decode} = base_x(alphabet, name);
  return from({
    prefix,
    name,
    encode,
    decode: text => (0,src_bytes/* coerce */.oQ)(decode(text))
  });
};
const decode = (string, alphabet, bitsPerChar, name) => {
  const codes = {};
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i;
  }
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError(`Non-${ name } character`);
    }
    buffer = buffer << bitsPerChar | value;
    bits += bitsPerChar;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= bitsPerChar || 255 & buffer << 8 - bits) {
    throw new SyntaxError('Unexpected end of data');
  }
  return out;
};
const encode = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === '=';
  const mask = (1 << bitsPerChar) - 1;
  let out = '';
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | data[i];
    bits += 8;
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & buffer >> bits];
    }
  }
  if (bits) {
    out += alphabet[mask & buffer << bitsPerChar - bits];
  }
  if (pad) {
    while (out.length * bitsPerChar & 7) {
      out += '=';
    }
  }
  return out;
};
const rfc4648 = ({name, prefix, bitsPerChar, alphabet}) => {
  return from({
    prefix,
    name,
    encode(input) {
      return encode(input, alphabet, bitsPerChar);
    },
    decode(input) {
      return decode(input, alphabet, bitsPerChar, name);
    }
  });
};
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base58.js

const base58btc = baseX({
  name: 'base58btc',
  prefix: 'z',
  alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
});
const base58flickr = baseX({
  name: 'base58flickr',
  prefix: 'Z',
  alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
});
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/bases/base32.js

const base32 = rfc4648({
  prefix: 'b',
  name: 'base32',
  alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
  bitsPerChar: 5
});
const base32upper = rfc4648({
  prefix: 'B',
  name: 'base32upper',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  bitsPerChar: 5
});
const base32pad = rfc4648({
  prefix: 'c',
  name: 'base32pad',
  alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
  bitsPerChar: 5
});
const base32padupper = rfc4648({
  prefix: 'C',
  name: 'base32padupper',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
  bitsPerChar: 5
});
const base32hex = rfc4648({
  prefix: 'v',
  name: 'base32hex',
  alphabet: '0123456789abcdefghijklmnopqrstuv',
  bitsPerChar: 5
});
const base32hexupper = rfc4648({
  prefix: 'V',
  name: 'base32hexupper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  bitsPerChar: 5
});
const base32hexpad = rfc4648({
  prefix: 't',
  name: 'base32hexpad',
  alphabet: '0123456789abcdefghijklmnopqrstuv=',
  bitsPerChar: 5
});
const base32hexpadupper = rfc4648({
  prefix: 'T',
  name: 'base32hexpadupper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
  bitsPerChar: 5
});
const base32z = rfc4648({
  prefix: 'h',
  name: 'base32z',
  alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
  bitsPerChar: 5
});
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/cid.js





class CID {
  constructor(version, code, multihash, bytes) {
    this.code = code;
    this.version = version;
    this.multihash = multihash;
    this.bytes = bytes;
    this.byteOffset = bytes.byteOffset;
    this.byteLength = bytes.byteLength;
    this.asCID = this;
    this._baseCache = new Map();
    Object.defineProperties(this, {
      byteOffset: cid_hidden,
      byteLength: cid_hidden,
      code: readonly,
      version: readonly,
      multihash: readonly,
      bytes: readonly,
      _baseCache: cid_hidden,
      asCID: cid_hidden
    });
  }
  toV0() {
    switch (this.version) {
    case 0: {
        return this;
      }
    default: {
        const {code, multihash} = this;
        if (code !== DAG_PB_CODE) {
          throw new Error('Cannot convert a non dag-pb CID to CIDv0');
        }
        if (multihash.code !== SHA_256_CODE) {
          throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0');
        }
        return CID.createV0(multihash);
      }
    }
  }
  toV1() {
    switch (this.version) {
    case 0: {
        const {code, digest} = this.multihash;
        const multihash = hashes_digest/* create */.Ue(code, digest);
        return CID.createV1(this.code, multihash);
      }
    case 1: {
        return this;
      }
    default: {
        throw Error(`Can not convert CID version ${ this.version } to version 0. This is a bug please report`);
      }
    }
  }
  equals(other) {
    return other && this.code === other.code && this.version === other.version && hashes_digest/* equals */.fS(this.multihash, other.multihash);
  }
  toString(base) {
    const {bytes, version, _baseCache} = this;
    switch (version) {
    case 0:
      return toStringV0(bytes, _baseCache, base || base58btc.encoder);
    default:
      return toStringV1(bytes, _baseCache, base || base32.encoder);
    }
  }
  toJSON() {
    return {
      code: this.code,
      version: this.version,
      hash: this.multihash.bytes
    };
  }
  get [Symbol.toStringTag]() {
    return 'CID';
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return 'CID(' + this.toString() + ')';
  }
  static isCID(value) {
    deprecate(/^0\.0/, IS_CID_DEPRECATION);
    return !!(value && (value[cidSymbol] || value.asCID === value));
  }
  get toBaseEncodedString() {
    throw new Error('Deprecated, use .toString()');
  }
  get codec() {
    throw new Error('"codec" property is deprecated, use integer "code" property instead');
  }
  get buffer() {
    throw new Error('Deprecated .buffer property, use .bytes to get Uint8Array instead');
  }
  get multibaseName() {
    throw new Error('"multibaseName" property is deprecated');
  }
  get prefix() {
    throw new Error('"prefix" property is deprecated');
  }
  static asCID(value) {
    if (value instanceof CID) {
      return value;
    } else if (value != null && value.asCID === value) {
      const {version, code, multihash, bytes} = value;
      return new CID(version, code, multihash, bytes || encodeCID(version, code, multihash.bytes));
    } else if (value != null && value[cidSymbol] === true) {
      const {version, multihash, code} = value;
      const digest = hashes_digest/* decode */.Jx(multihash);
      return CID.create(version, code, digest);
    } else {
      return null;
    }
  }
  static create(version, code, digest) {
    if (typeof code !== 'number') {
      throw new Error('String codecs are no longer supported');
    }
    switch (version) {
    case 0: {
        if (code !== DAG_PB_CODE) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${ DAG_PB_CODE }) block encoding`);
        } else {
          return new CID(version, code, digest, digest.bytes);
        }
      }
    case 1: {
        const bytes = encodeCID(version, code, digest.bytes);
        return new CID(version, code, digest, bytes);
      }
    default: {
        throw new Error('Invalid version');
      }
    }
  }
  static createV0(digest) {
    return CID.create(0, DAG_PB_CODE, digest);
  }
  static createV1(code, digest) {
    return CID.create(1, code, digest);
  }
  static decode(bytes) {
    const [cid, remainder] = CID.decodeFirst(bytes);
    if (remainder.length) {
      throw new Error('Incorrect length');
    }
    return cid;
  }
  static decodeFirst(bytes) {
    const specs = CID.inspectBytes(bytes);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = (0,src_bytes/* coerce */.oQ)(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error('Incorrect length');
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest = new hashes_digest/* Digest */.zZ(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid = specs.version === 0 ? CID.createV0(digest) : CID.createV1(specs.codec, digest);
    return [
      cid,
      bytes.subarray(specs.size)
    ];
  }
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length] = varint/* decode */.Jx(initialBytes.subarray(offset));
      offset += length;
      return i;
    };
    let version = next();
    let codec = DAG_PB_CODE;
    if (version === 18) {
      version = 0;
      offset = 0;
    } else if (version === 1) {
      codec = next();
    }
    if (version !== 0 && version !== 1) {
      throw new RangeError(`Invalid CID version ${ version }`);
    }
    const prefixSize = offset;
    const multihashCode = next();
    const digestSize = next();
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;
    return {
      version,
      codec,
      multihashCode,
      digestSize,
      multihashSize,
      size
    };
  }
  static parse(source, base) {
    const [prefix, bytes] = parseCIDtoBytes(source, base);
    const cid = CID.decode(bytes);
    cid._baseCache.set(prefix, source);
    return cid;
  }
}
const parseCIDtoBytes = (source, base) => {
  switch (source[0]) {
  case 'Q': {
      const decoder = base || base58btc;
      return [
        base58btc.prefix,
        decoder.decode(`${ base58btc.prefix }${ source }`)
      ];
    }
  case base58btc.prefix: {
      const decoder = base || base58btc;
      return [
        base58btc.prefix,
        decoder.decode(source)
      ];
    }
  case base32.prefix: {
      const decoder = base || base32;
      return [
        base32.prefix,
        decoder.decode(source)
      ];
    }
  default: {
      if (base == null) {
        throw Error('To parse non base32 or base58btc encoded CID multibase decoder must be provided');
      }
      return [
        source[0],
        base.decode(source)
      ];
    }
  }
};
const toStringV0 = (bytes, cache, base) => {
  const {prefix} = base;
  if (prefix !== base58btc.prefix) {
    throw Error(`Cannot string encode V0 in ${ base.name } encoding`);
  }
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid = base.encode(bytes).slice(1);
    cache.set(prefix, cid);
    return cid;
  } else {
    return cid;
  }
};
const toStringV1 = (bytes, cache, base) => {
  const {prefix} = base;
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid = base.encode(bytes);
    cache.set(prefix, cid);
    return cid;
  } else {
    return cid;
  }
};
const DAG_PB_CODE = 112;
const SHA_256_CODE = 18;
const encodeCID = (version, code, multihash) => {
  const codeOffset = varint/* encodingLength */.P$(version);
  const hashOffset = codeOffset + varint/* encodingLength */.P$(code);
  const bytes = new Uint8Array(hashOffset + multihash.byteLength);
  varint/* encodeTo */.mL(version, bytes, 0);
  varint/* encodeTo */.mL(code, bytes, codeOffset);
  bytes.set(multihash, hashOffset);
  return bytes;
};
const cidSymbol = Symbol.for('@ipld/js-cid/CID');
const readonly = {
  writable: false,
  configurable: false,
  enumerable: true
};
const cid_hidden = {
  writable: false,
  enumerable: false,
  configurable: false
};
const version = '0.0.0-dev';
const deprecate = (range, message) => {
  if (range.test(version)) {
    console.warn(message);
  } else {
    throw new Error(message);
  }
};
const IS_CID_DEPRECATION = `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`;

/***/ }),

/***/ 122:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Jx": () => (/* binding */ decode),
/* harmony export */   "Ue": () => (/* binding */ create),
/* harmony export */   "fS": () => (/* binding */ equals),
/* harmony export */   "zZ": () => (/* binding */ Digest)
/* harmony export */ });
/* harmony import */ var _bytes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(551);
/* harmony import */ var _varint_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(209);


const create = (code, digest) => {
  const size = digest.byteLength;
  const sizeOffset = _varint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodingLength */ .P$(code);
  const digestOffset = sizeOffset + _varint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodingLength */ .P$(size);
  const bytes = new Uint8Array(digestOffset + size);
  _varint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeTo */ .mL(code, bytes, 0);
  _varint_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeTo */ .mL(size, bytes, sizeOffset);
  bytes.set(digest, digestOffset);
  return new Digest(code, size, digest, bytes);
};
const decode = multihash => {
  const bytes = (0,_bytes_js__WEBPACK_IMPORTED_MODULE_0__/* .coerce */ .oQ)(multihash);
  const [code, sizeOffset] = _varint_js__WEBPACK_IMPORTED_MODULE_1__/* .decode */ .Jx(bytes);
  const [size, digestOffset] = _varint_js__WEBPACK_IMPORTED_MODULE_1__/* .decode */ .Jx(bytes.subarray(sizeOffset));
  const digest = bytes.subarray(sizeOffset + digestOffset);
  if (digest.byteLength !== size) {
    throw new Error('Incorrect length');
  }
  return new Digest(code, size, digest, bytes);
};
const equals = (a, b) => {
  if (a === b) {
    return true;
  } else {
    return a.code === b.code && a.size === b.size && (0,_bytes_js__WEBPACK_IMPORTED_MODULE_0__/* .equals */ .fS)(a.bytes, b.bytes);
  }
};
class Digest {
  constructor(code, size, digest, bytes) {
    this.code = code;
    this.size = size;
    this.digest = digest;
    this.bytes = bytes;
  }
}

/***/ }),

/***/ 865:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "sha256": () => (/* binding */ sha256),
  "sha512": () => (/* binding */ sha512)
});

// EXTERNAL MODULE: ../node_modules/multiformats/esm/src/hashes/digest.js
var hashes_digest = __webpack_require__(122);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/hashes/hasher.js

const from = ({name, code, encode}) => new Hasher(name, code, encode);
class Hasher {
  constructor(name, code, encode) {
    this.name = name;
    this.code = code;
    this.encode = encode;
  }
  digest(input) {
    if (input instanceof Uint8Array) {
      const result = this.encode(input);
      return result instanceof Uint8Array ? hashes_digest/* create */.Ue(this.code, result) : result.then(digest => hashes_digest/* create */.Ue(this.code, digest));
    } else {
      throw Error('Unknown type, must be binary type');
    }
  }
}
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/hashes/sha2-browser.js

const sha = name => async data => new Uint8Array(await crypto.subtle.digest(name, data));
const sha256 = from({
  name: 'sha2-256',
  code: 18,
  encode: sha('SHA-256')
});
const sha512 = from({
  name: 'sha2-512',
  code: 19,
  encode: sha('SHA-512')
});

/***/ }),

/***/ 209:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Jx": () => (/* binding */ varint_decode),
  "mL": () => (/* binding */ encodeTo),
  "P$": () => (/* binding */ encodingLength)
});

;// CONCATENATED MODULE: ../node_modules/multiformats/esm/vendor/varint.js
var encode_1 = encode;
var MSB = 128, REST = 127, MSBALL = ~REST, INT = Math.pow(2, 31);
function encode(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;
  while (num >= INT) {
    out[offset++] = num & 255 | MSB;
    num /= 128;
  }
  while (num & MSBALL) {
    out[offset++] = num & 255 | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;
  encode.bytes = offset - oldOffset + 1;
  return out;
}
var decode = read;
var MSB$1 = 128, REST$1 = 127;
function read(buf, offset) {
  var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError('Could not decode varint');
    }
    b = buf[counter++];
    res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1);
  read.bytes = counter - offset;
  return res;
}
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var varint_length = function (value) {
  return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
};
var varint = {
  encode: encode_1,
  decode: decode,
  encodingLength: varint_length
};
var _brrp_varint = varint;
/* harmony default export */ const vendor_varint = (_brrp_varint);
;// CONCATENATED MODULE: ../node_modules/multiformats/esm/src/varint.js

const varint_decode = data => {
  const code = vendor_varint.decode(data);
  return [
    code,
    vendor_varint.decode.bytes
  ];
};
const encodeTo = (int, target, offset = 0) => {
  vendor_varint.encode(int, target, offset);
  return target;
};
const encodingLength = int => {
  return vendor_varint.encodingLength(int);
};

/***/ })

}]);
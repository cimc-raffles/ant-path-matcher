## Ant-style Path Matcher

Fork of unmaintained CommonJS [ant-path-matcher](https://github.com/cimc-raffles/ant-path-matcher/blob/master/index.js).
Test cases borrowed from [@howiefh/ant-path-matcher](https://github.com/howiefh/ant-path-matcher).

An implementation for Ant-style path patterns.  
Part of this mapping code has been kindly borrowed from [Apache Ant](https://ant.apache.org) and [Spring Framework](https://springframework.org).

The mapping matches URLs using the following rules:

- ? matches one character
- \* matches zero or more characters
- \*\* matches zero or more directories in a path
- {spring:[a-z]+} matches the regexp [a-z]+ as a path variable named "spring"

Some examples:

- com/t?st.jsp — matches com/test.jsp but also com/tast.jsp or com/txst.jsp
- com/\*.jsp — matches all .jsp files in the com directory
- com/\*\*/test.jsp — matches all test.jsp files underneath the com path
- org/springframework/\*_/_.jsp — matches all .jsp files underneath the org/springframework path
- org/\*\*/servlet/bla.jsp — matches org/springframework/servlet/bla.jsp but also org/springframework/testing/servlet/bla.jsp and org/servlet/bla.jsp
- com/{filename:\\w+}.jsp will match com/test.jsp and assign the value test to the filename variable

### Installation

```
npm install @maxbilbow/ant-path-matcher --save
```

### Usage

Compatible with CommonJS, ES6, and TypeScript.

```js
import AntPathMatcher from "ant-path-matcher";

const matcher = AntPathMatcher();

function match(pattern, path) {
  console.log(pattern, path, matcher.match(pattern, path));
}

match("/path/**/?z", "/path/x/y/z/xyz");

match("/foo/{id}/bar", "/foo/1/bar");
```

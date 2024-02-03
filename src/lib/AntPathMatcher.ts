/*
 * a transpiler from AntPathMatcher.java to JavaScript
 *
 * @see https://github.com/spring-projects/spring-framework/blob/master/spring-core/src/main/java/org/springframework/util/AntPathMatcher.java
 *
 */

import StringBuilder from "./StringBuilder.js";
import XRegExp from "xregexp";
export default AntPathMatcher;
export type PathMatcher = ReturnType<typeof AntPathMatcher>;

// quotemeta.addSupportTo(XRegExp);
// See https://github.com/slevithan/xregexp/issues/85#issuecomment-108592346
XRegExp.addToken(
  /\\Q([\s\S]*?)(?:\\E|$)/,
  function (match) {
    return XRegExp.escape(match[1]);
  },
  {
    scope: "all",
    leadChar: "\\",
  },
);

const caseSensitive = true;
const pathSeparator = "/";

function tokenizePath(path: string) {
  return path
    .split(pathSeparator)
    .filter((x) => x)
    .map((x) => x.trim());
}

function tokenizePattern(pattern: string) {
  return tokenizePath(pattern);
}

function patternQuote(s: string) {
  let slashEIndex = s.indexOf("\\E");
  if (slashEIndex == -1) return "\\Q" + s + "\\E";

  // var sb = new StringBuilder(s.length * 2);
  const sb = new StringBuilder();

  sb.append("\\Q");
  slashEIndex = 0;
  let current = 0;
  while ((slashEIndex = s.indexOf("\\E", current)) != -1) {
    sb.append(s.substring(current, slashEIndex));
    current = slashEIndex + 2;
    sb.append("\\E\\\\E\\Q");
  }
  sb.append(s.substring(current, s.length));
  sb.append("\\E");
  return sb.toString();
}

function quote(s: string, start: number, end: number) {
  if (start == end) return "";
  return patternQuote(s.substring(start, end));
}

function AntPathStringMatcher(pattern: string, caseSensitive: boolean) {
  // var GLOB_PATTERN = new XRegExp("\\?|\\*|\\{((?:\\{[^/]+?\\}|[^/{}]|\\\\[{}])+?)\\}") ;
  const GLOB_PATTERN = /\?|\*|\{((?:\{[^/]+?\}|[^/{}]|\\[{}])+?)\}/g;

  const DEFAULT_VARIABLE_PATTERN = "(.*)";

  const variableNames = [];

  const patternBuilder = new StringBuilder();
  let end = 0;

  let matcher;

  while (null != (matcher = GLOB_PATTERN.exec(pattern))) {
    patternBuilder.append(quote(pattern, end, matcher.index));
    const match = matcher[0];

    if ("?" == match) {
      patternBuilder.append(".");
    } else if ("*" == match) {
      patternBuilder.append(".*");
    } else if (match.startsWith("{") && match.endsWith("}")) {
      const colonIdx = match.indexOf(":");
      if (colonIdx == -1) {
        patternBuilder.append(DEFAULT_VARIABLE_PATTERN);
        variableNames.push(matcher[1]);
      } else {
        const variablePattern = match.substring(colonIdx + 1, match.length - 1);
        patternBuilder.append("(");
        patternBuilder.append(variablePattern);
        patternBuilder.append(")");
        const variableName = match.substring(1, colonIdx);
        variableNames.push(variableName);
      }
    }

    end = GLOB_PATTERN.lastIndex;
  }

  patternBuilder.append(quote(pattern, end, pattern.length));

  const pattern2 = caseSensitive
    ? XRegExp(patternBuilder.toString(), "g")
    : XRegExp(patternBuilder.toString(), "ig");

  const matchStrings = function (str: string) {
    // var b = o.pattern.test(str) ;
    const b = XRegExp("^" + pattern2.source + "$", "gm").test(str);
    return b;
  };

  return {
    pattern: pattern2,
    matchStrings,
  } as const;
}

function getStringMatcher(pattern: string) {
  return AntPathStringMatcher(pattern, caseSensitive);
}

function matchStrings(pattern: string, str: string) {
  return getStringMatcher(pattern).matchStrings(str);
}

function doMatch(pattern: string, path: unknown, fullMatch: boolean) {
  if (typeof path !== "string") {
    return false;
  }
  if (path.startsWith(pathSeparator) != pattern.startsWith(pathSeparator))
    return false;

  const pattDirs = tokenizePattern(pattern);
  const pathDirs = tokenizePath(path);

  let pattIdxStart = 0;
  let pattIdxEnd = pattDirs.length - 1;
  let pathIdxStart = 0;
  let pathIdxEnd = pathDirs.length - 1;

  // Match all elements up to the first **
  while (pattIdxStart <= pattIdxEnd && pathIdxStart <= pathIdxEnd) {
    const pattDir = pattDirs[pattIdxStart];

    if ("**" == pattDir) break;

    if (!matchStrings(pattDir, pathDirs[pathIdxStart])) return false;

    pattIdxStart++;
    pathIdxStart++;
  }

  if (pathIdxStart > pathIdxEnd) {
    // Path is exhausted, only match if rest of pattern is * or **'s
    if (pattIdxStart > pattIdxEnd) {
      return pattern.endsWith(pathSeparator) == path.endsWith(pathSeparator);
    }
    if (!fullMatch) {
      return true;
    }
    if (
      pattIdxStart == pattIdxEnd &&
      pattDirs[pattIdxStart] == "*" &&
      path.endsWith(pathSeparator)
    ) {
      return true;
    }
    for (let i = pattIdxStart; i <= pattIdxEnd; i++) {
      if (!(pattDirs[i] == "**")) {
        return false;
      }
    }
    return true;
  } else if (pattIdxStart > pattIdxEnd) {
    // String not exhausted, but pattern is. Failure.
    return false;
  } else if (!(fullMatch && "**" == pattDirs[pattIdxStart])) {
    // Path start definitely matches due to "**" part in pattern.
    return true;
  }

  // up to last '**'
  while (pattIdxStart <= pattIdxEnd && pathIdxStart <= pathIdxEnd) {
    const pattDir = pattDirs[pattIdxEnd];
    if (pattDir == "**") {
      break;
    }
    if (!matchStrings(pattDir, pathDirs[pathIdxEnd])) {
      return false;
    }
    pattIdxEnd--;
    pathIdxEnd--;
  }

  if (pathIdxStart > pathIdxEnd) {
    // String is exhausted
    for (let i = pattIdxStart; i <= pattIdxEnd; i++) {
      if (!(pattDirs[i] == "**")) {
        return false;
      }
    }
    return true;
  }

  while (pattIdxStart != pattIdxEnd && pathIdxStart <= pathIdxEnd) {
    let patIdxTmp = -1;
    for (let i = pattIdxStart + 1; i <= pattIdxEnd; i++) {
      if (pattDirs[i] == "**") {
        patIdxTmp = i;
        break;
      }
    }
    if (patIdxTmp == pattIdxStart + 1) {
      // '**/**' situation, so skip one
      pattIdxStart++;
      continue;
    }
    // Find the pattern between padIdxStart & padIdxTmp in str between
    // strIdxStart & strIdxEnd
    const patLength = patIdxTmp - pattIdxStart - 1;
    const strLength = pathIdxEnd - pathIdxStart + 1;
    let foundIdx = -1;

    strLoop: for (let i = 0; i <= strLength - patLength; i++) {
      for (let j = 0; j < patLength; j++) {
        const subPat = pattDirs[pattIdxStart + j + 1];
        const subStr = pathDirs[pathIdxStart + i + j];
        if (!matchStrings(subPat, subStr)) {
          continue strLoop;
        }
      }
      foundIdx = pathIdxStart + i;
      break;
    }

    if (foundIdx == -1) {
      return false;
    }

    pattIdxStart = patIdxTmp;
    pathIdxStart = foundIdx + patLength;
  }

  for (let i = pattIdxStart; i <= pattIdxEnd; i++) {
    if (!(pattDirs[i] == "**")) {
      return false;
    }
  }

  return true;
}

function AntPathMatcher() {
  return {
    match(pattern: string, path: string) {
      return doMatch(pattern, path, true);
    },
  } as const;
}

// console.log( antPathMatcher().match('/accounts/**/?z','/accounts/1/ss/s/xz') ) ;
// console.log( antPathMatcher().match('/accounts/{id}/path','/accounts/12')) ;

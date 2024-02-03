import AntPathMatcher, { type PathMatcher } from "../lib/main.js";
import { beforeEach, expect } from "@jest/globals";
let pathMatcher: PathMatcher;

beforeEach(() => {
  pathMatcher = AntPathMatcher();
});

const SCENARIOS = [
  // test exact matching
  ["test", "test", true],
  ["/test", "/test", true],
  // SPR-14141
  ["https://example.org", "https://example.org", true],
  ["test.jpg", "/test.jpg", false],
  ["test", "/test", false],
  ["/test", "test", false],
  // test matching with ?'s
  ["t?st", "test", true],
  ["??st", "test", true],
  ["tes?", "test", true],
  ["te??", "test", true],
  ["?es?", "test", true],
  ["tes?", "tes", false],
  ["tes?", "testt", false],
  ["tes?", "tsst", false],
  // test matching with *'s
  ["*", "test", true],
  ["test*", "test", true],
  ["test*", "testTest", true],
  ["test/*", "test/Test", true],
  ["test/*", "test/t", true],
  ["test/*", "test/", true],
  ["*test*", "AnothertestTest", true],
  ["*test", "Anothertest", true],
  ["*.*", "test.", true],
  ["*.*", "test.test", true],
  ["*.*", "test.test.test", true],
  ["test*aaa", "testblaaaa", true],
  ["test*", "tst", false],
  ["test*", "tsttest", false],
  ["test*", "test/", false],
  ["test*", "test/t", false],
  ["test/*", "test", false],
  ["*test*", "tsttst", false],
  ["*test", "tsttst", false],
  ["*.*", "tsttst", false],
  ["test*aaa", "test", false],
  ["test*aaa", "testblaaab", false],
  // test matching with ?'s and /'s
  ["/?", "/a", true],
  ["/?/a", "/a/a", true],
  ["/a/?", "/a/b", true],
  ["/??/a", "/aa/a", true],
  ["/a/??", "/a/bb", true],
  ["/?", "/a", true],
  // test matching with **'s
  ["/**", "/testing/testing", true],
  ["/*/**", "/testing/testing", true],
  ["/**/*", "/testing/testing", true],
  ["/bla/**/bla", "/bla/testing/testing/bla", true],
  ["/bla/**/bla", "/bla/testing/testing/bla/bla", true],
  ["/**/test", "/bla/bla/test", true],
  ["/bla/**/**/bla", "/bla/bla/bla/bla/bla/bla", true],
  ["/bla*bla/test", "/blaXXXbla/test", true],
  ["/*bla/test", "/XXXbla/test", true],
  ["/bla*bla/test", "/blaXXXbl/test", false],
  ["/*bla/test", "XXXblab/test", false],
  ["/*bla/test", "XXXbl/test", false],
  ["/????", "/bala/bla", false],
  ["/**/*bla", "/bla/bla/bla/bbb", false],
  [
    "/*bla*/**/bla/**",
    "/XXXblaXXXX/testing/testing/bla/testing/testing/",
    true,
  ],
  ["/*bla*/**/bla/*", "/XXXblaXXXX/testing/testing/bla/testing", true],
  ["/*bla*/**/bla/**", "/XXXblaXXXX/testing/testing/bla/testing/testing", true],
  [
    "/*bla*/**/bla/**",
    "/XXXblaXXXX/testing/testing/bla/testing/testing.jpg",
    true,
  ],
  ["*bla*/**/bla/**", "XXXblaXXXX/testing/testing/bla/testing/testing/", true],
  ["*bla*/**/bla/*", "XXXblaXXXX/testing/testing/bla/testing", true],
  ["*bla*/**/bla/**", "XXXblaXXXX/testing/testing/bla/testing/testing", true],
  ["*bla*/**/bla/*", "XXXblaXXXX/testing/testing/bla/testing/testing", false],
  ["/x/x/**/bla", "/x/x/x/", false],
  ["/foo/bar/**", "/foo/bar", true],
  ["", "", true],
  ["/{bla}.*", "/testing.html", true],
  ["/{bla}", "//x\ny", true],
] as const;

describe("test ant path matcher", () => {
  it.each(SCENARIOS)(
    "test pattern: %s, path: %s, result is %s",
    (pattern, path, result) => {
      expect(pathMatcher.match(pattern, path)).toBe(result);
    },
  );

  it.each([
    ["/test", null],
    ["/", null],
    [null, null],
    ["/test", undefined],
    ["/", undefined],
  ] as const as unknown[][])(
    "test pattern: %s, path: %s, result is false",
    (pattern, path) => {
      // @ts-expect-error covers accidental passing of null or undefined
      expect(pathMatcher.match(pattern, path)).toBe(false);
    },
  );
});

//   // SPR-14247
//   it('test matchWithTrimTokensEnabled', () => {
//     pathMatcher.setTrimTokens(true);

//     expect(pathMatcher.match("/foo/bar", "/foo /bar")).toBe(true);
//   });

//   it('test matchStart', () => {
//     // test exact matching
//     expect(pathMatcher.matchStart("test", "test")).toBe(true);
//     expect(pathMatcher.matchStart("/test", "/test")).toBe(true);
//     expect(pathMatcher.matchStart("/test.jpg", "test.jpg")).toBe(false);
//     expect(pathMatcher.matchStart("test", "/test")).toBe(false);
//     expect(pathMatcher.matchStart("/test", "test")).toBe(false);

//     // test matching with ?'s
//     expect(pathMatcher.matchStart("t?st", "test")).toBe(true);
//     expect(pathMatcher.matchStart("??st", "test")).toBe(true);
//     expect(pathMatcher.matchStart("tes?", "test")).toBe(true);
//     expect(pathMatcher.matchStart("te??", "test")).toBe(true);
//     expect(pathMatcher.matchStart("?es?", "test")).toBe(true);
//     expect(pathMatcher.matchStart("tes?", "tes")).toBe(false);
//     expect(pathMatcher.matchStart("tes?", "testt")).toBe(false);
//     expect(pathMatcher.matchStart("tes?", "tsst")).toBe(false);

//     // test matching with *'s
//     expect(pathMatcher.matchStart("*", "test")).toBe(true);
//     expect(pathMatcher.matchStart("test*", "test")).toBe(true);
//     expect(pathMatcher.matchStart("test*", "testTest")).toBe(true);
//     expect(pathMatcher.matchStart("test/*", "test/Test")).toBe(true);
//     expect(pathMatcher.matchStart("test/*", "test/t")).toBe(true);
//     expect(pathMatcher.matchStart("test/*", "test/")).toBe(true);
//     expect(pathMatcher.matchStart("*test*", "AnothertestTest")).toBe(true);
//     expect(pathMatcher.matchStart("*test", "Anothertest")).toBe(true);
//     expect(pathMatcher.matchStart("*.*", "test.")).toBe(true);
//     expect(pathMatcher.matchStart("*.*", "test.test")).toBe(true);
//     expect(pathMatcher.matchStart("*.*", "test.test.test")).toBe(true);
//     expect(pathMatcher.matchStart("test*aaa", "testblaaaa")).toBe(true);
//     expect(pathMatcher.matchStart("test*", "tst")).toBe(false);
//     expect(pathMatcher.matchStart("test*", "test/")).toBe(false);
//     expect(pathMatcher.matchStart("test*", "tsttest")).toBe(false);
//     expect(pathMatcher.matchStart("test*", "test/")).toBe(false);
//     expect(pathMatcher.matchStart("test*", "test/t")).toBe(false);
//     expect(pathMatcher.matchStart("test/*", "test")).toBe(true);
//     expect(pathMatcher.matchStart("test/t*.txt", "test")).toBe(true);
//     expect(pathMatcher.matchStart("*test*", "tsttst")).toBe(false);
//     expect(pathMatcher.matchStart("*test", "tsttst")).toBe(false);
//     expect(pathMatcher.matchStart("*.*", "tsttst")).toBe(false);
//     expect(pathMatcher.matchStart("test*aaa", "test")).toBe(false);
//     expect(pathMatcher.matchStart("test*aaa", "testblaaab")).toBe(false);

//     // test matching with ?'s and /'s
//     expect(pathMatcher.matchStart("/?", "/a")).toBe(true);
//     expect(pathMatcher.matchStart("/?/a", "/a/a")).toBe(true);
//     expect(pathMatcher.matchStart("/a/?", "/a/b")).toBe(true);
//     expect(pathMatcher.matchStart("/??/a", "/aa/a")).toBe(true);
//     expect(pathMatcher.matchStart("/a/??", "/a/bb")).toBe(true);
//     expect(pathMatcher.matchStart("/?", "/a")).toBe(true);

//     // test matching with **'s
//     expect(pathMatcher.matchStart("/**", "/testing/testing")).toBe(true);
//     expect(pathMatcher.matchStart("/*/**", "/testing/testing")).toBe(true);
//     expect(pathMatcher.matchStart("/**/*", "/testing/testing")).toBe(true);
//     expect(pathMatcher.matchStart("test*/**", "test/")).toBe(true);
//     expect(pathMatcher.matchStart("test*/**", "test/t")).toBe(true);
//     expect(pathMatcher.matchStart("/bla/**/bla", "/bla/testing/testing/bla")).toBe(true);
//     expect(pathMatcher.matchStart("/bla/**/bla", "/bla/testing/testing/bla/bla")).toBe(true);
//     expect(pathMatcher.matchStart("/**/test", "/bla/bla/test")).toBe(true);
//     expect(pathMatcher.matchStart("/bla/**/**/bla", "/bla/bla/bla/bla/bla/bla")).toBe(true);
//     expect(pathMatcher.matchStart("/bla*bla/test", "/blaXXXbla/test")).toBe(true);
//     expect(pathMatcher.matchStart("/*bla/test", "/XXXbla/test")).toBe(true);
//     expect(pathMatcher.matchStart("/bla*bla/test", "/blaXXXbl/test")).toBe(false);
//     expect(pathMatcher.matchStart("/*bla/test", "XXXblab/test")).toBe(false);
//     expect(pathMatcher.matchStart("/*bla/test", "XXXbl/test")).toBe(false);

//     expect(pathMatcher.matchStart("/????", "/bala/bla")).toBe(false);
//     expect(pathMatcher.matchStart("/**/*bla", "/bla/bla/bla/bbb")).toBe(true);

//     expect(pathMatcher.matchStart("/*bla*/**/bla/**", "/XXXblaXXXX/testing/testing/bla/testing/testing/")).toBe(true);
//     expect(pathMatcher.matchStart("/*bla*/**/bla/*", "/XXXblaXXXX/testing/testing/bla/testing")).toBe(true);
//     expect(pathMatcher.matchStart("/*bla*/**/bla/**", "/XXXblaXXXX/testing/testing/bla/testing/testing")).toBe(true);
//     expect(pathMatcher.matchStart("/*bla*/**/bla/**", "/XXXblaXXXX/testing/testing/bla/testing/testing.jpg")).toBe(true);

//     expect(pathMatcher.matchStart("*bla*/**/bla/**", "XXXblaXXXX/testing/testing/bla/testing/testing/")).toBe(true);
//     expect(pathMatcher.matchStart("*bla*/**/bla/*", "XXXblaXXXX/testing/testing/bla/testing")).toBe(true);
//     expect(pathMatcher.matchStart("*bla*/**/bla/**", "XXXblaXXXX/testing/testing/bla/testing/testing")).toBe(true);
//     expect(pathMatcher.matchStart("*bla*/**/bla/*", "XXXblaXXXX/testing/testing/bla/testing/testing")).toBe(true);

//     expect(pathMatcher.matchStart("/x/x/**/bla", "/x/x/x/")).toBe(true);

//     expect(pathMatcher.matchStart("", "")).toBe(true);
//   });

//   it('test uniqueDeliminator', () => {
//     pathMatcher.setPathSeparator(".");

//     // test exact matching
//     expect(pathMatcher.match("test", "test")).toBe(true);
//     expect(pathMatcher.match(".test", ".test")).toBe(true);
//     expect(pathMatcher.match(".test/jpg", "test/jpg")).toBe(false);
//     expect(pathMatcher.match("test", ".test")).toBe(false);
//     expect(pathMatcher.match(".test", "test")).toBe(false);

//     // test matching with ?'s
//     expect(pathMatcher.match("t?st", "test")).toBe(true);
//     expect(pathMatcher.match("??st", "test")).toBe(true);
//     expect(pathMatcher.match("tes?", "test")).toBe(true);
//     expect(pathMatcher.match("te??", "test")).toBe(true);
//     expect(pathMatcher.match("?es?", "test")).toBe(true);
//     expect(pathMatcher.match("tes?", "tes")).toBe(false);
//     expect(pathMatcher.match("tes?", "testt")).toBe(false);
//     expect(pathMatcher.match("tes?", "tsst")).toBe(false);

//     // test matching with *'s
//     expect(pathMatcher.match("*", "test")).toBe(true);
//     expect(pathMatcher.match("test*", "test")).toBe(true);
//     expect(pathMatcher.match("test*", "testTest")).toBe(true);
//     expect(pathMatcher.match("*test*", "AnothertestTest")).toBe(true);
//     expect(pathMatcher.match("*test", "Anothertest")).toBe(true);
//     expect(pathMatcher.match("*/*", "test/")).toBe(true);
//     expect(pathMatcher.match("*/*", "test/test")).toBe(true);
//     expect(pathMatcher.match("*/*", "test/test/test")).toBe(true);
//     expect(pathMatcher.match("test*aaa", "testblaaaa")).toBe(true);
//     expect(pathMatcher.match("test*", "tst")).toBe(false);
//     expect(pathMatcher.match("test*", "tsttest")).toBe(false);
//     expect(pathMatcher.match("*test*", "tsttst")).toBe(false);
//     expect(pathMatcher.match("*test", "tsttst")).toBe(false);
//     expect(pathMatcher.match("*/*", "tsttst")).toBe(false);
//     expect(pathMatcher.match("test*aaa", "test")).toBe(false);
//     expect(pathMatcher.match("test*aaa", "testblaaab")).toBe(false);

//     // test matching with ?'s and .'s
//     expect(pathMatcher.match(".?", ".a")).toBe(true);
//     expect(pathMatcher.match(".?.a", ".a.a")).toBe(true);
//     expect(pathMatcher.match(".a.?", ".a.b")).toBe(true);
//     expect(pathMatcher.match(".??.a", ".aa.a")).toBe(true);
//     expect(pathMatcher.match(".a.??", ".a.bb")).toBe(true);
//     expect(pathMatcher.match(".?", ".a")).toBe(true);

//     // test matching with **'s
//     expect(pathMatcher.match(".**", ".testing.testing")).toBe(true);
//     expect(pathMatcher.match(".*.**", ".testing.testing")).toBe(true);
//     expect(pathMatcher.match(".**.*", ".testing.testing")).toBe(true);
//     expect(pathMatcher.match(".bla.**.bla", ".bla.testing.testing.bla")).toBe(true);
//     expect(pathMatcher.match(".bla.**.bla", ".bla.testing.testing.bla.bla")).toBe(true);
//     expect(pathMatcher.match(".**.test", ".bla.bla.test")).toBe(true);
//     expect(pathMatcher.match(".bla.**.**.bla", ".bla.bla.bla.bla.bla.bla")).toBe(true);
//     expect(pathMatcher.match(".bla*bla.test", ".blaXXXbla.test")).toBe(true);
//     expect(pathMatcher.match(".*bla.test", ".XXXbla.test")).toBe(true);
//     expect(pathMatcher.match(".bla*bla.test", ".blaXXXbl.test")).toBe(false);
//     expect(pathMatcher.match(".*bla.test", "XXXblab.test")).toBe(false);
//     expect(pathMatcher.match(".*bla.test", "XXXbl.test")).toBe(false);
//   });

//   it('test extractPathWithinPattern', () => {
//     expect(pathMatcher.extractPathWithinPattern("/docs/commit.html", "/docs/commit.html")).toEqual("");

//     expect(pathMatcher.extractPathWithinPattern("/docs/*", "/docs/cvs/commit")).toEqual("cvs/commit");
//     expect(pathMatcher.extractPathWithinPattern("/docs/cvs/*.html", "/docs/cvs/commit.html")).toEqual("commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/docs/**", "/docs/cvs/commit")).toEqual("cvs/commit");
//     expect(pathMatcher.extractPathWithinPattern("/docs/**/*.html", "/docs/cvs/commit.html")).toEqual("cvs/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/docs/**/*.html", "/docs/commit.html")).toEqual("commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/*.html", "/commit.html")).toEqual("commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/*.html", "/docs/commit.html")).toEqual("docs/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("*.html", "/commit.html")).toEqual("/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("*.html", "/docs/commit.html")).toEqual("/docs/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("**/*.*", "/docs/commit.html")).toEqual("/docs/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("*", "/docs/commit.html")).toEqual("/docs/commit.html");
//     // SPR-10515
//     expect(pathMatcher.extractPathWithinPattern("**/commit.html", "/docs/cvs/other/commit.html")).toEqual("/docs/cvs/other/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/docs/**/commit.html", "/docs/cvs/other/commit.html")).toEqual("cvs/other/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/docs/**/**/**/**", "/docs/cvs/other/commit.html")).toEqual("cvs/other/commit.html");

//     expect(pathMatcher.extractPathWithinPattern("/d?cs/*", "/docs/cvs/commit")).toEqual("docs/cvs/commit");
//     expect(pathMatcher.extractPathWithinPattern("/docs/c?s/*.html", "/docs/cvs/commit.html")).toEqual("cvs/commit.html");
//     expect(pathMatcher.extractPathWithinPattern("/d?cs/**", "/docs/cvs/commit")).toEqual("docs/cvs/commit");
//     expect(pathMatcher.extractPathWithinPattern("/d?cs/**/*.html", "/docs/cvs/commit.html")).toEqual("docs/cvs/commit.html");
//   });

//   it('test extractUriTemplateVariables', () => {
//     var result = pathMatcher.extractUriTemplateVariables("/hotels/{hotel}", "/hotels/1");
//     expect(result).toEqual({"hotel": "1"});

//     result = pathMatcher.extractUriTemplateVariables("/h?tels/{hotel}", "/hotels/1");
//     expect(result).toEqual({"hotel": "1"});

//     result = pathMatcher.extractUriTemplateVariables("/hotels/{hotel}/bookings/{booking}", "/hotels/1/bookings/2");
//     expect(result).toEqual({"hotel": "1", "booking": "2"});

//     result = pathMatcher.extractUriTemplateVariables("/**/hotels/**/{hotel}", "/foo/hotels/bar/1");
//     expect(result).toEqual({"hotel": "1"});

//     result = pathMatcher.extractUriTemplateVariables("/{page}.html", "/42.html");
//     expect(result).toEqual({"page": "42"});

//     result = pathMatcher.extractUriTemplateVariables("/{page}.*", "/42.html");
//     expect(result).toEqual({"page": "42"});

//     result = pathMatcher.extractUriTemplateVariables("/A-{B}-C", "/A-b-C");
//     expect(result).toEqual({"B": "b"});

//     result = pathMatcher.extractUriTemplateVariables("/{name}.{extension}", "/test.html");
//     expect(result).toEqual({"name": "test", "extension": "html"});
//   });

//   it('test extractUriTemplateVariablesRegex', () => {
//     var result = pathMatcher.extractUriTemplateVariables("{symbolicName:[\\w\\.]+}-{version:[\\w\\.]+}.jar", "com.example-1.0.0.jar");
//     expect(result["symbolicName"]).toEqual("com.example");
//     expect(result["version"]).toEqual("1.0.0");

//     result = pathMatcher.extractUriTemplateVariables("{symbolicName:[\\w\\.]+}-sources-{version:[\\w\\.]+}.jar", "com.example-sources-1.0.0.jar");
//     expect(result["symbolicName"]).toEqual("com.example");
//     expect(result["version"]).toEqual("1.0.0");
//   });

//   /**
//    * SPR-7787
//    */
//   it('test extractUriTemplateVarsRegexQualifiers', () => {
//     var result = pathMatcher.extractUriTemplateVariables("{symbolicName:[\\p{L}\\.]+}-sources-{version:[\\p{N}\\.]+}.jar", "com.example-sources-1.0.0.jar");
//     expect(result["symbolicName"]).toEqual("com.example");
//     expect(result["version"]).toEqual("1.0.0");

//     result = pathMatcher.extractUriTemplateVariables("{symbolicName:[\\w\\.]+}-sources-{version:[\\d\\.]+}-{year:\\d{4}}{month:\\d{2}}{day:\\d{2}}.jar", "com.example-sources-1.0.0-20100220.jar");
//     expect(result["symbolicName"]).toEqual("com.example");
//     expect(result["version"]).toEqual("1.0.0");
//     expect(result["year"]).toEqual("2010");
//     expect(result["month"]).toEqual("02");
//     expect(result["day"]).toEqual("20");

//     result = pathMatcher.extractUriTemplateVariables("{symbolicName:[\\p{L}\\.]+}-sources-{version:[\\p{N}\\.\\{\\}]+}.jar", "com.example-sources-1.0.0.{12}.jar");
//     expect(result["symbolicName"]).toEqual("com.example");
//     expect(result["version"]).toEqual("1.0.0.{12}");
//   });

//   /**
//    * SPR-8455
//    */
//   it('test extractUriTemplateVarsRegexCapturingGroups', () => {
//     expect(() => {
//       pathMatcher.extractUriTemplateVariables("/web/{id:foo(bar)?}", "/web/foobar");
//     }).toThrow(/^The number of capturing groups in the pattern/);
//   });

//   it('test combine', () => {
//     expect(pathMatcher.combine(null, null)).toEqual("");
//     expect(pathMatcher.combine("/hotels", null)).toEqual("/hotels");
//     expect(pathMatcher.combine(null, "/hotels")).toEqual("/hotels");
//     expect(pathMatcher.combine("/hotels/*", "booking")).toEqual("/hotels/booking");
//     expect(pathMatcher.combine("/hotels/*", "/booking")).toEqual("/hotels/booking");
//     expect(pathMatcher.combine("/hotels/**", "booking")).toEqual("/hotels/**/booking");
//     expect(pathMatcher.combine("/hotels/**", "/booking")).toEqual("/hotels/**/booking");
//     expect(pathMatcher.combine("/hotels", "/booking")).toEqual("/hotels/booking");
//     expect(pathMatcher.combine("/hotels", "booking")).toEqual("/hotels/booking");
//     expect(pathMatcher.combine("/hotels/", "booking")).toEqual("/hotels/booking");
//     expect(pathMatcher.combine("/hotels/*", "{hotel}")).toEqual("/hotels/{hotel}");
//     expect(pathMatcher.combine("/hotels/**", "{hotel}")).toEqual("/hotels/**/{hotel}");
//     expect(pathMatcher.combine("/hotels", "{hotel}")).toEqual("/hotels/{hotel}");
//     expect(pathMatcher.combine("/hotels", "{hotel}.*")).toEqual("/hotels/{hotel}.*");
//     expect(pathMatcher.combine("/hotels/*/booking", "{booking}")).toEqual("/hotels/*/booking/{booking}");
//     expect(pathMatcher.combine("/*.html", "/hotel.html")).toEqual("/hotel.html");
//     expect(pathMatcher.combine("/*.html", "/hotel")).toEqual("/hotel.html");
//     expect(pathMatcher.combine("/*.html", "/hotel.*")).toEqual("/hotel.html");
//     expect(pathMatcher.combine("/**", "/*.html")).toEqual("/*.html");
//     expect(pathMatcher.combine("/*", "/*.html")).toEqual("/*.html");
//     expect(pathMatcher.combine("/*.*", "/*.html")).toEqual("/*.html");
//     // SPR-8858
//     expect(pathMatcher.combine("/{foo}", "/bar")).toEqual("/{foo}/bar");
//     // SPR-7970
//     expect(pathMatcher.combine("/user", "/user")).toEqual("/user/user");
//     // SPR-10062
//     expect(pathMatcher.combine("/{foo:.*[^0-9].*}", "/edit/")).toEqual("/{foo:.*[^0-9].*}/edit/");
//     // SPR-10554
//     expect(pathMatcher.combine("/1.0", "/foo/test")).toEqual("/1.0/foo/test");
//     // SPR-12975
//     expect(pathMatcher.combine("/", "/hotel")).toEqual("/hotel");
//     // SPR-12975
//     expect(pathMatcher.combine("/hotel/", "/booking")).toEqual("/hotel/booking");
//   });

//   it('test combineWithTwoFileExtensionPatterns', () => {
//     expect(() => {
//       pathMatcher.combine("/*.html", "/*.txt");
//     }).toThrow(/^Cannot combine patterns/);
//   });

//   it('test patternComparator', () => {
//     var comparator = pathMatcher.getPatternComparator("/hotels/new");

//     expect(comparator.compare(null, null)).toEqual(0);
//     expect(comparator.compare(null, "/hotels/new")).toEqual(1);
//     expect(comparator.compare("/hotels/new", null)).toEqual(-1);

//     expect(comparator.compare("/hotels/new", "/hotels/new")).toEqual(0);

//     expect(comparator.compare("/hotels/new", "/hotels/*")).toEqual(-1);
//     expect(comparator.compare("/hotels/*", "/hotels/new")).toEqual(1);
//     expect(comparator.compare("/hotels/*", "/hotels/*")).toEqual(0);

//     expect(comparator.compare("/hotels/new", "/hotels/{hotel}")).toEqual(-1);
//     expect(comparator.compare("/hotels/{hotel}", "/hotels/new")).toEqual(1);
//     expect(comparator.compare("/hotels/{hotel}", "/hotels/{hotel}")).toEqual(0);
//     expect(comparator.compare("/hotels/{hotel}/booking", "/hotels/{hotel}/bookings/{booking}")).toEqual(-1);
//     expect(comparator.compare("/hotels/{hotel}/bookings/{booking}", "/hotels/{hotel}/booking")).toEqual(1);

//     // SPR-10550
//     expect(comparator.compare("/hotels/{hotel}/bookings/{booking}/cutomers/{customer}", "/**")).toEqual(-1);
//     expect(comparator.compare("/**", "/hotels/{hotel}/bookings/{booking}/cutomers/{customer}")).toEqual(1);
//     expect(comparator.compare("/**", "/**")).toEqual(0);

//     expect(comparator.compare("/hotels/{hotel}", "/hotels/*")).toEqual(-1);
//     expect(comparator.compare("/hotels/*", "/hotels/{hotel}")).toEqual(1);

//     expect(comparator.compare("/hotels/*", "/hotels/*/**")).toEqual(-1);
//     expect(comparator.compare("/hotels/*/**", "/hotels/*")).toEqual(1);

//     expect(comparator.compare("/hotels/new", "/hotels/new.*")).toEqual(-1);
//     expect(comparator.compare("/hotels/{hotel}", "/hotels/{hotel}.*")).toEqual(2);

//     // SPR-6741
//     expect(comparator.compare("/hotels/{hotel}/bookings/{booking}/cutomers/{customer}", "/hotels/**")).toEqual(-1);
//     expect(comparator.compare("/hotels/**", "/hotels/{hotel}/bookings/{booking}/cutomers/{customer}")).toEqual(1);
//     expect(comparator.compare("/hotels/foo/bar/**", "/hotels/{hotel}")).toEqual(1);
//     expect(comparator.compare("/hotels/{hotel}", "/hotels/foo/bar/**")).toEqual(-1);

//     // gh-23125
//     expect(comparator.compare("/hotels/*/bookings/**", "/hotels/**")).toEqual(-11);

//     // SPR-8683
//     expect(comparator.compare("/**", "/hotels/{hotel}")).toEqual(1);

//     // longer is better
//     expect(comparator.compare("/hotels", "/hotels2")).toEqual(1);

//     // SPR-13139
//     expect(comparator.compare("*", "*/**")).toEqual(-1);
//     expect(comparator.compare("*/**", "*")).toEqual(1);
//   });

//   it('test patternComparatorSort', () => {
//     var comparator = pathMatcher.getPatternComparator("/hotels/new");
//     var compare = comparator.compare;
//     compare = compare.bind(comparator);
//     var paths = [];

//     paths.push(null);
//     paths.push("/hotels/new");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toBeNull();
//     paths = [];

//     paths.push("/hotels/new");
//     paths.push(null);
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toBeNull();
//     paths = [];

//     paths.push("/hotels/*");
//     paths.push("/hotels/new");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toEqual("/hotels/*");
//     paths = [];

//     paths.push("/hotels/new");
//     paths.push("/hotels/*");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toEqual("/hotels/*");
//     paths = [];

//     paths.push("/hotels/**");
//     paths.push("/hotels/*");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/*");
//     expect(paths[1]).toEqual("/hotels/**");
//     paths = [];

//     paths.push("/hotels/*");
//     paths.push("/hotels/**");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/*");
//     expect(paths[1]).toEqual("/hotels/**");
//     paths = [];

//     paths.push("/hotels/{hotel}");
//     paths.push("/hotels/new");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toEqual("/hotels/{hotel}");
//     paths = [];

//     paths.push("/hotels/new");
//     paths.push("/hotels/{hotel}");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toEqual("/hotels/{hotel}");
//     paths = [];

//     paths.push("/hotels/*");
//     paths.push("/hotels/{hotel}");
//     paths.push("/hotels/new");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new");
//     expect(paths[1]).toEqual("/hotels/{hotel}");
//     expect(paths[2]).toEqual("/hotels/*");
//     paths = [];

//     paths.push("/hotels/ne*");
//     paths.push("/hotels/n*");
//     // shuffle
//     paths = paths.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/ne*");
//     expect(paths[1]).toEqual("/hotels/n*");
//     paths = [];

//     comparator = pathMatcher.getPatternComparator("/hotels/new.html");
//     var compare = comparator.compare;
//     compare = compare.bind(comparator);
//     paths.push("/hotels/new.*");
//     paths.push("/hotels/{hotel}");
//     // shuffle
//     paths = paths.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/hotels/new.*");
//     expect(paths[1]).toEqual("/hotels/{hotel}");
//     paths = [];

//     comparator = pathMatcher.getPatternComparator("/web/endUser/action/login.html");
//     var compare = comparator.compare;
//     compare = compare.bind(comparator);
//     paths.push("/**/login.*");
//     paths.push("/**/endUser/action/login.*");
//     paths.sort(compare);
//     expect(paths[0]).toEqual("/**/endUser/action/login.*");
//     expect(paths[1]).toEqual("/**/login.*");
//     paths = [];
//   });

//   // SPR-8687
//   it('test trimTokensOff', () => {
//     pathMatcher.setTrimTokens(false);

//     expect(pathMatcher.match("/group/{groupName}/members", "/group/sales/members")).toBe(true);
//     expect(pathMatcher.match("/group/{groupName}/members", "/group/  sales/members")).toBe(true);
//     expect(pathMatcher.match("/group/{groupName}/members", "/Group/  Sales/Members")).toBe(false);
//   });

//   // SPR-13286
//   it('test caseInsensitive', () => {
//     pathMatcher.setCaseSensitive(false);

//     expect(pathMatcher.match("/group/{groupName}/members", "/group/sales/members")).toBe(true);
//     expect(pathMatcher.match("/group/{groupName}/members", "/Group/Sales/Members")).toBe(true);
//     expect(pathMatcher.match("/Group/{groupName}/Members", "/group/Sales/members")).toBe(true);
//   });

//   it('test defaultCacheSetting', () => {
//     match();
//     expect(Object.keys(pathMatcher.stringMatcherCache).length > 20).toBe(true);

//     for (var i = 0; i < 65536; i++) {
//       pathMatcher.match("test" + i, "test");
//     }
//     // Cache turned off because it went beyond the threshold
//     expect(Object.keys(pathMatcher.stringMatcherCache).length === 0).toBe(true);
//   });

//   it('test cachePatternsSetToTrue', () => {
//     pathMatcher.setCachePatterns(true);
//     match();
//     expect(Object.keys(pathMatcher.stringMatcherCache).length > 20).toBe(true);

//     for (var i = 0; i < 65536; i++) {
//       pathMatcher.match("test" + i, "test" + i);
//     }
//     // Cache keeps being alive due to the explicit cache setting
//     expect(Object.keys(pathMatcher.stringMatcherCache).length > 65536).toBe(true);
//   });

//   it('test preventCreatingStringMatchersIfPathDoesNotStartsWithPatternPrefix', () => {
//     pathMatcher.setCachePatterns(true);
//     expect(Object.keys(pathMatcher.stringMatcherCache).length).toEqual(0);

//     pathMatcher.match("test?", "test");
//     expect(Object.keys(pathMatcher.stringMatcherCache).length).toEqual(1);

//     pathMatcher.match("test?", "best");
//     pathMatcher.match("test/*", "view/test.jpg");
//     pathMatcher.match("test/**/test.jpg", "view/test.jpg");
//     pathMatcher.match("test/{name}.jpg", "view/test.jpg");
//     expect(Object.keys(pathMatcher.stringMatcherCache).length).toEqual(1);
//   });

//   it('test creatingStringMatchersIfPatternPrefixCannotDetermineIfPathMatch', () => {
//     pathMatcher.setCachePatterns(true);
//     expect(Object.keys(pathMatcher.stringMatcherCache).length).toEqual(0);

//     pathMatcher.match("test", "testian");
//     pathMatcher.match("test?", "testFf");
//     pathMatcher.match("test/*", "test/dir/name.jpg");
//     pathMatcher.match("test/{name}.jpg", "test/lorem.jpg");
//     pathMatcher.match("bla/**/test.jpg", "bla/test.jpg");
//     pathMatcher.match("**/{name}.jpg", "test/lorem.jpg");
//     pathMatcher.match("/**/{name}.jpg", "/test/lorem.jpg");
//     pathMatcher.match("/*/dir/{name}.jpg", "/*/dir/lorem.jpg");

//     expect(Object.keys(pathMatcher.stringMatcherCache).length).toEqual(7);
//   });

//   it('test cachePatternsSetToFalse', () => {
//     pathMatcher.setCachePatterns(false);
//     match();
//     expect(Object.keys(pathMatcher.stringMatcherCache).length === 0).toBe(true);
//   });

//   it('test extensionMappingWithDotPathSeparator', () => {
//     pathMatcher.setPathSeparator(".");
//     // "Extension mapping should be disabled with \".\" as path separator"
//     expect(pathMatcher.combine("/*.html", "hotel.*")).toEqual("/*.html.hotel.*");
//   });

//   // gh-22959
//   it('test isPattern', () => {
//     expect(pathMatcher.isPattern("/test/*")).toBe(true);
//     expect(pathMatcher.isPattern("/test/**/name")).toBe(true);
//     expect(pathMatcher.isPattern("/test?")).toBe(true);
//     expect(pathMatcher.isPattern("/test/{name}")).toBe(true);

//     expect(pathMatcher.isPattern("/test/name")).toBe(false);
//     expect(pathMatcher.isPattern("/test/foo{bar")).toBe(false);
//   });

//   // gh-23297
//   it('test isPatternWithNullPath', () => {
//     expect(pathMatcher.isPattern(null)).toBe(false);
//   });
// });

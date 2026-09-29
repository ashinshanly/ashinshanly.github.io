// tests/android/helpers/test_framework.mjs
// Robust, lightweight test harness for pure ESM Android 4-Tier Test Suite

export class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalAssertions = 0;
    this.passedAssertions = 0;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.failures = [];
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEach: [],
      afterEach: [],
      suites: [],
      parent: this.currentSuite
    };
    if (this.currentSuite) {
      this.currentSuite.suites.push(suite);
    } else {
      this.suites.push(suite);
    }
    const prev = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prev;
    }
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEach.push(fn);
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEach.push(fn);
  }

  test(name, fn) {
    const t = { name, fn, suite: this.currentSuite };
    if (!this.currentSuite) {
      this.describe("Default", () => {
        this.currentSuite.tests.push(t);
      });
    } else {
      this.currentSuite.tests.push(t);
    }
  }

  expect(actual) {
    const self = this;
    const createMatchers = (isNot) => ({
      toBe(expected) {
        self.totalAssertions++;
        const pass = Object.is(actual, expected);
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to be " : " to be ") + JSON.stringify(expected));
        }
        self.passedAssertions++;
      },
      toEqual(expected) {
        self.totalAssertions++;
        const deepEqual = (a, b) => {
          if (Object.is(a, b)) return true;
          if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          if (keysA.length !== keysB.length) return false;
          for (const key of keysA) {
            if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
          }
          return true;
        };
        const pass = deepEqual(actual, expected);
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to equal " : " to equal ") + JSON.stringify(expected));
        }
        self.passedAssertions++;
      },
      toBeCloseTo(expected, precision = 2) {
        self.totalAssertions++;
        const diff = Math.abs(actual - expected);
        const tolerance = Math.pow(10, -precision) / 2;
        const pass = diff <= tolerance;
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + actual + (isNot ? " NOT to be close to " : " to be close to ") + expected + " (diff=" + diff + ", tol=" + tolerance + ")");
        }
        self.passedAssertions++;
      },
      toBeGreaterThan(expected) {
        self.totalAssertions++;
        const pass = actual > expected;
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + actual + (isNot ? " NOT to be > " : " to be > ") + expected);
        }
        self.passedAssertions++;
      },
      toBeGreaterThanOrEqual(expected) {
        self.totalAssertions++;
        const pass = actual >= expected;
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + actual + (isNot ? " NOT to be >= " : " to be >= ") + expected);
        }
        self.passedAssertions++;
      },
      toBeLessThan(expected) {
        self.totalAssertions++;
        const pass = actual < expected;
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + actual + (isNot ? " NOT to be < " : " to be < ") + expected);
        }
        self.passedAssertions++;
      },
      toBeLessThanOrEqual(expected) {
        self.totalAssertions++;
        const pass = actual <= expected;
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + actual + (isNot ? " NOT to be <= " : " to be <= ") + expected);
        }
        self.passedAssertions++;
      },
      toBeTruthy() {
        self.totalAssertions++;
        const pass = Boolean(actual);
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to be truthy" : " to be truthy"));
        }
        self.passedAssertions++;
      },
      toBeFalsy() {
        self.totalAssertions++;
        const pass = !Boolean(actual);
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to be falsy" : " to be falsy"));
        }
        self.passedAssertions++;
      },
      toBeNull() {
        self.totalAssertions++;
        const pass = actual === null;
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to be null" : " to be null"));
        }
        self.passedAssertions++;
      },
      toBeDefined() {
        self.totalAssertions++;
        const pass = typeof actual !== "undefined";
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected value " + (isNot ? "NOT to be defined" : "to be defined"));
        }
        self.passedAssertions++;
      },
      toBeUndefined() {
        self.totalAssertions++;
        const pass = typeof actual === "undefined";
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected value " + (isNot ? "NOT to be undefined" : "to be undefined"));
        }
        self.passedAssertions++;
      },
      toContain(expected) {
        self.totalAssertions++;
        let pass = false;
        if (typeof actual === "string" || Array.isArray(actual)) {
          pass = actual.includes(expected);
        } else if (actual instanceof Set || actual instanceof Map) {
          pass = actual.has(expected);
        } else if (typeof actual === "object" && actual !== null) {
          pass = expected in actual;
        }
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to contain " : " to contain ") + JSON.stringify(expected));
        }
        self.passedAssertions++;
      },
      toMatch(pattern) {
        self.totalAssertions++;
        const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
        const pass = regex.test(String(actual));
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected " + JSON.stringify(actual) + (isNot ? " NOT to match " : " to match ") + pattern);
        }
        self.passedAssertions++;
      },
      toThrow(expectedErrorPattern) {
        self.totalAssertions++;
        let threw = false;
        let thrownError = null;
        try {
          if (typeof actual === "function") {
            actual();
          }
        } catch (err) {
          threw = true;
          thrownError = err;
        }
        let pass = threw;
        if (pass && expectedErrorPattern) {
          if (typeof expectedErrorPattern === "string") {
            pass = thrownError.message.includes(expectedErrorPattern);
          } else if (expectedErrorPattern instanceof RegExp) {
            pass = expectedErrorPattern.test(thrownError.message);
          }
        }
        if (isNot ? pass : !pass) {
          throw new Error("Assertion failed: Expected function " + (isNot ? "NOT to throw" : "to throw ") + (expectedErrorPattern || "") + ", " + (threw ? "threw: " + thrownError.message : "did not throw"));
        }
        self.passedAssertions++;
      }
    });

    const matchers = createMatchers(false);
    matchers.not = createMatchers(true);
    return matchers;
  }

  _getBeforeEachHooks(suite) {
    const hooks = [];
    let curr = suite;
    while (curr) {
      if (curr.beforeEach && curr.beforeEach.length > 0) {
        hooks.unshift(...curr.beforeEach);
      }
      curr = curr.parent;
    }
    return hooks;
  }

  _getAfterEachHooks(suite) {
    const hooks = [];
    let curr = suite;
    while (curr) {
      if (curr.afterEach && curr.afterEach.length > 0) {
        hooks.push(...curr.afterEach);
      }
      curr = curr.parent;
    }
    return hooks;
  }

  async run(verbose = true) {
    const startTime = Date.now();
    const runSuiteRecursive = async (suite, prefix = "") => {
      const fullTitle = prefix ? prefix + " > " + suite.name : suite.name;
      if (verbose && (suite.tests.length > 0 || suite.suites.length > 0)) {
        console.log("  \x1b[1m\x1b[36m▶ " + fullTitle + "\x1b[0m");
      }
      const beforeHooks = this._getBeforeEachHooks(suite);
      const afterHooks = this._getAfterEachHooks(suite);

      for (const t of suite.tests) {
        this.totalTests++;
        try {
          for (const b of beforeHooks) await b();
          await t.fn();
          for (const a of afterHooks) await a();
          this.passedTests++;
          if (verbose) {
            console.log("    \x1b[32m✔\x1b[0m " + t.name);
          }
        } catch (err) {
          this.failedTests++;
          console.log("    \x1b[31m✖ " + t.name + "\x1b[0m");
          console.log("      \x1b[90m" + err.message + "\x1b[0m");
          this.failures.push({ suite: fullTitle, test: t.name, error: err });
        }
      }
      for (const child of suite.suites) {
        await runSuiteRecursive(child, fullTitle);
      }
    };

    for (const s of this.suites) {
      await runSuiteRecursive(s);
    }
    const duration = Date.now() - startTime;

    return {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      totalAssertions: this.totalAssertions,
      passedAssertions: this.passedAssertions,
      durationMs: duration,
      failures: this.failures
    };
  }

  reset() {
    this.suites = [];
    this.currentSuite = null;
    this.totalAssertions = 0;
    this.passedAssertions = 0;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.failures = [];
  }
}

export const defaultRunner = new TestRunner();
export const describe = (name, fn) => defaultRunner.describe(name, fn);
export const it = (name, fn) => defaultRunner.test(name, fn);
export const test = (name, fn) => defaultRunner.test(name, fn);
export const expect = (actual) => defaultRunner.expect(actual);
export const beforeEach = (fn) => defaultRunner.beforeEach(fn);
export const afterEach = (fn) => defaultRunner.afterEach(fn);
export default defaultRunner;

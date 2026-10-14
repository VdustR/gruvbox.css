const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRequire } = require("node:module");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const rootRequire = createRequire(path.resolve("package.json"));
const _ = rootRequire("lodash");
const esnoRequire = createRequire(rootRequire.resolve("esno/package.json"));
let esbuild;
try {
  esbuild = esnoRequire("esbuild");
} catch {
  esbuild = createRequire(esnoRequire.resolve("tsx/package.json"))("esbuild");
}
console.log(JSON.stringify({ lodash: _.VERSION, esbuild: esbuild.version }));
for (const [name, segment] of [
  ["string", "__proto__"],
  ["array", ["__proto__"]],
]) {
  for (const method of ["unset", "omit"]) {
    test(`${method} preserves prototype sentinel through ${name} path segments`, () => {
      const key = "__gruvboxSecuritySentinel";
      Object.defineProperty(Object.prototype, key, {
        value: "safe",
        configurable: true,
      });
      try {
        const segments = [segment, key];
        _[method]({}, method === "omit" ? [segments] : segments);
        assert.equal(Object.prototype[key], "safe");
        const normal = { a: { b: 1 } };
        if (method === "unset") {
          _.unset(normal, ["a", "b"]);
          assert.deepEqual(normal, { a: {} });
        } else assert.deepEqual(_.omit(normal, ["a.b"]), { a: {} });
      } finally {
        delete Object.prototype[key];
      }
    });
  }
}
test("template rejects injected import names without executing them", () => {
  globalThis.__gruvboxSecurityMarker = 0;
  try {
    let error;
    try {
      _.template("safe", {
        imports: { "x=globalThis.__gruvboxSecurityMarker=1": undefined },
      });
    } catch (e) {
      error = e;
    }
    console.log(
      JSON.stringify({
        templateMarker: globalThis.__gruvboxSecurityMarker,
        rejected: !!error,
      })
    );
    assert.ok(error, "unsafe import key must be rejected");
    assert.equal(globalThis.__gruvboxSecurityMarker, 0);
    assert.equal(
      _.template("<%= x %>", { imports: { x: "safe" } })({}),
      "safe"
    );
  } finally {
    delete globalThis.__gruvboxSecurityMarker;
  }
});
test("esbuild does not grant an unrelated origin access to harmless fixture content", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gruvbox-cors-"));
  fs.writeFileSync(
    path.join(dir, "fixture.js"),
    'console.log("harmless-gruvbox-fixture");'
  );
  let server, context;
  try {
    const options = {
      entryPoints: [path.join(dir, "fixture.js")],
      outfile: path.join(dir, "out.js"),
    };
    if (esbuild.context) {
      context = await esbuild.context(options);
      server = await context.serve({
        host: "127.0.0.1",
        port: 0,
        servedir: dir,
      });
    } else
      server = await esbuild.serve(
        { host: "127.0.0.1", port: 0, servedir: dir },
        options
      );
    const response = await fetch(`http://127.0.0.1:${server.port}/fixture.js`, {
      headers: { Origin: "https://unrelated.example" },
    });
    const body = await response.text();
    console.log(
      JSON.stringify({
        status: response.status,
        allowOrigin: response.headers.get("access-control-allow-origin"),
        fixture: body.includes("harmless-gruvbox-fixture"),
      })
    );
    assert.equal(response.status, 200);
    assert.ok(body.includes("harmless-gruvbox-fixture"));
    assert.notEqual(response.headers.get("access-control-allow-origin"), "*");
    assert.notEqual(
      response.headers.get("access-control-allow-origin"),
      "https://unrelated.example"
    );
  } finally {
    if (context) await context.dispose();
    else if (server) server.stop();
    if (esbuild.stop) esbuild.stop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

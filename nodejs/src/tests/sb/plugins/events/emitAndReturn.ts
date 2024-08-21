import {BSBEvents, SmartFunctionCallSync} from "../../../../index";
import * as assert from "assert";
import {randomUUID} from "crypto";

const randomName = () => randomUUID();

export function emitAndReturn(
    genNewPlugin: { (): Promise<BSBEvents> },
    maxTimeoutToExpectAResponse: number,
) {
  let emitter: BSBEvents;
  beforeEach(async () => {
    emitter = await genNewPlugin();
  });
  afterEach(function () {
    SmartFunctionCallSync(emitter, emitter.dispose);
  });
  describe("EmitAndReturn", async () => {
    const timermaxTimeoutToExpectAResponse = maxTimeoutToExpectAResponse + 10;
    describe("emitEventAndReturn", async () => {
      const emitData = true;
      const emitData2 = false;
      it("should not respond to different listen events when same event name used with diff plugins", async () => {
        const thisPlugin = randomName();
        const thisPlugin2 = randomName();
        const thisEvent = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.fail("Event not received");
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisPlugin, thisEvent, async () => {
          assert.fail("Received onEvent with diff plugin name");
        });
        await emitter.onReturnableEvent(thisPlugin2, thisEvent, async (receivedTraceId) => {
          assert.strictEqual(receivedTraceId, traceId);
          setTimeout(() => {
            console.log("Received onEvent");
            assert.ok(true, "Received onEvent");
          }, 1);
          return emitData2;
        });
        console.log("!!Received onEvent");
        await emitter.emitEventAndReturn(
            thisPlugin2,
            thisEvent,
            traceId,
            maxTimeoutToExpectAResponse / 1000,
            [],
        );
        console.log("++Received onEvent");
        clearTimeout(emitTimeout);
        assert.ok(true, "Received Response");
      });
      it("should be able to emit to events with plugin name defined", async () => {
        const thisPlugin = randomName();
        const thisEvent = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.fail("Event not received");
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisPlugin, thisEvent, async (receivedTraceId) => {
          assert.strictEqual(receivedTraceId, traceId);
          setTimeout(() => {
            console.log("Received onEvent");
            assert.ok(true, "Received onEvent");
          }, 1);
          return emitData2;
        });
        console.log("!!Received onEvent");
        await emitter.emitEventAndReturn(
            thisPlugin,
            thisEvent,
            traceId,
            maxTimeoutToExpectAResponse / 1000,
            [],
        );
        console.log("++Received onEvent");
        clearTimeout(emitTimeout);
        assert.ok(true, "Received Response");
      });
      it("should be able to emit to events with self", async () => {
        const thisCaller = randomName();
        const thisEvent = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.fail("Event not received");
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisCaller, thisEvent, async (receivedTraceId) => {
          assert.strictEqual(receivedTraceId, traceId);
          assert.ok(true, "Received onEvent");
          return emitData2;
        });
        await emitter.emitEventAndReturn(
            thisCaller,
            thisEvent,
            traceId,
            maxTimeoutToExpectAResponse / 1000,
            [emitData],
        );
        clearTimeout(emitTimeout);
        assert.ok(true, "Received Response");
      });
      it("should not be able to emit to other events with plugin name defined", async () => {
        const thisPlugin = randomName();
        const thisEvent = randomName();
        const thisEvent2 = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.ok(true);
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisPlugin, thisEvent, () => {
          assert.fail("EEAR MSG Received");
        });
        try {
          await emitter.emitEventAndReturn(
              thisPlugin,
              thisEvent2,
              traceId,
              maxTimeoutToExpectAResponse / 1000,
              [emitData],
          );
          clearTimeout(emitTimeout);
          assert.fail("EEAR Returned");
        }
        catch (exc) {
          clearTimeout(emitTimeout);
          assert.ok("Timeout of EEAR");
        }
      });
      it("should not be able to emit to other events with self", async () => {
        const thisCaller = randomName();
        const thisEvent = randomName();
        const thisEvent2 = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.ok(true);
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisCaller, thisEvent, () => {
          assert.fail("EEAR MSG Received");
        });
        try {
          await emitter.emitEventAndReturn(
              thisCaller,
              thisEvent2,
              traceId,
              maxTimeoutToExpectAResponse / 1000,
              [emitData],
          );
          clearTimeout(emitTimeout);
          assert.fail("EEAR Returned");
        }
        catch (exc) {
          clearTimeout(emitTimeout);
          assert.ok("Timeout of EEAR");
        }
      });
      it("should timeout correctly", async () => {
        const thisCaller = randomName();
        const thisEvent = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.fail("Event not received");
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisCaller, thisEvent, async () => {
        });
        try {
          await emitter.emitEventAndReturn(
              thisCaller,
              thisEvent,
              traceId,
              maxTimeoutToExpectAResponse / 1000,
              [emitData],
          );
          clearTimeout(emitTimeout);
          assert.fail("EEAR Returned");
        }
        catch (exc) {
          clearTimeout(emitTimeout);
          assert.ok("Timeout of EEAR");
        }
      });
      it("should response error correctly", async () => {
        const thisCaller = randomName();
        const thisEvent = randomName();
        const traceId = randomUUID();

        const emitTimeout = setTimeout(() => {
          assert.fail("Event not received");
        }, timermaxTimeoutToExpectAResponse);
        await emitter.onReturnableEvent(thisCaller, thisEvent, () => {
          throw "THISISANERROR";
        });
        try {
          await emitter.emitEventAndReturn(
              thisCaller,
              thisEvent,
              traceId,
              maxTimeoutToExpectAResponse / 1000,
              [emitData],
          );
          clearTimeout(emitTimeout);
          assert.fail("EEAR Returned");
        }
        catch (exc) {
          clearTimeout(emitTimeout);
          assert.ok("EEAR");
          assert.strictEqual(exc, "THISISANERROR");
        }
      });
    });
    const typesToTest = [
      {
        name: "DiffData",
        data: null,
        rData: "HELLO WORLD",
      },
      {
        name: "Null",
        data: null,
      },
      {
        name: "Boolean true",
        data: true,
      },
      {
        name: "Boolean false",
        data: false,
      },
      {
        name: "String",
        data: "HELLO WO4lD",
      },
      {
        name: "Min Number",
        data: Number.MIN_SAFE_INTEGER,
      },
      {
        name: "Max Number",
        data: Number.MAX_SAFE_INTEGER,
      },
      {
        name: "Array",
        data: [
          0,
          "Hello",
          true,
        ],
      },
      {
        name: "Object",
        data: {
          name: "Sarah",
          surname: "Blond",
          age: 24,
          meta: {
            location: [
              -12212,
              55336,
            ],
          },
        },
      },
    ];
    for (const typeToTest of typesToTest) {
      describe(`emitEventAndReturn ${typeToTest.name}`, async () => {
        it("should be able to emit to events with plugin name defined", async () => {
          const thisPlugin = randomName();
          const thisEvent = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.fail("Event not received");
          }, timermaxTimeoutToExpectAResponse);
          await emitter.onReturnableEvent(thisPlugin, thisEvent, async (receivedTraceId) => {
            assert.strictEqual(receivedTraceId, traceId);
            return typeToTest.rData !== undefined
                   ? typeToTest.rData
                   : typeToTest.data;
          });
          const resp = await emitter.emitEventAndReturn(
              thisPlugin,
              thisEvent,
              traceId,
              maxTimeoutToExpectAResponse / 1000,
              [typeToTest.data],
          );
          clearTimeout(emitTimeout);
          assert.strictEqual(
              JSON.stringify(resp),
              JSON.stringify(
                  typeToTest.rData !== undefined
                  ? typeToTest.rData
                  : typeToTest.data,
              ),
          );
        });
        it("should be able to emit to events with self", async () => {
          const thisCaller = randomName();
          const thisEvent = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.fail("Event not received - timeout");
          }, timermaxTimeoutToExpectAResponse);
          await emitter.onReturnableEvent(
              thisCaller,
              thisEvent,
              async (receivedTraceId, data: Array<any>) => {
                assert.strictEqual(receivedTraceId, traceId);
                clearTimeout(emitTimeout);
                assert.strictEqual(
                    JSON.stringify(data[0]),
                    JSON.stringify(typeToTest.data),
                    "Received data",
                );
                return typeToTest.rData || typeToTest.data;
              },
          );
          assert.strictEqual(
              JSON.stringify(
                  await emitter.emitEventAndReturn(
                      thisCaller,
                      thisEvent,
                      traceId,
                      maxTimeoutToExpectAResponse / 1000,
                      [typeToTest.data],
                  ),
              ),
              JSON.stringify(typeToTest.rData || typeToTest.data),
              "Returned data",
          );
          clearTimeout(emitTimeout);
        });
        it("should not be able to emit to other events with plugin name defined", async () => {
          const thisPlugin = randomName();
          const thisEvent = randomName();
          const thisEvent2 = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.ok(true);
          }, timermaxTimeoutToExpectAResponse);
          await emitter.onReturnableEvent(thisPlugin, thisEvent, () => {
            assert.fail("EEAR MSG Received");
          });
          try {
            await emitter.emitEventAndReturn(
                thisPlugin,
                thisEvent2,
                traceId,
                maxTimeoutToExpectAResponse / 1000,
                [typeToTest.data],
            );
            clearTimeout(emitTimeout);
            assert.fail("EEAR Returned");
          }
          catch (exc) {
            clearTimeout(emitTimeout);
            assert.ok("Timeout of EEAR");
          }
        });
        it("should not be able to emit to other events with self", async () => {
          const thisCaller = randomName();
          const thisEvent = randomName();
          const thisEvent2 = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.ok(true);
          }, timermaxTimeoutToExpectAResponse);
          await emitter.onReturnableEvent(thisCaller, thisEvent, () => {
            assert.fail("EEAR MSG Received");
          });
          try {
            await emitter.emitEventAndReturn(
                thisCaller,
                thisEvent2,
                traceId,
                maxTimeoutToExpectAResponse / 1000,
                [typeToTest.data],
            );
            clearTimeout(emitTimeout);
            assert.fail("EEAR Returned");
          }
          catch (exc) {
            clearTimeout(emitTimeout);
            assert.ok("Timeout of EEAR");
          }
        });
        it("should timeout correctly - general timeout", async () => {
          const thisCaller = randomName();
          const thisEvent = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.fail("Event not received");
          }, timermaxTimeoutToExpectAResponse + 10);
          await emitter.onReturnableEvent(
              thisCaller,
              thisEvent,
              async () => {
              },
          );
          try {
            await emitter.emitEventAndReturn(
                thisCaller,
                thisEvent,
                traceId,
                maxTimeoutToExpectAResponse / 1000,
                [typeToTest.data],
            );
            clearTimeout(emitTimeout);
            assert.fail("EEAR Returned");
          }
          catch (exc) {
            clearTimeout(emitTimeout);
            assert.ok("Timeout of EEAR");
          }
        });
        it("should timeout correctly - no receipt", async () => {
          const thisCaller = randomName();
          const thisEvent = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.fail("Event not received");
          }, timermaxTimeoutToExpectAResponse + 10);
          try {
            await emitter.emitEventAndReturn(
                thisCaller,
                thisEvent,
                traceId,
                maxTimeoutToExpectAResponse / 1000,
                [typeToTest.data],
            );
            clearTimeout(emitTimeout);
            assert.fail("EEAR Returned");
          }
          catch (exc) {
            clearTimeout(emitTimeout);
            assert.ok("Timeout of EEAR");
          }
        });
        it("should response error correctly", async () => {
          const thisCaller = randomName();
          const thisEvent = randomName();
          const traceId = randomUUID();

          const emitTimeout = setTimeout(() => {
            assert.fail("Event not received");
          }, timermaxTimeoutToExpectAResponse);
          await emitter.onReturnableEvent(thisCaller, thisEvent, () => {
            throw typeToTest.rData || typeToTest.data;
          });
          try {
            await emitter.emitEventAndReturn(
                thisCaller,
                thisEvent,
                traceId,
                maxTimeoutToExpectAResponse / 1000,
                [typeToTest.data],
            );
            clearTimeout(emitTimeout);
            assert.fail("EEAR Returned");
          }
          catch (exc) {
            clearTimeout(emitTimeout);
            assert.ok("EEAR");
            assert.strictEqual(
                JSON.stringify(exc),
                JSON.stringify(typeToTest.rData || typeToTest.data),
            );
          }
        });
      });
    }
  });
}

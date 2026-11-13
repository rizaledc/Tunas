import { afterEach, describe, expect, it, vi } from "vitest";
import { chatCompletion, extractJson } from "../src/lib/openrouter";

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
const opts = { model: "anthropic/claude-haiku-5.5", system: "s", user: "u", maxTokens: 800, json: true };

afterEach(() => vi.unstubAllGlobals());

describe("chatCompletion", () => {
  it("mematikan reasoning dan membaca finish_reason", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ choices: [{ message: { content: '{"a":1}' }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 5, cost: 0.0001 } }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await chatCompletion("sk-or-v1-test", opts);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.reasoning).toEqual({ enabled: false });
    expect(r.content).toBe('{"a":1}');
    expect(r.finishReason).toBe("stop");
  });

  it("mengulang tanpa opsi reasoning bila model menolaknya", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"error":{"message":"Reasoning is mandatory for this endpoint"}}', { status: 400 }))
      .mockResolvedValueOnce(ok({ choices: [{ message: { content: '{"a":1}' }, finish_reason: "stop" }] }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await chatCompletion("sk-or-v1-test", opts);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).reasoning).toBeUndefined();
    expect(r.content).toBe('{"a":1}');
  });

  it("menggabungkan isi pesan berbentuk array bagian", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ choices: [{ message: { content: [{ type: "text", text: '{"a":' }, { type: "text", text: "1}" }] } }] })));
    const r = await chatCompletion("sk-or-v1-test", opts);
    expect(extractJson(r.content)).toEqual({ a: 1 });
  });
});

describe("extractJson", () => {
  it("menerima blok ```json", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it("menjelaskan jawaban kosong karena batas token", () => {
    expect(() => extractJson("", "length")).toThrow(/batas token/);
  });
  it("menjelaskan jawaban terpotong", () => {
    expect(() => extractJson('{"ringkasan":"Minggu ini', "length")).toThrow(/terpotong/);
  });
  it("menampilkan awal jawaban bila bukan JSON", () => {
    expect(() => extractJson("Berikut ringkasannya", "stop")).toThrow(/Awal jawaban: "Berikut ringkasannya"/);
  });
});

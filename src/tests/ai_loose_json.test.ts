import { describe, it, expect } from 'vitest';
import { parseLooseJson } from '../../server/ai/modelOutput';

describe('parseLooseJson', () => {
  it('parses valid JSON unchanged', () => {
    expect(parseLooseJson('{"a":"x\\ny \\\\ \\u00e9"}')).toEqual({ a: 'x\ny \\ é' });
  });
  it('keeps LaTeX backslashes the model forgot to escape', () => {
    const raw = String.raw`{"explanation":"total is $\sum (max\_need_i - 1) + 1$ and \frac{a}{b}, \beta"}`;
    expect(parseLooseJson<any>(raw).explanation).toBe(String.raw`total is $\sum (max\_need_i - 1) + 1$ and \frac{a}{b}, \beta`);
  });
  it('still throws for text that is not JSON', () => {
    expect(() => parseLooseJson('not json')).toThrow();
  });
});

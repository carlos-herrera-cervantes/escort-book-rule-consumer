import './date.extension';

describe('DateExtension', () => {
  it('Should return the current date in short format', () => {
    const now = new Date();
    const date = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
    const hour = `${now.getUTCHours()}:${now.getMinutes()}`;

    const expected = date + 'T' + hour;
    const got = now.toShortDateString();

    expect(got).toEqual(expected);
  });
});

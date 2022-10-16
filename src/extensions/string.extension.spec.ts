import './string.extension';

describe('StringExtensions', () => {
  it('Should return a tuple', () => {
    const jobName = '12345|Customer';
    const [serviceId, customerType] = jobName.extractServiceMetadata();
    expect(serviceId).toEqual('12345');
    expect(customerType).toEqual('Customer');
  });

  it('Should return the current date in short format', () => {
    const year = new Date().getUTCFullYear();
    const scheduleExpression = '0 10 1 1 *';
    
    const expected = `${year}-1-1T10:0`;
    const got = scheduleExpression.toShortDateString();

    expect(got).toEqual(expected);
  });
});

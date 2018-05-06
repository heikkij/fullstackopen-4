const dummyHelper = require('../utils/dummy_helper')

describe.skip('dummy', () => {
  test('dummy is called', () => {
    const blogs = []

    const result = dummyHelper.dummy(blogs)
    expect(result).toBe(1)
  })
})
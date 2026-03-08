const mockDrive = jest.fn();
const driver = jest.fn(() => ({ drive: mockDrive }));

module.exports = { driver };

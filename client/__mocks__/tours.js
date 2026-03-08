const mockDrive = jest.fn();
const mockTour = { drive: mockDrive };
const mockDriver = jest.fn(() => mockTour);

module.exports = {
  createSeedTour: jest.fn(() => mockTour),
  createReceiveTour: jest.fn(() => mockTour),
  createSendTour: jest.fn(() => mockTour),
  createChannelsTour: jest.fn(() => mockTour),
  createLiquidityTour: jest.fn(() => mockTour),
  createP2PTour: jest.fn(() => mockTour),
  createP2PChannelTour: jest.fn(() => mockTour),
  __mockDrive: mockDrive,
  __mockDriver: mockDriver,
};

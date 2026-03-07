const socket = {
  connected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
};

module.exports = socket;

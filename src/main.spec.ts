jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
  })),
  ValidationPipe: jest.fn(),
}));

describe('main.ts', () => {
  it('should bootstrap without error', async () => {
    await expect(import('./main')).resolves.toBeDefined();
  });
});
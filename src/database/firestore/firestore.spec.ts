import { Test, TestingModule } from '@nestjs/testing';
import { Firestore } from './firestore';

describe('Firestore', () => {
  let provider: Firestore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Firestore],
    }).compile();

    provider = module.get<Firestore>(Firestore);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

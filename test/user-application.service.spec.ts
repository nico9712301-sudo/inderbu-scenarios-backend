// test/user-application.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserApplicationService } from 'src/core/application/services/user-application.service';
import { APPLICATION_PORTS } from 'src/core/application/tokens/ports';
import { REPOSITORY_PORTS } from 'src/infrastructure/tokens/ports';
import { UserDomainEntity } from 'src/core/domain/entities/user.domain-entity';
import { PageOptionsDto } from 'src/infrastructure/adapters/inbound/http/dtos/common/page-options.dto';

describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let userRepositoryMock: any;
  let notificationServiceMock: any;

  beforeEach(async () => {
    // Mock for user repository
    userRepositoryMock = {
      findAllPaged: jest.fn(),
      findByIdWithRelations: jest.fn(),
      save: jest.fn(),
      findByEmail: jest.fn(),
      findByConfirmationToken: jest.fn(),
      findByRole: jest.fn(),
    };

    // Mock for notification service
    notificationServiceMock = {
      sendAccountConfirmation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserApplicationService,
        {
          provide: REPOSITORY_PORTS.USER,
          useValue: userRepositoryMock,
        },
        {
          provide: APPLICATION_PORTS.NOTIFICATION_SERVICE,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserApplicationService>(UserApplicationService);
  });

  describe('getAllUsers', () => {
    it('should map user domain entities to DTOs with relations', async () => {
      // Arrange
      const pageOptions = new PageOptionsDto();
      pageOptions.page = 1;
      pageOptions.limit = 10;

      // Create mock domain entity with all relations
      const mockUserDomain = UserDomainEntity.builder()
        .withId(1)
        .withDni(123456789)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john.doe@example.com')
        .withPhone('1234567890')
        .withPasswordHash('hashedPassword')
        .withRoleId(1)
        .withAddress('123 Main St')
        .withNeighborhoodId(1)
        .withActive(true)
        .build();

      // Add relations as they would be added from the repository
      (mockUserDomain as any).role = { id: 1, name: 'Admin' };
      (mockUserDomain as any).neighborhood = { id: 1, name: 'Downtown' };
      (mockUserDomain as any).commune = { id: 1, name: 'Central' };
      (mockUserDomain as any).city = { id: 1, name: 'Bucaramanga' };

      // Set up repository mock to return our test data
      userRepositoryMock.findAllPaged.mockResolvedValue({
        users: [mockUserDomain],
        totalItems: 1,
      });

      // Act
      const result = await service.getAllUsers(pageOptions);

      // Assert
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].role).toEqual({ id: 1, name: 'Admin' });
      expect(result.data[0].neighborhood).toEqual({ id: 1, name: 'Downtown' });
      expect(result.data[0].commune).toEqual({ id: 1, name: 'Central' });
      expect(result.data[0].city).toEqual({ id: 1, name: 'Bucaramanga' });
    });
  });
});

import type { Config } from '@jest/types';

export default (): Config.InitialOptions => ({
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@infra/(.*)*': ['<rootDir>/src/@core/infra/$1'],
    '^@domain/(.*)*': ['<rootDir>/src/@core/domain/$1'],
    '^@application/(.*)*': ['<rootDir>/src/@core/application/$1'],
    '^@presentation/(.*)*': ['<rootDir>/src/@core/presentation/$1'],
    '^@domain-unit/(.*)*': ['<rootDir>/test/unit/src/@core/domain/$1'],
    '^@application-unit/(.*)*': [
      '<rootDir>/test/unit/src/@core/application/$1',
    ],
    '^@presentation-unit/(.*)*': [
      '<rootDir>/test/unit/src/@core/presentation/$1',
    ],
  },
  clearMocks: true,
  roots: ['<rootDir>/src', '<rootDir>/test'],
});

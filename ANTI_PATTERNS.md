# Anti-Patterns Analysis for Flight Tracker API

This document identifies anti-patterns found in the Flight Tracker API codebase, explains why they are problematic, and provides recommendations for fixes.

## 1. God Object/Service Anti-Pattern

### Location
- `src/modules/flights/service/flights.service.ts` (539 lines)

### Problem
The `FlightsService` class has grown too large and handles multiple responsibilities:
- Flight business logic and validation
- Status transition management
- Event emission
- Data transformation
- Repository orchestration

### Why it's problematic
- Violates Single Responsibility Principle
- Difficult to test individual components
- High coupling between different concerns
- Hard to maintain and extend
- Increases risk of bugs when making changes

### Recommended Fix
Break down the service into smaller, focused services:
- `FlightStatusService` - Handle status transitions
- `FlightValidationService` - Handle business rules validation
- `FlightTransformationService` - Handle data mapping
- `FlightEventService` - Handle event emission

## 2. Code Duplication Anti-Pattern

### Location
- `src/modules/flights/service/flights.service.ts` (lines 74-82, 98-108, 148-156)

### Problem
Identical airport mapping logic is repeated in multiple methods:
```typescript
airports: flight.airports.map(
  (airportOnFlight): AirportWithType => ({
    ...airportOnFlight.airport,
    location: airportOnFlight.airport.location as unknown as Coordinates,
    continent: airportOnFlight.airport.continent as Continent,
    type: airportOnFlight.airportType as AirportType,
  }),
)
```

### Why it's problematic
- Violates DRY (Don't Repeat Yourself) principle
- Maintenance overhead - changes need to be made in multiple places
- Inconsistency risk when updating logic
- Increases code size unnecessarily

### Recommended Fix
Extract to a utility function:
```typescript
private mapAirportsWithType(airports: any[]): AirportWithType[] {
  return airports.map((airportOnFlight): AirportWithType => ({
    ...airportOnFlight.airport,
    location: airportOnFlight.airport.location as unknown as Coordinates,
    continent: airportOnFlight.airport.continent as Continent,
    type: airportOnFlight.airportType as AirportType,
  }));
}
```

## 3. Magic Numbers and Strings Anti-Pattern

### Location
- `src/main.ts` (line 16)
- `src/modules/auth/service/auth.service.ts` (lines 77-78)
- `src/modules/flights/repository/flights.repository.ts` (lines 132, 140)

### Problem
Hardcoded values throughout the codebase:
- Port number `3000`
- JWT expiration times `'15m'`, `'7d'`
- Airport types `'departure'`, `'destination'`

### Why it's problematic
- Hard to maintain and change
- No central configuration
- Environment-specific values are hardcoded
- Reduces flexibility

### Recommended Fix
Use configuration management:
```typescript
// config/app.config.ts
export const AppConfig = {
  port: process.env.PORT || 3000,
  jwt: {
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  airports: {
    types: {
      DEPARTURE: 'departure',
      DESTINATION: 'destination',
    }
  }
};
```

## 4. Type Casting Anti-Pattern

### Location
- `src/modules/flights/service/flights.service.ts` (multiple locations)

### Problem
Excessive use of type casting with `as unknown as`:
```typescript
timesheet: flight.timesheet as FullTimesheet,
loadsheets: flight.loadsheets as unknown as Loadsheets,
location: airportOnFlight.airport.location as unknown as Coordinates,
```

### Why it's problematic
- Bypasses TypeScript's type safety
- Potential runtime errors
- Indicates poor type definitions
- Makes code harder to understand and maintain

### Recommended Fix
Improve type definitions and use proper typing:
```typescript
// Define proper Prisma types
interface FlightFromDatabase {
  timesheet: FullTimesheet;
  loadsheets: Loadsheets;
  // ... other properties
}

// Use type guards for validation
function isValidTimesheet(obj: unknown): obj is FullTimesheet {
  // Implementation
}
```

## 5. JSON Deep Clone Anti-Pattern

### Location
- `src/modules/flights/repository/flights.repository.ts` (lines 123, 224, 233)

### Problem
Using `JSON.parse(JSON.stringify(...))` for deep cloning:
```typescript
timesheet: JSON.parse(JSON.stringify(input.timesheet)),
loadsheets: JSON.parse(JSON.stringify(loadsheets)),
```

### Why it's problematic
- Performance overhead
- Loses function properties and prototypes
- Cannot handle circular references
- Dates become strings
- Error-prone for complex objects

### Recommended Fix
Use proper cloning utilities:
```typescript
import { cloneDeep } from 'lodash';
// or implement proper copying
private deepClone<T>(obj: T): T {
  return structuredClone(obj); // Modern alternative
}
```

## 6. Mixed Error Handling Anti-Pattern

### Location
- `src/modules/flights/service/flights.service.ts` and repositories

### Problem
Inconsistent error handling patterns:
- Some methods throw `NotFoundException`
- Some throw generic `Error`
- Mix of HTTP errors in service layer

### Why it's problematic
- Inconsistent error handling
- HTTP concerns mixed with business logic
- Hard to handle errors consistently at higher levels

### Recommended Fix
Create domain-specific error hierarchy:
```typescript
// errors/flight.errors.ts
export class FlightNotFoundError extends Error {
  constructor(id: string) {
    super(`Flight with id ${id} not found`);
  }
}

export class InvalidFlightStatusError extends Error {
  constructor(current: string, required: string) {
    super(`Invalid status transition from ${current}, expected ${required}`);
  }
}
```

## 7. Repository Pattern Violation

### Location
- `src/modules/flights/repository/flights.repository.ts` (lines 102-108, 247-253)

### Problem
Repository performing business logic validation:
```typescript
if (!(await this.airportExist(input.departureAirportId))) {
  throw new NotFoundException(DepartureAirportNotFoundError);
}
```

### Why it's problematic
- Repository should be a pure data access layer
- Business logic mixed with data access
- Violates separation of concerns

### Recommended Fix
Move validation to service layer:
```typescript
// In service
async create(input: CreateFlightRequest): Promise<Flight> {
  await this.validateCreateInput(input);
  return this.flightsRepository.create(input);
}

private async validateCreateInput(input: CreateFlightRequest): Promise<void> {
  // Business validation logic here
}
```

## 8. Long Parameter Lists Anti-Pattern

### Location
- Various service methods with multiple parameters

### Problem
Methods with many parameters become hard to use and maintain.

### Recommended Fix
Use parameter objects:
```typescript
interface UpdateTimesheetRequest {
  flightId: string;
  schedule: Schedule;
  initiatorId: string;
}

async updateScheduledTimesheet(request: UpdateTimesheetRequest): Promise<void> {
  // Implementation
}
```

## Implementation Priority

1. **High Priority**
   - Configuration management (magic numbers/strings)
   - Code duplication removal
   - Type casting improvements

2. **Medium Priority**
   - Service decomposition
   - Error handling standardization
   - Repository pattern fixes

3. **Low Priority**
   - Parameter object refactoring
   - Deep clone optimization

## Testing Strategy

Each fix should be accompanied by:
- Unit tests for new utilities
- Integration tests for refactored services
- Regression tests to ensure no breaking changes
- Performance tests for optimization improvements

## Migration Strategy

1. Implement fixes incrementally
2. Maintain backward compatibility where possible
3. Use feature flags for major changes
4. Update documentation as changes are made
5. Monitor performance and error rates after deployment
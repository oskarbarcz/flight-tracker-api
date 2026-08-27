## Purpose

Gives a pilot a collectible image for each city they have reached — one postcard per city,
shared by everyone who reaches it — so that travel produces something to look at rather
than a row in a list, and so that reaching a city for the first time is a moment the client
can celebrate exactly once.

## ADDED Requirements

### Requirement: A city has at most one postcard

The system SHALL hold at most one postcard for any city, so that every pilot who reaches a
city receives the same postcard and the art for a city is produced once rather than once
per pilot. A city SHALL be able to exist with no postcard.

#### Scenario: A second postcard for a city is refused

- **GIVEN** a city that already has a postcard
- **WHEN** another postcard is created for that city
- **THEN** the city still has exactly one postcard

#### Scenario: Two pilots reaching one city hold the same postcard

- **GIVEN** two pilots who have each landed in the same city
- **WHEN** each reads their postcards
- **THEN** both hold the same postcard for that city

#### Scenario: A city may have no postcard

- **GIVEN** a city whose postcard has not been produced
- **THEN** the city is valid and readable

### Requirement: A postcard's art is produced and stored outside this system

The system SHALL obtain a postcard's art from the external generator, naming the city to
draw, that city's country so that a city is not confused with a same-named city elsewhere,
and the name to store the art under, and SHALL record only the location the art was stored
at. Where naming the country would make the request one the generator will not accept, the
system SHALL name the city alone, so that a postcard is never left without art merely
because its country cannot be expressed. The system SHALL NOT hold storage credentials and SHALL NOT store the image
itself. The system SHALL treat art as produced only once the stored image is confirmed to
exist, so that a generator that accepts the work without reporting its result does not leave
the system claiming art it cannot serve. Where the generator cannot be reached, is refused,
or fails, the system SHALL leave the postcard without art rather than record a location it
cannot serve.

#### Scenario: Confirmed art is recorded by location

- **WHEN** art is produced for a city and the stored image is confirmed
- **THEN** the postcard records the location it was stored at and the system stores no image

#### Scenario: Accepted but unconfirmed work leaves the postcard without art

- **GIVEN** a generator that accepts the work without reporting where the art was stored
- **WHEN** the stored image cannot yet be confirmed
- **THEN** the postcard is left without art and the production is retried

#### Scenario: Retrying a production targets the same location

- **GIVEN** a production whose art was not confirmed
- **WHEN** it is retried
- **THEN** it targets the same location rather than producing a second stored image

#### Scenario: An unreachable generator leaves the postcard without art

- **WHEN** the generator cannot be reached
- **THEN** the postcard is left without art and the failure is reported

#### Scenario: A refused request leaves the postcard without art

- **WHEN** the generator refuses the request
- **THEN** the postcard is left without art and the failure is reported

#### Scenario: A city is drawn with its country

- **WHEN** art is produced for a city
- **THEN** the generator is told both the city and the country it is in

#### Scenario: A country that cannot be expressed is omitted

- **GIVEN** a city whose country cannot be named in a way the generator accepts
- **WHEN** art is produced for it
- **THEN** the generator is told the city alone and art is produced

#### Scenario: A rejected city name is not retried

- **GIVEN** a city whose name the generator will not accept
- **WHEN** art is produced for it
- **THEN** the postcard is left without art and the production is not retried, because the name will not become acceptable

### Requirement: A postcard's art location cannot be guessed

The system SHALL name each postcard's stored art with a value dedicated to that production
alone, so that the location cannot be derived from the city depicted, from any identifier a
pilot can read for a city they have never visited, from any other postcard's location, or
from any sequence. A pilot SHALL NOT be able to reach the art of a postcard they have not
earned by reasoning about a city they can see or a postcard they hold.

#### Scenario: A readable city does not lead to its art

- **GIVEN** a pilot who can read a city and its identifier through an airport they have never flown to
- **THEN** that city's postcard art cannot be reached from anything they can read

#### Scenario: One art location does not lead to another

- **GIVEN** a pilot holding one postcard and its art location
- **THEN** no other postcard's art location can be derived from it

#### Scenario: Art location does not encode the city

- **GIVEN** a postcard for a named city
- **THEN** its art location does not encode that city's name or identifier

### Requirement: A postcard is produced when its city comes into existence

The system SHALL produce a city's postcard when the city is created, without delaying the
creation of the city or of the airport that caused it, so that a postcard is ready before
any pilot reaches that city and no art production ever runs while a flight is being
reported. A failure to produce the art SHALL NOT fail the creation of the city.

#### Scenario: A new city is given a postcard

- **WHEN** a city is created
- **THEN** a postcard for that city is produced

#### Scenario: Producing art does not delay creating the airport

- **WHEN** an airport is created in a city that does not yet exist
- **THEN** the airport is created without waiting for the postcard's art

#### Scenario: Failed art does not fail the city

- **GIVEN** a generator that cannot be reached
- **WHEN** a city is created
- **THEN** the city is created and its postcard is left without art

### Requirement: A pilot's first arrival in a city awards them its postcard

The system SHALL award a city's postcard to the flight's captain the first time they land
in that city, and SHALL award nothing on any later landing there, so that a postcard is
earned once and a returning pilot's visit count grows without their collection growing. A
flight with no captain SHALL award nothing.

#### Scenario: A first arrival awards the postcard

- **GIVEN** a pilot who has never landed in Paris
- **WHEN** they complete a flight landing in Paris
- **THEN** they are awarded the Paris postcard

#### Scenario: A return visit awards nothing

- **GIVEN** a pilot who already holds the Paris postcard
- **WHEN** they complete another flight landing in Paris
- **THEN** they still hold one Paris postcard

#### Scenario: The captain is awarded, not the dispatcher

- **GIVEN** a flight created by an operations user and flown by a cabin crew captain
- **WHEN** the flight completes
- **THEN** the captain is awarded the postcard and the operations user is not

#### Scenario: An uncrewed flight awards nothing

- **WHEN** a flight with no captain completes
- **THEN** no postcard is awarded

### Requirement: An award does not wait for the art

The system SHALL award a postcard whose art has not yet been produced, reporting it as
awaiting its art, so that a pilot who reaches a city before its art exists still holds the
postcard and receives the art once it is produced. Awarding SHALL NOT depend on the
external generator being reachable.

#### Scenario: A postcard without art is still awarded

- **GIVEN** a city whose postcard has no art
- **WHEN** a pilot lands there for the first time
- **THEN** they are awarded the postcard and it is reported as awaiting its art

#### Scenario: Art produced later reaches the holder

- **GIVEN** a pilot holding a postcard that is awaiting its art
- **WHEN** the art is produced
- **THEN** the pilot's postcard reports that art

### Requirement: A pilot reads only the postcards they have earned

The system SHALL report to a pilot the postcards they hold and how many postcards exist in
total, and SHALL NOT disclose which cities the postcards they do not hold depict. A request
for a specific postcard the pilot does not hold SHALL be reported as not found, so that the
response does not confirm whether that postcard exists.

#### Scenario: A collection reports what is held and how many exist

- **GIVEN** a pilot holding three postcards while twelve exist
- **WHEN** they read their collection
- **THEN** their three postcards are reported along with a total of twelve

#### Scenario: Unearned postcards are not described

- **GIVEN** a pilot who does not hold the Warsaw postcard
- **WHEN** they read their collection
- **THEN** neither Warsaw nor its art appears

#### Scenario: An unearned postcard is not found

- **GIVEN** a postcard the pilot does not hold
- **WHEN** they read that postcard directly
- **THEN** the request is rejected as not found

#### Scenario: A pilot who has earned nothing has an empty collection

- **WHEN** a pilot holding no postcards reads their collection
- **THEN** the collection is empty, the total is still reported, and the request succeeds

### Requirement: A collection belongs to the pilot who reads it

The system SHALL scope every collection read to the authenticated caller, so that a caller
reads their own postcards and never another pilot's, and SHALL reject an unauthenticated
read as unauthorized. Any authenticated role SHALL be able to read its own collection.

#### Scenario: A pilot reads their own collection

- **WHEN** an authenticated pilot reads their collection
- **THEN** the response holds their own postcards and no other pilot's

#### Scenario: Cabin crew may read their collection

- **WHEN** a cabin crew user reads their collection
- **THEN** the request succeeds

#### Scenario: An administrator may read their collection

- **WHEN** an administrator reads their collection
- **THEN** the request succeeds

#### Scenario: An unauthenticated caller cannot read a collection

- **WHEN** a request for a collection carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: A pilot's first sight of a postcard is marked once

The system SHALL record whether a pilot has seen each postcard they hold, reporting a newly
awarded postcard as unseen until the pilot acknowledges it, so that a client can present
its reveal exactly once even if the pilot was not using the application when the flight
landed. Acknowledging a postcard already seen SHALL succeed and change nothing, and a pilot
SHALL NOT be able to acknowledge a postcard they do not hold.

#### Scenario: A new award is unseen

- **WHEN** a pilot is awarded a postcard
- **THEN** it is reported as unseen

#### Scenario: Acknowledging marks it seen

- **GIVEN** a pilot holding an unseen postcard
- **WHEN** they acknowledge it
- **THEN** it is reported as seen

#### Scenario: Acknowledging twice changes nothing

- **GIVEN** a postcard the pilot has already acknowledged
- **WHEN** they acknowledge it again
- **THEN** the request succeeds and the postcard remains seen with its original moment

#### Scenario: A postcard not held cannot be acknowledged

- **GIVEN** a postcard the pilot does not hold
- **WHEN** they acknowledge it
- **THEN** the request is rejected as not found

### Requirement: Operations can inspect every postcard

The system SHALL let an operations user read every postcard and its art regardless of who
holds it, because art cannot be judged unsuitable without being looked at. The system SHALL
report for each postcard the city it depicts, its art, whether it is awaiting art, and how
many pilots hold it. Callers who are not operations users SHALL be refused, and an
unauthenticated caller SHALL be rejected as unauthorized.

#### Scenario: An operations user sees all postcards

- **WHEN** an operations user reads the postcards
- **THEN** every postcard is reported with its city, its art, whether it awaits art, and how many pilots hold it

#### Scenario: An operations user sees postcards nobody holds

- **GIVEN** a postcard no pilot has earned
- **WHEN** an operations user reads the postcards
- **THEN** that postcard is reported

#### Scenario: Cabin crew cannot inspect all postcards

- **WHEN** a cabin crew user reads the postcards
- **THEN** the request is rejected as forbidden

#### Scenario: An administrator cannot inspect all postcards

- **WHEN** an administrator reads the postcards
- **THEN** the request is rejected as forbidden

#### Scenario: An unauthenticated caller cannot inspect all postcards

- **WHEN** a request to read the postcards carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: Operations can order a postcard's art replaced

The system SHALL let an operations user order a postcard's art produced again, replacing it
for every pilot who holds that postcard, so that unsuitable art can be repaired without a
deployment. The replacement SHALL be stored at a new location, so that a pilot or a cache
holding the previous location is not served the art that was replaced. Replacing art SHALL
NOT change whether a pilot has seen the postcard, so no pilot is shown a reveal a second
time. A postcard whose art is already being produced SHALL NOT be asked to produce it again.
Callers who are not operations users SHALL be refused, and an unauthenticated caller SHALL be
rejected as unauthorized.

#### Scenario: Replaced art reaches every holder

- **GIVEN** two pilots holding the same postcard
- **WHEN** an operations user orders its art replaced
- **THEN** both pilots' postcards report the new art

#### Scenario: The replacement is stored at a new location

- **WHEN** a postcard's art is replaced
- **THEN** the new art is at a location that the previous art was not, so a stale location cannot serve it

#### Scenario: Replacing art does not re-reveal it

- **GIVEN** a pilot who has already seen a postcard
- **WHEN** its art is replaced
- **THEN** the postcard is still reported as seen

#### Scenario: Art already being produced is not produced twice

- **GIVEN** a postcard whose art is being produced
- **WHEN** an operations user orders it produced again
- **THEN** the request is refused and one production remains in progress

#### Scenario: A postcard that does not exist cannot be replaced

- **WHEN** an operations user orders art replaced for a postcard that does not exist
- **THEN** the request is rejected as not found

#### Scenario: Cabin crew cannot replace art

- **WHEN** a cabin crew user orders a postcard's art replaced
- **THEN** the request is rejected as forbidden

#### Scenario: An administrator cannot replace art

- **WHEN** an administrator orders a postcard's art replaced
- **THEN** the request is rejected as forbidden

#### Scenario: An unauthenticated caller cannot replace art

- **WHEN** a request to replace a postcard's art carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: Operations can override what is drawn when art is replaced

The system SHALL let an operations user replacing a postcard's art override the name that is
drawn, so that a city the generator will not accept can still be given art, and SHALL let
them override the art's proportions and fidelity. Where no override is given, the postcard's
own city and the system's defaults SHALL be used. An override SHALL apply to that production
only and SHALL NOT rename the city.

#### Scenario: A rejected city is given art under an accepted name

- **GIVEN** a city whose name the generator will not accept, whose postcard has no art
- **WHEN** an operations user replaces its art overriding the name to draw
- **THEN** art is produced and the postcard reports it

#### Scenario: An override does not rename the city

- **WHEN** an operations user replaces a postcard's art overriding the name to draw
- **THEN** the city's own name is unchanged

#### Scenario: Omitted overrides fall back to the city and the defaults

- **WHEN** an operations user replaces a postcard's art without overrides
- **THEN** the postcard's own city is drawn at the system's default proportions and fidelity

#### Scenario: An unusable override is rejected

- **WHEN** an operations user replaces a postcard's art with proportions the generator will not accept
- **THEN** the request is rejected as a validation error and the existing art is unchanged

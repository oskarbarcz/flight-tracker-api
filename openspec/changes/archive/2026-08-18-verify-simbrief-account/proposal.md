## Why

A pilot's SimBrief user ID is the key to every flight plan the system imports for them, and
until now anything at all could be stored in that field. A typo was accepted silently and
only surfaced later, at the moment the pilot tried to create a flight from SimBrief, as a
failed import with nothing to distinguish "your ID is wrong" from "SimBrief is down".

The provider client made that indistinguishable by construction. Any non-OK response became
a generic `Error` rethrown from the client, so a 400 for an unknown user, a 502 from
SimBrief and a JSON body reporting `fetch.status: unknown userid` under a 200 all arrived at
the caller identically. SimBrief in fact answers an unknown user in more than one way, and
the client recognised none of them.

There was also no way for a pilot to confirm an ID before committing it. The number lives in
SimBrief's account settings and means nothing on its own — a pilot pasting six digits has no
feedback until a flight import either works or does not.

## What Changes

- Add `GET /api/v1/user/simbrief/{simbriefUserId}`, which resolves an ID against SimBrief and
  answers with the account and the most recent flight plan generated on it: callsign, origin
  and destination, aircraft, scheduled off-block and on-block times, and when the plan was
  generated. A pilot can therefore recognise their own account before saving the ID.
- Answer `404` when SimBrief does not know the ID, and `502` when SimBrief cannot be reached
  or answers something unusable — two distinct outcomes where there used to be one opaque
  failure.
- Verify the ID against SimBrief when it is saved on a profile, and reject an unknown one
  with a validation error naming the account rather than the field.
- Accept a well-formed ID that SimBrief could not confirm, logging the reason. A provider
  outage must not stop a pilot from editing their profile.
- Constrain the field to digits, since a SimBrief user ID is numeric, so an obviously wrong
  value is rejected without asking SimBrief at all.
- Teach the provider client the shapes SimBrief uses for an unknown user — a `400`, and a
  success response whose payload reports `unknown userid` — and separate "no such account"
  from "provider failure" for every caller, the flight import included.
- Report the text fields a plan leaves empty as null rather than as SimBrief's empty-element
  object, and URL-encode the user ID on the way out.

## Capabilities

### New Capabilities

- `simbrief-account-verification`: resolving a SimBrief user ID to its account, the outcome
  taxonomy for that lookup, and the verification applied when the ID is stored on a profile.

### Modified Capabilities

- `user-profile-self-service`: the Simbrief user ID is now constrained to digits and
  verified against SimBrief before it is stored.

## Impact

- **API**: one new authenticated endpoint. `PATCH /api/v1/user/me` gains two rejection
  paths for `simbriefUserId` — a validation violation for a non-numeric value and a bad
  request naming the unknown account.
- **Behaviour change for existing callers**: a profile update carrying an ID SimBrief does
  not know now fails where it used to succeed. Stored IDs are not re-verified, so no
  existing profile is invalidated.
- **Code**: `SimbriefClient` gains `findOperationalFlightPlan` (null for an unknown user)
  alongside `getOperationalFlightPlan` (throws), plus the two provider errors; the `users`
  module gains the verify query, the assert query, and the action.
- **Errors**: `SimbriefUserNotFoundError` (404) and `SimbriefUnavailableError` (502) at the
  provider, `InvalidSimbriefUserIdError` (400) for the profile path.
- **Tests**: unit specs for the client's outcome taxonomy, the verify query and the assert
  query; a functional feature for the endpoint and profile scenarios for both rejections;
  SimBrief mock fixtures for a known and an unknown account.
- **Test layout**: `features/user/` is reorganised into one directory per concern —
  `account/`, `aircraft/`, `discord/`, `identity/`, `management/`, `profile/`, `simbrief/`,
  `statistics/`, `travel/` — because a flat directory of eighteen features had stopped
  saying which endpoint each one covered.

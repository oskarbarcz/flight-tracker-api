## 1. Prerequisites

- [ ] 1.1 Confirm `add-self-service-password-change` has landed: `UsersRepository.verifyPassword`, `UsersRepository.setPassword`, `SessionService.closeAllForUserExcept`, and `PasswordNotSetError` all exist, and the Google-only seed user is present.

## 2. Repository

- [ ] 2.1 Add `unlinkGoogleAccount(userId: string): Promise<void>` to `UsersRepository`: load the user (throw `UserNotFoundError` when missing) and update `googleId` to `null`, mirroring the existing `linkGoogleAccount`.

## 3. Errors and DTOs

- [ ] 3.1 Add `PasswordAlreadySetError extends ConflictError` and `GoogleAccountNotLinkedError extends ConflictError` to `src/modules/auth/model/error/auth.error.ts`.
- [ ] 3.2 Add `SetPasswordDto` (`newPassword`: `@IsString() @IsNotEmpty() @MinLength(8)`) and `UnlinkGoogleAccountDto` (`currentPassword`: `@IsString() @IsNotEmpty()`) under `src/modules/auth/infra/http/request/`.

## 4. Commands

- [ ] 4.1 Add `SetPasswordCommand(userId, sessionId, newPassword)` + handler in `src/modules/auth/application/command/set-password.command.ts`: throw `PasswordAlreadySetError` when the account already has a password; `UsersRepository.setPassword`; `SessionService.closeAllForUserExcept(userId, sessionId)`.
- [ ] 4.2 Add `UnlinkGoogleAccountCommand(userId, currentPassword)` + handler in `src/modules/auth/application/command/unlink-google-account.command.ts`, guards in this order: `GoogleAccountNotLinkedError` when `googleId === null`; `PasswordNotSetError` when `password === null`; `InvalidCredentialsError` when `verifyPassword` fails; then `unlinkGoogleAccount`.

## 5. HTTP actions

- [ ] 5.1 Add `SetPasswordAction`: `@Controller('/api/v1/auth')`, `@Post('password')`, `@HttpCode(HttpStatus.NO_CONTENT)`, no `@Role`; `sub` and `session` from `AuthorizedRequest`; assign the command to a `const` before `execute`.
- [ ] 5.2 Add `UnlinkGoogleAccountAction`: `@Post('google/unlink')`, `@HttpCode(HttpStatus.NO_CONTENT)`, no `@Role`; mirror the Swagger metadata of the existing `LinkGoogleAccountAction`.
- [ ] 5.3 Swagger for both: `@ApiTags('auth')`, `@ApiBearerAuth('jwt')`, `@ApiNoContentResponse()`, `@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`, `@ApiConflictResponse`, and an `@ApiOperation` description stating each endpoint's precondition (`POST /password` requires an account with no password; `PATCH /password` requires one with a password).

## 6. Module wiring

- [ ] 6.1 Register both handlers in `providers` and both actions in `controllers` of `auth.module.ts`.

## 7. Functional tests

- [ ] 7.1 Add `features/auth/auth.google-unlink.feature`. The full escape journey as one scenario: sign in as the Google-only seed user with the ID-token fixture used by `features/auth/auth.google-sign-in.feature`; `POST /api/v1/auth/password` returns `204`; sign-in with email and the new password returns `200`; `POST /api/v1/auth/google/unlink` with that password returns `204`; Google sign-in with the same ID token now returns `401`; email/password sign-in still returns `200`. Reset the database at the end.
- [ ] 7.2 Set-password rejections: `operations@example.com` (already has a password) gets `409` and can still sign in with `P@$$w0rd`; a `newPassword` shorter than 8 characters gets `400` with the `violations` map; unauthenticated gets `401`.
- [ ] 7.3 Unlink rejections: the Google-only user before setting a password gets `409` (`PasswordNotSetError`); `operations@example.com` (no `googleId`) gets `409` (`GoogleAccountNotLinkedError`); `admin@example.com` with a wrong `currentPassword` gets `401` and stays linked; unauthenticated gets `401`; unlinking `admin@example.com` twice gives `204` then `409`.
- [ ] 7.4 Relink: after unlinking `admin@example.com`, `POST /api/v1/auth/google/link` with the same ID token returns `204` and Google sign-in works again.
- [ ] 7.5 Session behavior: setting a first password revokes another session's refresh token while the acting session's still refreshes; unlinking leaves the acting session's refresh token working.
- [ ] 7.6 Gate release: after the Google-only user sets a password, `PATCH /api/v1/auth/password` with it succeeds, and `POST /api/v1/auth/password-reset` for that user's address now sends a reset email (previously suppressed) — include only if the reset change has landed.
- [ ] 7.7 Actor matrix: both endpoints are self-scoped, so admin and cabin-crew each succeed on their own account (in separate scenarios) and unauthenticated is `401`; there is no `403` case.

## 8. Documentation

- [ ] 8.1 Update the README's Google Sign-In section: it currently describes the flow as link-only with no way back. Document `POST /api/v1/auth/google/unlink`, `POST /api/v1/auth/password`, the "set a password before unlinking" ordering rule, and the resulting account states (Google-only, password-only, both).

## 9. Verify

- [ ] 9.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [ ] 9.2 `docker compose exec app npx cucumber-js features/auth/auth.google-unlink.feature` passes.
- [ ] 9.3 The full `features/auth` suite still passes — in particular `auth.google-link.feature` and `auth.google-sign-in.feature`, which share the seeded `googleId` fixtures this feature mutates.

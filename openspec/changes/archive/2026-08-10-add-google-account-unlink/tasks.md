## 1. Repository

- [x] 1.1 Add `hasLinkedGoogleAccount(userId)`, `hasPassword(userId)` and `unlinkGoogleAccount(userId)` to `UsersRepository`, alongside the existing `linkGoogleAccount`, `verifyPassword` and `setPassword`

## 2. Errors and DTOs

- [x] 2.1 Add `PasswordAlreadySetError` and `CannotUnlinkWithoutPasswordError` (both conflicts) to `src/modules/users/model/error/user-password.error.ts`, and `UserHasNoLinkedGoogleAccountError` to `src/modules/users/model/error/user.error.ts`
- [x] 2.2 Add `SetPasswordDto` under the users module, validating `newPassword` with the same `IsStrongPassword` rules as the password change (12 characters, upper, lower, number, symbol)
- [x] 2.3 Add `UnlinkGoogleAccountDto` under the auth module, requiring `currentPassword`

## 3. Commands

- [x] 3.1 Add `SetPasswordCommand` + handler in the users module: reject with `PasswordAlreadySetError` when the account already has a password, store the new one, then dispatch `SignOutOtherSessionsCommand` for the acting session
- [x] 3.2 Add `UnlinkGoogleAccountCommand` + handler in the auth module, guarding in order: `UserHasNoLinkedGoogleAccountError` when nothing is linked, `CannotUnlinkWithoutPasswordError` when the account has no password, `InvalidCredentialsError` when the submitted password does not verify, then clear the link
- [x] 3.3 Cover both handlers with colocated Jest specs, including each guard and its ordering

## 4. HTTP actions

- [x] 4.1 Add `SetPasswordAction` for `POST /api/v1/user/me/set-password`, answering `204`, taking `sub` and `session` from the authorized request
- [x] 4.2 Add `UnlinkGoogleAccountAction` for `POST /api/v1/user/me/unlink-google-account`, answering `204` and mirroring the Swagger metadata of the link action
- [x] 4.3 Register the handlers in `providers` and the actions in `controllers` of `UsersModule` and `AuthModule`

## 5. Test fixtures

- [x] 5.1 Add a JWKS key and ID token fixture for the Google-only user to `docker/mock/google.json`
- [x] 5.2 Seed refresh-token sessions for the admin and the Google-only user in `prisma/seed/resource/session.seed.ts`, so the session-revocation scenarios can refresh a second session
- [x] 5.3 Add the `I am signed in with Google using ID token {string}` step to the REST context

## 6. Functional tests

- [x] 6.1 Add `features/user/user.set-password.feature`: the Google-only escape journey (set a password, sign in with it, Google sign-in still works), the conflict for accounts that already have one, the strength and missing-value rejections, session revocation, and the unauthorized case
- [x] 6.2 Add `features/user/user.unlink-google-account.feature`: unlink then Google sign-in rejected while password sign-in still works, relinking afterwards, sessions surviving the unlink, the wrong-password rejection, both conflicts (no password, nothing linked), the missing-password rejection, and the unauthorized case

## 7. Documentation

- [x] 7.1 Update the README's Google Sign-In section: the unlink and set-password endpoints, the "set a password first" ordering rule, and the resulting account states

## 8. Verification

- [x] 8.1 Run lint, format, build and the Jest unit suite
- [x] 8.2 Run the new features, then the full `features/auth` and `features/user` suites, which share the seeded `googleId` fixtures these scenarios mutate

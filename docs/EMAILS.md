# Emails

MyPreflight sends email sparingly: only for the two things that decide who can get into your account — your password
and your email address. Everything about your flights happens in the app or over Discord, never by email.

Every message is plain text, and every link in one works **once** and then expires.

| When                                  | Sent to               | Subject                                   |
|---------------------------------------|-----------------------|-------------------------------------------|
| You ask to reset a forgotten password | the address you typed | *Reset your password*                     |
| You ask to change your email address  | the new address       | *Confirm your new email address*          |
| You ask to change your email address  | your current address  | *Your email address change was requested* |

## Reset your password

Sent when someone asks to reset the password of an account, from the sign-in screen where no one is signed in yet.

The message says that a reset was requested, gives the link that lets you choose a new password, states that it
expires in **one hour**, and tells you to ignore the message if you did not ask — your password stays as it is until
the link is used.

Nothing is sent if no account uses that address, or if the account signs in with Google only and therefore has no
password to reset. The app's answer looks the same in every case, so nobody can use the reset form to find out which
addresses have accounts here.

Asking again within five minutes sends no second message: the first link is still valid, and a mailbox full of
reset links makes it harder, not easier, to tell which one to trust.

Choosing a new password signs you out on every device, and cancels a pending email change if one was waiting to be
confirmed.

## Confirm your new email address

Sent to the **new** address as soon as you request the change from your account settings, which asks for your
current password first.

The message names the address the account is moving to, gives the link that confirms it, states that it expires in
**24 hours**, and tells you that ignoring it changes nothing.

The change only takes effect when this link is opened, which is what proves the new address exists and reaches you.
Until then you keep signing in with the old one. Confirming signs you out on every device — sign back in with the
new address.

## Your email address change was requested

Sent to your **current** address at the same time as the message above, so a change can never happen behind your
back.

The message names the address that was requested, explains that nothing changes until that address confirms, and —
if this was not you — tells you to change your password immediately, because whoever asked for the change knew your
current one. Changing your password does exactly what that warning implies: the pending confirmation link stops
working.

## What never arrives by email

Password changes you make while signed in, linking or unlinking Google and Discord, and sign-ins from new devices
send no email. Neither does anything about a flight — briefings, loadsheets and delay requests are Discord direct
messages, described in [the Discord document](DISCORD.md).

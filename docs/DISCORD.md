# Discord

MyPreflight talks to Discord in two ways: a **bot** that posts to the community server and sends you direct
messages about the flight you are operating, and **account linking**, which proves that a Discord account is yours
so you can sign in with it and receive those messages.

## Announcements in the server

Two moments in every flight are announced publicly in the server's announcements channel:

- boarding starts,
- the flight goes on block.

Nothing you do controls these — they are about the flight, not about you.

## Direct messages to the pilot

Five messages can arrive in your Discord inbox:

| When                                       | What you get              |
|--------------------------------------------|---------------------------|
| You check in for a flight                  | the flight briefing       |
| Boarding starts                            | the preliminary loadsheet |
| Boarding finishes                          | the final loadsheet       |
| A departure delay is raised on your flight | a request to allocate it  |
| Operations approves that allocation        | a confirmation            |

They always go to the flight's **captain** — the pilot who checked in — never to whoever happened to perform the
action, because a delay is raised by the system with no person behind it and approved by an operations user. A
flight nobody has checked in for gets no messages at all.

### Flight briefing

The briefing names the flight, its route and its aircraft, then lays out the estimated schedule as an
`out` / `off` / `on` / `in` block with the resulting block time. Below that come the ATIS, METAR and TAF for the
**departure** airport, reproduced exactly as the weather provider published them. A report that is not available is
left out rather than shown empty — ATIS in particular is often missing, so plenty of briefings have none.

If the flight was imported from SimBrief, its OFP is attached to the message.

### Preliminary and final loadsheet

Both list the crew assigned to the flight with their roles, and carry the passenger, cargo, payload, zero-fuel and
block-fuel figures. A flight with no crew assigned simply omits the crew section, and a flight without a loadsheet
produces no message.

### Delay messages

The first message states how many minutes you need to allocate and links straight to the delay screen for that
flight. The second confirms that operations approved what you allocated. A delay report that gets rejected sends
nothing.

## Choosing what you receive

Every direct message can be switched off separately in your account settings — briefing, preliminary loadsheet,
final loadsheet, and delay updates. All of them start switched **on**, so nothing has to be opted into, and turning
one off leaves the others alone. The two delay messages share one switch, since a pilot who does not want the
request does not want the approval either.

## Rich presence

Rich presence publishes the flight you are operating as your Discord activity, so anyone who can see your profile
sees what you are flying: the status of the flight in plain words, the city pair, and a timer counting down to
takeoff or landing.

It is the one Discord setting that starts switched **off**, precisely because it shows what you are doing to other
people. Turning it on is your consent for the flight to be published.

Discord only lets an activity be set from your own machine, so this is the one feature that needs the companion
desktop client running next to your simulator. MyPreflight hands it the activity, the client hands it to Discord.
Your Discord account does not have to be linked for this — the companion client signs in to Discord as you. When
rich presence is off, or you are not on a flight, nothing is published and any activity already showing is cleared.

## Linking your Discord account

Linking is what makes direct messages and Discord sign-in possible. You are sent to Discord, you approve, and you
come back linked.

**Sharing the server with the bot is not a detail — it is the requirement.** Discord only lets the bot write to
someone who is in the same server, so a linked account that never joined receives no briefings even with every
switch on. Linking can join you to the server in the same approval step; if that join fails, the link still stands
and you can join later with an invite. Your account screen shows whether you are currently a member.

Signing in with Discord works only for an account that has already been linked. It never creates a new MyPreflight
account, so the first step is always linking from an account you are signed in to.

Unlinking asks for your password and never removes you from the server. MyPreflight stores no Discord access token —
approving the link grants it for that one moment and it is discarded immediately afterwards, which is why joining
the server later means using an invite or linking again.

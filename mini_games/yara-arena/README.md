# Dark Forest Arena

This is a local, offline 2v2 turn-based prototype. Choose two of the four
fighters; the other two are controlled by a basic local opponent. Each side
has 20 seconds to act. The match runs only in the current browser and does not
create an online room or save match state.

The fighter stats, attack rules, and recovery amount reuse data from
`mini_games/yara-rpg/js/data/hero.js`, `game-rules.js`, and `monsters.js`.

## Future multiplayer seam

`js/arena.js` keeps a small set of match transitions (`startTurn`,
`executeAttack`, `finishAction`) that can later be connected to a room
transport. For online play:

- Keep authoritative match state and turn deadlines on a server or trusted
  realtime backend. The client countdown is currently presentation-only.
- Send player actions to the room service; validate active player, turn,
  target, resource costs, and timer on the server before broadcasting results.
- Replace local CPU actions with the other participant's room action.
- Store room IDs and membership on the backend; never put admin/service secrets
  in this static GitHub Pages project.

The current prototype intentionally has no network client, account system,
room code, or multiplayer persistence.

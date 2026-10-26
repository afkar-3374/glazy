/**
 * The signed-in couple. Live rooms (calls, presence, hugs, the world) are named
 * "<room>:<couple id>" and the database only lets that couple join them; encrypted
 * files live in the couple's own storage folder.
 */
let coupleId: string | null = null;

export function setCoupleId(id: string | null): void {
  coupleId = id;
}

export function getCoupleId(): string | null {
  return coupleId;
}

/** Private realtime channel name for this couple. */
export function coupleTopic(room: string): string {
  if (!coupleId) throw new Error('Not signed in');
  return `${room}:${coupleId}`;
}

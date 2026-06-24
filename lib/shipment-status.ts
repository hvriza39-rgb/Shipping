import type { ShipmentStatus } from "@prisma/client";

// Single source of truth for which status transitions are allowed.
// Used by the API (to reject illegal status changes) and the admin
// dashboard UI (to only offer legal "Move to" options in the popover).
export const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING:          ["CONFIRMED", "CANCELLED"],
  CONFIRMED:        ["PICKED_UP", "CANCELLED"],
  PICKED_UP:        ["IN_TRANSIT"],
  IN_TRANSIT:       ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  FAILED:           ["RETURNED"],
  DELIVERED:        [],
  RETURNED:         [],
  CANCELLED:        [],
};

export function isValidTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  // Same-status "updates" are allowed — that's how the UI does a
  // location/note-only push without changing the actual status.
  if (from === to) return true;
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

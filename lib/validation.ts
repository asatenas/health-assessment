// UUID v4 validation pattern
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Chat token pattern: XXXX-XXXX (uppercase hex digits)
export const TOKEN_REGEX = /^[A-F0-9]{4}-[A-F0-9]{4}$/;

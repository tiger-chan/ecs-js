export const PAGE_SIZE = 1000;
const ID = 0xFFFFF;
const VERSION = 0xFFF;
export const VERSION_SHIFT = 20;

export const ID_MASK = ID;
export const VERSION_MASK = VERSION;
export const RESERVED = ID_MASK | (VERSION_MASK << VERSION_SHIFT);

export const NULL = RESERVED;
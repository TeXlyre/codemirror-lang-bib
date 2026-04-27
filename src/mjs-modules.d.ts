declare module '*.mjs' {
    import { LRParser } from '@lezer/lr';
    export const parser: LRParser;
}
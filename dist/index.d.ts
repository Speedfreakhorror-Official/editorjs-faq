import type { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';
export interface FaqRow {
    q: string;
    a: string;
}
export interface FaqData {
    items: FaqRow[];
}
export interface FaqConfig {
    max?: number;
}
/** Fills defaults and drops unknown top-level keys and rows with neither question nor answer. */
export declare function normalize(data: unknown, max?: number): FaqData;
/** True when there is a row and every row has both a question and an answer. */
export declare const isValid: (d: FaqData) => boolean;
/** True when no row has a question or an answer (the only block `validate` refuses). */
export declare const isEmpty: (d: FaqData) => boolean;
export default class FaqTool implements BlockTool {
    private opts;
    private rows;
    private root;
    constructor(opts: BlockToolConstructorOptions<FaqData, FaqConfig>);
    static get toolbox(): {
        title: string;
        icon: string;
    };
    static get isReadOnlySupported(): boolean;
    static get sanitize(): {
        items: {
            q: boolean;
            a: {
                b: boolean;
                i: boolean;
                u: boolean;
                s: boolean;
                sup: boolean;
                sub: boolean;
                mark: boolean;
                code: boolean;
                a: {
                    href: boolean;
                };
            };
        };
    };
    render(): HTMLElement;
    save(): FaqData;
    validate(data: FaqData): boolean;
    private draw;
}

// Type declarations for Editor.js plugins that lack official TypeScript types

declare module '@editorjs/checklist' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    interface ChecklistData {
        items: Array<{
            text: string;
            checked: boolean;
        }>;
    }

    export default class Checklist implements BlockTool {
        constructor(config: BlockToolConstructorOptions<ChecklistData>);
        render(): HTMLElement;
        save(block: HTMLElement): ChecklistData;
        static get toolbox(): { icon: string; title: string };
    }
}

declare module '@editorjs/marker' {
    import { InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs';

    export default class Marker implements InlineTool {
        constructor(config: InlineToolConstructorOptions);
        render(): HTMLElement;
        surround(range: Range): void;
        checkState(selection: Selection): boolean;
        static get sanitize(): { mark: { class: string } };
    }
}

declare module '@editorjs/inline-code' {
    import { InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs';

    export default class InlineCode implements InlineTool {
        constructor(config: InlineToolConstructorOptions);
        render(): HTMLElement;
        surround(range: Range): void;
        checkState(selection: Selection): boolean;
        static get sanitize(): { code: { class: string } };
    }
}

declare module '@editorjs/delimiter' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    export default class Delimiter implements BlockTool {
        constructor(config: BlockToolConstructorOptions);
        render(): HTMLElement;
        save(block: HTMLElement): object;
        static get toolbox(): { icon: string; title: string };
    }
}

declare module '@editorjs/code' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    interface CodeData {
        code: string;
    }

    export default class Code implements BlockTool {
        constructor(config: BlockToolConstructorOptions<CodeData>);
        render(): HTMLElement;
        save(block: HTMLElement): CodeData;
        static get toolbox(): { icon: string; title: string };
    }
}

declare module '@editorjs/quote' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    interface QuoteData {
        text: string;
        caption: string;
        alignment: 'left' | 'center';
    }

    export default class Quote implements BlockTool {
        constructor(config: BlockToolConstructorOptions<QuoteData>);
        render(): HTMLElement;
        save(block: HTMLElement): QuoteData;
        static get toolbox(): { icon: string; title: string };
    }
}

declare module '@editorjs/table' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    interface TableData {
        withHeadings: boolean;
        content: string[][];
    }

    export default class Table implements BlockTool {
        constructor(config: BlockToolConstructorOptions<TableData>);
        render(): HTMLElement;
        save(block: HTMLElement): TableData;
        static get toolbox(): { icon: string; title: string };
    }
}

declare module '@editorjs/header' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    interface HeaderData {
        text: string;
        level: 1 | 2 | 3 | 4 | 5 | 6;
    }

    export default class Header implements BlockTool {
        constructor(config: BlockToolConstructorOptions<HeaderData>);
        render(): HTMLElement;
        save(block: HTMLElement): HeaderData;
        static get toolbox(): { icon: string; title: string };
    }
}

declare module '@editorjs/list' {
    import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs';

    interface ListData {
        style: 'ordered' | 'unordered';
        items: string[];
    }

    export default class List implements BlockTool {
        constructor(config: BlockToolConstructorOptions<ListData>);
        render(): HTMLElement;
        save(block: HTMLElement): ListData;
        static get toolbox(): { icon: string; title: string };
    }
}

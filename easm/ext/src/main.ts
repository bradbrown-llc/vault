import {
    TextDocument,
    Position,
    CancellationToken,
    ExtensionContext,
    languages,
    Hover
} from 'vscode'
import * as opcodes from '@bradbrown-llc/easm-opcodes'

console.log(opcodes)

const {
    registerHoverProvider
} = languages

const opcodeHoverProvider = {
    provideHover: function(document:TextDocument, position:Position, token:CancellationToken) {
        const range = document.getWordRangeAtPosition(position)
        const text = document.getText(range)
        console.log(text, range, document, position, token)
        if (text in opcodes)
            return new Hover(JSON.stringify(opcodes[text as keyof typeof opcodes]))
        else return null
    }
}

export function activate(ctx:ExtensionContext) {
    ctx.subscriptions.push(
        registerHoverProvider({ pattern: '**/*.easm' }, opcodeHoverProvider))
}

export function deactivate() {}
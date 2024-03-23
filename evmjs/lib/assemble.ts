const { readDir, readFile, writeFile } = Deno
import { basename } from 'https://deno.land/std@0.208.0/path/basename.ts'

const opcodes = {
    // math
    'STOP': '00'          , 'ADD': '01'           , 'MUL': '02'           , 'SUB': '03'           ,
    'DIV': '04'           , 'SDIV': '05'          , 'MOD': '06'           , 'SMOD': '07'          ,
    'ADDMOD': '08'        , 'MULMOD': '09'        , 'EXP': '0A'           , 'SIGNEXTEND': '0B'    ,
    // logic
    'LT': '10'            , 'GT': '11'            , 'SLT': '12'           , 'SGT': '13'           ,
    'EQ': '14'            , 'ISZERO': '15'        , 'AND': '16'           , 'OR': '17'            ,
    'XOR': '18'           , 'NOT': '19'           , 'BYTE': '1A'          , 'SHL': '1B'           ,
    'SHR': '1C'           , 'SAR': '1D'           ,
    // hash
    'SHA3': '20'          ,
    // context/state
    'ADDRESS': '30'       , 'BALANCE': '31'       , 'ORIGIN': '32'        , 'CALLER': '33'        ,
    'CALLVALUE': '34'     , 'CALLDATALOAD': '35'  , 'CALLDATASIZE': '36'  , 'CALLDATACOPY': '37'  ,
    'CODESIZE': '38'      , 'CODECOPY': '39'      , 'GASPRICE': '3A'      , 'EXTCODESIZE': '3B'   ,
    'EXTCODECOPY': '3C'   , 'RETURNDATASIZE': '3D', 'RETURNDATACOPY': '3E', 'EXTCODEHASH': '3F'   ,
    'BLOCKHASH': '40'     , 'COINBASE': '41'      , 'TIMESTAMP': '42'     , 'NUMBER': '43'        ,
    'PREVRANDAO': '44'    , 'GASLIMIT': '45'      , 'CHAINID': '46'       , 'SELFBALANCE': '47'   ,
    'BASEFEE': '48'       ,
    // stack/mem/storage/context
    'POP': '50'           , 'MLOAD': '51'         , 'MSTORE': '52'        ,
    'MSTORE8': '53'       , 'SLOAD': '54'         , 'SSTORE': '55'        , 'JUMP': '56'          ,
    'JUMPI': '57'         , 'PC': '58'            , 'MSIZE': '59'         , 'GAS': '5A'           ,
    'JUMPDEST': '5B'      ,
    // stack (push)
    'PUSH0': '5F'         ,
    'PUSH1': '60'         , 'PUSH2': '61'         , 'PUSH3': '62'         , 'PUSH4': '63'         ,
    'PUSH5': '64'         , 'PUSH6': '65'         , 'PUSH7': '66'         , 'PUSH8': '67'         ,
    'PUSH9': '68'         , 'PUSH10': '69'        , 'PUSH11': '6A'        , 'PUSH12': '6B'        ,
    'PUSH13': '6C'        , 'PUSH14': '6D'        , 'PUSH15': '6E'        , 'PUSH16': '6F'        ,
    'PUSH17': '70'        , 'PUSH18': '71'        , 'PUSH19': '72'        , 'PUSH20': '73'        ,
    'PUSH21': '74'        , 'PUSH22': '75'        , 'PUSH23': '76'        , 'PUSH24': '77'        ,
    'PUSH25': '78'        , 'PUSH26': '79'        , 'PUSH27': '7A'        , 'PUSH28': '7B'        ,
    'PUSH29': '7C'        , 'PUSH30': '7D'        , 'PUSH31': '7E'        , 'PUSH32': '7F'        ,
    'DUP1': '80'          , 'DUP2': '81'          , 'DUP3': '82'          , 'DUP4': '83'          ,
    'DUP5': '84'          , 'DUP6': '85'          , 'DUP7': '86'          , 'DUP8': '87'          ,
    'DUP9': '88'          , 'DUP10': '89'         , 'DUP11': '8A'         , 'DUP12': '8B'         ,
    'DUP13': '8C'         , 'DUP14': '8D'         , 'DUP15': '8E'         , 'DUP16': '8F'         ,
    'SWAP1': '90'         , 'SWAP2': '91'         , 'SWAP3': '92'         , 'SWAP4': '93'         ,
    'SWAP5': '94'         , 'SWAP6': '95'         , 'SWAP7': '96'         , 'SWAP8': '97'         ,
    'SWAP9': '98'         , 'SWAP10': '99'        , 'SWAP11': '9A'        , 'SWAP12': '9B'        ,
    'SWAP13': '9C'        , 'SWAP14': '9D'        , 'SWAP15': '9E'        , 'SWAP16': '9F'        ,
    // log
    'LOG0': 'A0'          ,
    'LOG1': 'A1'          , 'LOG2': 'A2'          , 'LOG3': 'A3'          , 'LOG4': 'A4'          ,
    // pact/misc
    'CREATE': 'F0'        , 'CALL': 'F1'          , 'CALLCODE': 'F2'      , 'RETURN': 'F3'        ,
    'DELEGATECALL': 'F4'  , 'CREATE2': 'F5'       ,
    'STATICCALL': 'FA'    ,
    'REVERT': 'FD'        , 'INVALID': 'FE'       , 'SELFDESTRUCT': 'FF'
}

export default async ({ dir, verbose, PUSH0 }:{ dir:string, verbose?:true, PUSH0?:boolean }) => {
    // get pact files
    const files = await new Promise(r =>  (async () => { 
        const files = []
        for await (const entry of readDir(dir))
            if (entry.name.match('.asm'))
                files.push(entry.name)
        r(files)
    })()) as string[]
    // sanity organize files by name
    files.sort((a, b) => a < b ? -1 : 1)
    // decompose files into code
    const rawblocks = await Promise.all(files.map(async file => new TextDecoder().decode(await readFile(`${dir}/${file}`))))
    // join code blocks into one, by \n
    const raw = rawblocks.join('\n')
    // trim each line to len 32 / remove comments
    const trimmed = raw.replace(/(.{32}).*/gm, '$1')
    // split lines apart
    const split = trimmed.split('\n')
    // filter out blank lines
    const filtered = split.filter(line => line.trim() !== '')
    // split each line by label-code divider, trim tokens, convert nullish to null
    const labelcodes = filtered.map(line => [line.slice(0, 12), line.slice(12)].map(x => x.trim() ? x.trim() : null))
    // PUSH0 option specifies support for PUSH0, so !PUSH0 replaces PUSH0 with PUSH1 0x00
    if (!PUSH0) {
        let i
        while ((i = labelcodes.map(([_label, instr]) => instr).indexOf('PUSH0')) != -1) {
            labelcodes[i][1] = 'PUSH1'
            labelcodes.splice(i + 1, 0, [null, '0x00'])
        }
    }

    const debug = (msg:string) => { if (verbose) console.log(msg) }

    // initialize assembler loop
    const labels:Record<string,number> = {}, refs:Record<string,number> = {}
    let unresolved, changes, pc
    do {
        unresolved = 0, pc = 0, changes = 0
        for (const [i, line] of labelcodes.entries()) {
            const [label, instr] = line
            // if label, set label of labels to pc (if label is RUN, reset PC to 0)
            if (label) {
                if (label == 'RUN') {
                    debug(`RUN label, resetting PC`)
                    pc = 0 }
                if (labels[label] !== pc) {
                    debug(`updating label ${label}`)
                    changes++; labels[label] = pc }}
            if (instr) {
                // if instr is a ref
                    // and ref is defined, less than 256, and previous instr is a PUSH2, change previous instr to a PUSH1, inc changes, continue
                if (instr.match('&') || instr.match(/\./)) {
                    if (refs[instr] !== undefined && refs[instr] < 256 && labelcodes[i - 1][1] == 'PUSH2') {
                        debug(`optimizing PUSH2 to PUSH1`)
                        labelcodes[i - 1][1] = 'PUSH1'; changes++; continue }}
                // if instr has &
                    // if not label of instr without &, inc unresolved
                    // else if ref of instr != label of instr without &, inc changes and set
                if (instr.match('&')) {
                    if (labels[instr.slice(1)] === undefined) {
                        debug(`unresolved label ref ${instr}`)
                        unresolved++ }
                    else { if (refs[instr] !== labels[instr.slice(1)]) {
                        debug(`updating label ref ${instr}`)
                        changes++; refs[instr] = labels[instr.slice(1)] }}}
                // if instr has .
                    // if instr is .ro
                        // if not label of run, inc unresolved
                        // else if ref of instr != label of run, inc changes and set
                    // else if instr is .rs
                        // if not label of RUN or END, inc unresolved
                        // else if ref of instr != label of end - label of run, inc changes and set
                    // else throw unknown dot instr
                else if (instr.match(/\./)) {
                    if (instr == '.ro') {
                        if (labels['RUNOFF'] === undefined) {
                            debug(`unresolved .ro`)
                            unresolved++ }
                        else { if (refs[instr] !== labels['RUNOFF']) {
                            debug(`updating .ro`)
                            changes++; refs[instr] = labels['RUNOFF'] }}}
                    else if (instr == '.rs') {
                        if (labels['END'] === undefined) {
                            debug(`unresolved .rs`)
                            unresolved++ }
                        else { if (refs[instr] !== labels['END']) {
                            debug(`updating .ro`)
                            changes++; refs[instr] = labels['END'] }}}
                    else throw new Error(`unknown dot instr ${instr}`) }
                // if instr is literal, do nothing
                else if (!instr.match('0x')) pc++
                // if previous instr is PUSHx
                    // increment pc by x
                if (labelcodes[i - 1][1]?.match(/PUSH[1-9]/)) {
                    debug(`last instr was PUSHx (>0), incrementing pc`)
                    pc += parseInt(labelcodes[i - 1]?.[1]?.match(/PUSH(\d+)/)?.[1] ?? '0') }
            }
        }
        debug(JSON.stringify(labels))
        debug(JSON.stringify(refs))
        debug(`unresolved ${unresolved}`)
        debug(`changes ${changes}`)
        await new Promise(r => setTimeout(r, 100))
    } while (unresolved > 0 || changes > 0)
    
    // pass one more time through code to turn it into bytecode
    for (let i = 0; i < labelcodes.length; i++) {
        let instr = labelcodes[i][1] as keyof typeof opcodes
        // if no instr, remove line from code
        if (instr === null) { labelcodes.splice(i, 1); i--; continue }
        // decompose line into instr opcode
        // @ts-ignore in place mutation of array to value, need to rewrite this
        if (instr in opcodes) { labelcodes[i] = opcodes[instr]; continue }
        // resolve references into literals (reset instr if updated)
        if (instr.match('&') || instr.match(/\./)) { labelcodes[i][1] = `0x${refs[instr].toString(16).toUpperCase().padStart(4, '0')}`; instr = labelcodes[i][1] as keyof typeof opcodes }
        // decompose line into clean literal
        // @ts-ignore in place mutation of array to value, need to rewrite this
        if (instr.match(/^0x00$/)) labelcodes[i] = instr.replace('0x', '')
        // @ts-ignore in place mutation of array to value, need to rewrite this
        else if (instr.match('0x')) labelcodes[i] = instr.replace(/0x(00)*/, '')
    }

    const msize = labels['RUNOFF'] - labels['MAKE']
    const mcode = labelcodes.slice(labels['MAKE'], labels['MAKE'] + msize).join('')
    const rsize = labels['END'] - labels['RUN']
    const rcode = labelcodes.slice(labels['RUNOFF'], labels['RUNOFF'] + rsize).join('')
    const tsize = msize + rsize
    const tcode = labelcodes.slice(labels['MAKE'], labels['MAKE'] + tsize).join('')
    debug(`make size: ${msize}`)
    debug(`make code: ${mcode}`)
    debug(`run size: ${rsize}`)
    debug(`run code: ${rcode}`)
    debug(`total size: ${tsize}`)
    debug(`total code: ${tcode}`)

    // @ts-ignore using mutated labelcodes, ignore for now
    debug(labelcodes.join('').length / 2)
    const bytecode = `0x${tcode}`
    // const abi = JSON.parse(new TextDecoder().decode(await readFile(`${dir}/${basename(dir)}.abi`)))
    const abi = (await import(`../pact/${dir}/${basename(dir)}.ts`)).default
    return { bytecode, abi }
}
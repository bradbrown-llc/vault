import {
    Cache, sleep, processing,
    pullHeldBurns
} from '../../internal.ts'

// processing loop
while (true) {

    //  if processing size falls below a configured percent threshold
    if (
        processing.size
        / await Cache.get('maxProcessing')
        <= await Cache.get('pullThreshold')
    ) {
        // check KV sent, processing, and hold for mints and burns to process
        // recoverProcessingBurns()
        // recoverSentMints()
        pullHeldBurns()
    }
    // only run the above check once per configured interval
    await sleep(await Cache.get('pullInterval'))

}
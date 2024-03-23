pick which chains to watch

ethereum chainId should tell backend to watch a chain
backend should keep track of what is watching each watched chain
	ex. { watchers: ["metamask", "mine"] }
	to indicate mining app and metamask are both requesting the backend
	to watch a certain chain

if a chain is requested to be watched and isn't already being watched
start watching the chain and updating data

if it is already being watched, simply just add the new watcher to the
list and don't do anything else new or start any new watching processes

if a watcher stops watching a chain, only end the watching process for that
chain if and only if that was the final watcher watching that train

for example, if metamask and the mining app request to watch ETH
then the mining app stops watching ETH but metamask is still watching
don't stop watching ETH
if metamask switches to BSC, remove metamask as an ETH watcher
now that no watchers remain for ETH, actually stop the watching process for ETH

backend should start listening to events
	should record what block it started listening to events on,
	like B (inclusive)
backend should start a "catch up" process
	this should go from the "unknown" block to B - 1
	if no "unknown" block, set "unknown" to deploy block
"catch up" should scan chain in chunks from unknown to target
block looking for events
events found in the "catch up" process shouldn't be worked on
immediately, as the events are trades which may have been processed
later in the "catch up" zone

trades found from the active event listeners can be worked on
immediately

once the "catch up" process is complete, all trades discovered by
said process become workable

need to make a very easy trade, then work it
so I can make the logic the handles detecting and
deleting already worked trades
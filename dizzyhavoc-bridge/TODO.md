- (PARTIAL) ui for bridging (keep it very simple)
- (DONE) event scanner
- (DONE) long-term storage (so event scanner knows where to stop and start in case of any outage)
- (DONE) act on scanned events (requires below smart contract, should be minting)
- (PARTIAL - NEED UPDATE PIPELINE) smart contract updates (including the pipelines to deploy/execute the updates):
  - the bridge should have a key, and its address should be allowed to mint
  - a new burn function needs to be created, so users can burn funds to bridge them to another chain:
    - will need a destination chain & address & amount, should create a unique ID (in case of outage, we can audit everything)
    
an idea which i had that i probably won't do:
deploy to the highest 2^n amount of chains you can before deploying the bridge
then separate all chains into pairs of closest value
then enable bridging between those pairs
then, after a bit (price equalize?)
separate all the pairs into pairs of pairs of closest value
enable bridign between the 4 chains involved
etc.
until we finally merge two halves, each half consisting of half of the dzhv chains

or rotate which chains can bridge to which
so there isn't one big catastrophic arb event, but the same philosophy of orbicular, a regularly occurring arb event
could become some sort of spectacle
could also be a terrible idea

(DONE) we /really/ want to solve for the lapse of minting in case of an outage, it would be very nice
(DONE) nonce needs to go into storage as well

update ERC20 with new bridge/burn function
update ERC20 so bridge can mint tokens

anyone can burn to any chain, to any addr (doesn't have to be sender necessarily) any value
wondering what exactly is the plan for anyone who might burn to an invalid chain
shouldn't happen much since we won't let that happen through the UI, but anyone could do it
we don't want to hardcode the possible dests, we'd have to update every ERC20 every new chain, and that's not gonna happen
we can return to sender, but that opens an avenue for grief attacks on the bridge wallet
hypothetically, i would hope this wouldn't happen, a very large wallet could intentionally spam invalid burns
say they spend $1M to burn whatever the bridge has for gas money, maybe $50k in it
so we probably want to just do nothing on invalid dests, then handle on a case by case basis
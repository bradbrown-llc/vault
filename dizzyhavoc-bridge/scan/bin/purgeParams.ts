import { purgeParam } from '../lib/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/mod.ts'

const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")
const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

const rlb = new RLB()
rlb.delay = 100

const hashes = [
    '0x0ee4c572b20f859a4e1aeed4ca4a5f7f0679081e4403b99440b9310ac274b41d',
    '0xd90d06d03b0b04965ff7f4fa0c97e89ac161c28edc49929677166c3be60f8f0e',
    '0x259eb2a7cf845e371242fcfacaabbe02789d741e9f0609e5788e8272a59a789a',
    '0x95dcf630c48868d40ffd571fffc0aa1e3d9bb39307a65f35f63c83937cde36b5',
    '0xd979b9d27a523c43412caf34d5c3fd5552980bb8a10a6850c8ffbd4a83a2ea8a',
    '0x8da859cc849c0472d4086edc6e553d0596acc525e53231f8fc6b225356124f97'
]

for (const hash of hashes) await purgeParam({ hash, kv, rlb })
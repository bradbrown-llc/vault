const machineId = Deno.env.get('BRIDGE_MACHINE_ID') as string
if (!machineId) throw new Error('internal: missing env var "BRIDGE_MACHINE_ID"')
export { machineId }
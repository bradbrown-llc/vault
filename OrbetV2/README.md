> ⛔️ **DEPRECATED** -
These are very old and outdated files. Although, we may want to revisit this.

# OrbetV2

OrbetV2 is a WIP flexible EVM prediction market. 
The Prediction Market consists of Predictions. 

## Prediction

A Prediction consists of a bytes object that follows a specific format describing the Prediction. 

FORMAT YET TO BE DETERMINED

## Criteria

A Criteria consists of a bytes object that follows a specific format describing the Criteria. Criteria return either true or false.

Format:

| Byte #, 1-indexed (Byte Count) | 1        | 2-21 (20) | 22-53 (32)     | 54-X     | X+1-End     |
| ------------------------------ | -------- | --------- | -------------- | -------- | ----------- |
| Represented Value              | OPERATOR | TO        | CALLDATALENGTH | CALLDATA | COMPAREDATA |

Example Criteria: 

```
0x020060309750652c9ACcC53e765e1d96e2455E618dAaB79bA5950000000000000000000000000000000000000000000000000000000000000004f1dfa55300000000000000000000000000000000000000000000d3c21bcecceda1000000
```
Breakdown:

| Field Name     | Hex Value                                                        |
| -------------- | ---------------------------------------------------------------- |
| OPERATOR       | 02                                                               |
| TO             | 652c9ACcC53e765e1d96e2455E618dAaB79bA595                         |
| CALLDATALENGTH | 0000000000000000000000000000000000000000000000000000000000000004 |
| CALLDATA       | f1dfa553                                                         |
| COMPAREDATA    | 00000000000000000000000000000000000000000000d3c21bcecceda1000000 |

### OPERATOR

The OPERATOR describes how the CALLDATA will be compared to the COMPAREDATA. The OPERATOR is a value from 0 through 5, representing the following operators:

| Value | Operator |
| ----- | -------- |
| 0     | <=       |
| 1     | <        |
| 2     | ==       |
| 3     | !=       |
| 4     | >=       |
| 5     | >        |

### TO

TO is the address that the CALLDATA will be sent to.

### CALLDATALENGTH

Describes the length of the CALLDATA in bytes.

### CALLDATA

The call data to be sent to the TO address. Call data format is described in the official Solidity docs: https://docs.soliditylang.org/en/v0.8.1/abi-spec.html#abi

### COMPAREDATA

The call data retrieved is compared to the COMPAREDATA using the OPERATOR. For example, if the OPERATOR is 0, the Criteria will return true if the retrieved call data is less than or equal to the COMPAREDATA.

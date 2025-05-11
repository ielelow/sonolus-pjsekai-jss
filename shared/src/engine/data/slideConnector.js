export const slideConnectorReplayKeys = Array.range(12).map((i) => [i, `start${i}`, `end${i}`]);
export const slideConnectorReplayImport = Object.fromEntries(Array.range(12)
    .flatMap((i) => [`start${i}`, `end${i}`])
    .map((k) => [k, { name: k, type: Number }]));

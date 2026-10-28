import data from './json-module.json' with { type: 'json' };
export const result = { ...data, doubled: data.amount * 2 };

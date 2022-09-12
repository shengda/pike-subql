//Exports all handler functions
import "@polkadot/api-augment";
export * from './mappings/mappingHandlers'

if (global.atob === undefined) {
  global.atob = atob;
}

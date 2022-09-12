//Exports all handler functions
import "@polkadot/api-augment";
export * from './mappings/mappingHandlers'
import {atob} from 'atob';

if (global.atob === undefined) {
  global.atob = atob;
}

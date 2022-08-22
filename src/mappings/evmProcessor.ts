import { BaseProvider } from '@acala-network/eth-providers';
import { ApiPromise } from '@polkadot/api';
export class EvmProcessor extends BaseProvider {
    constructor(api: ApiPromise) {
      super();
      this.setApi(api as any); // did any type just because of different version of @polkadot/api
      this.startSubscription() as unknown as void;
    }
  
  }
  
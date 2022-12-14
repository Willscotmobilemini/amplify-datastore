import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import IndexedDBAdapter from '../IndexedDBAdapter';
import AsyncStorageAdapter from '../AsyncStorageAdapter';
var getDefaultAdapter = function () {
    var isBrowser = browserOrNode().isBrowser;
    if ((isBrowser && window.indexedDB) || (isWebWorker() && self.indexedDB)) {
        return IndexedDBAdapter;
    }
    return AsyncStorageAdapter;
};
export default getDefaultAdapter;
//# sourceMappingURL=index.js.map
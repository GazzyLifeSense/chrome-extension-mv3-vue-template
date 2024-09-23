export function getLocal(key: string) {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => resolve(value?.[key]));
  });
}

export function removeLocal(keys: string[]) {
  return new Promise(resolve => chrome.storage.local.remove(keys, () => resolve(undefined)));
}

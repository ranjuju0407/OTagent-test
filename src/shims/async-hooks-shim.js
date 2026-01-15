class AsyncLocalStorage {
  getStore() {
    return undefined;
  }

  enterWith() {}

  run(store, callback, ...args) {
    return callback(...args);
  }

  exit(callback, ...args) {
    return callback(...args);
  }

  disable() {}
}

export { AsyncLocalStorage };
export default { AsyncLocalStorage };
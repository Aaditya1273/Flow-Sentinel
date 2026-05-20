"use client";

if (typeof window !== 'undefined') {
  const createMockStorage = () => {
    const storage: Record<string, string> = {};
    return {
      getItem: (key: string) => {
        return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
      },
      setItem: (key: string, value: string) => {
        storage[key] = String(value);
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        for (const key in storage) {
          if (Object.prototype.hasOwnProperty.call(storage, key)) {
            delete storage[key];
          }
        }
      },
      key: (index: number) => {
        return Object.keys(storage)[index] || null;
      },
      get length() {
        return Object.keys(storage).length;
      }
    };
  };

  // 1. Verify localStorage accessibility
  try {
    const testKey = '__sentinel_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    console.warn('[Sentinel] localStorage is blocked or inaccessible. Activating safe in-memory polyfill.');
    try {
      Object.defineProperty(window, 'localStorage', {
        value: createMockStorage(),
        writable: true,
        configurable: true
      });
    } catch (err) {
      try {
        (window as any).localStorage = createMockStorage();
      } catch (directAssignErr) {
        console.error('[Sentinel] Failed to polyfill localStorage:', directAssignErr);
      }
    }
  }

  // 2. Verify sessionStorage accessibility
  try {
    const testKey = '__sentinel_storage_test__';
    window.sessionStorage.setItem(testKey, '1');
    window.sessionStorage.removeItem(testKey);
  } catch (e) {
    console.warn('[Sentinel] sessionStorage is blocked or inaccessible. Activating safe in-memory polyfill.');
    try {
      Object.defineProperty(window, 'sessionStorage', {
        value: createMockStorage(),
        writable: true,
        configurable: true
      });
    } catch (err) {
      try {
        (window as any).sessionStorage = createMockStorage();
      } catch (directAssignErr) {
        console.error('[Sentinel] Failed to polyfill sessionStorage:', directAssignErr);
      }
    }
  }
}

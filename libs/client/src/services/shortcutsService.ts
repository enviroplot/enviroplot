import {filter, isEmpty, includes} from 'lodash';

export default {
  getHotKeys,
  triggerShortcut,
  subscribeToShortcut,
  unsubscribeFromShortcuts,
};

let handlers: any[] = [];

async function getHotKeys(pageId) {
  if (!pageId) return {};

  const shortcutsData = await import('../data/shortcutsData.json');

  const data = {};

  for (const key of Object.keys(shortcutsData.data)) {
    const shortcut = shortcutsData.data[key];

    const pages = shortcut.pages;

    if (pages && !includes(pages, pageId)) continue;

    for (const row of shortcut.data) {
      data[row.key] = row.hotKeys;
    }
  }

  return data;
}

function triggerShortcut(shortcut, e, combo) {
  let tagName = null;
  let inputType: any = null;

  // stop for input, select, and textarea
  if (e && e.target && e.target.tagName) {
    tagName = e.target.tagName;
    inputType = e.target.type;
  }

  const excludedInputTypes = ['text', 'number', 'email', 'password'];

  if ((tagName === 'INPUT' && excludedInputTypes.includes(inputType)) || tagName === 'TEXTAREA') {
    return;
  }

  if (!isEmpty(handlers)) {
    for (const handlerData of handlers) {
      if (handlerData.shortcut === shortcut) {
        handlerData.handler(e, combo);
        break;
      }
    }
  }
}

function subscribeToShortcut(shortcut, handler, unsubscribe = true) {
  if (unsubscribe) {
    unsubscribeFromShortcuts([shortcut]);
  }
  handlers.push({handler, shortcut});
}

function unsubscribeFromShortcuts(shortcuts) {
  if (!shortcuts) {
    handlers = [];
  } else {
    handlers = filter(handlers, (h) => {
      return !includes(shortcuts, h.shortcut);
    });
  }
}

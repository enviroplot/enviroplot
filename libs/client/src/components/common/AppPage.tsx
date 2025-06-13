import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {HotKeys} from 'react-hotkeys';

import shortcutsService from 'services/shortcutsService';

import Navigation from '../Navigation';

AppPage.propTypes = {
  children: PropTypes.object.isRequired,
  pageId: PropTypes.string,
};

function AppPage(props) {
  let pageContainer: any = null;

  const [hotkeys, setHotKeys] = useState({});
  const [handlers, setHandlers] = useState({});

  useEffect(() => {
    initShortcuts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initShortcuts = () => {
    const hotKeys = shortcutsService.getHotKeys(props.pageId);

    const hotKeysHandlers = {};

    for (const key of Object.keys(hotKeys)) {
      hotKeysHandlers[key] = (e, combo) => shortcutsService.triggerShortcut(key, e, combo);
    }

    setHotKeys(hotKeys);
    setHandlers(hotKeysHandlers);

    if (pageContainer) pageContainer.focus();
  };

  if (!handlers) return null;

  return (
    <HotKeys keyMap={hotkeys} handlers={handlers} focused>
      <div id="main-content" tabIndex={0} ref={(c) => (pageContainer = c)}>
        <Navigation />
        <div style={{flex: 1}}>{props.children}</div>
      </div>
    </HotKeys>
  );
}

export default AppPage;

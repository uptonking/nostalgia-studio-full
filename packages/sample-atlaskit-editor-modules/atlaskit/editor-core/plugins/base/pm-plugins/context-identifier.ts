import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import type {
  ContextIdentifierProvider,
  ProviderFactory,
} from '../../../../editor-common';
import type { Dispatch } from '../../../event-dispatcher';

export const stateKey = new PluginKey('contextIdentiferPlugin');

export interface PluginState {
  contextIdentifierProvider?: ContextIdentifierProvider;
}

export const getContextIdentifier = (state?: EditorState) => {
  if (state) {
    return (stateKey.getState(state) as PluginState)?.contextIdentifierProvider;
  }
};

/** pm-plugin.state.apply只是返回tr.getMeta(stateKey) */
export default (dispatch: Dispatch, providerFactory?: ProviderFactory) =>
  new Plugin({
    key: stateKey,
    state: {
      init: () => ({}),
      apply: (tr, pluginState) => {
        if (tr.getMeta(stateKey)) {
          return tr.getMeta(stateKey);
        }

        return pluginState;
      },
    },
    view: (view: EditorView) => {
      const providerPromiseHandler = (
        name: string,
        providerPromise?: Promise<ContextIdentifierProvider>,
      ) => {
        if (providerPromise && name === 'contextIdentifierProvider') {
          providerPromise.then((provider: ContextIdentifierProvider) => {
            const tr = view.state.tr.setMeta(stateKey, {
              contextIdentifierProvider: { ...provider },
            } as PluginState);

            view.dispatch(tr);
          });
        }
      };

      if (providerFactory) {
        providerFactory.subscribe(
          'contextIdentifierProvider',
          providerPromiseHandler,
        );
      }

      return {
        destroy: () => {
          providerFactory &&
            providerFactory.unsubscribe(
              'contextIdentifierProvider',
              providerPromiseHandler,
            );
        },
      };
    },
  });

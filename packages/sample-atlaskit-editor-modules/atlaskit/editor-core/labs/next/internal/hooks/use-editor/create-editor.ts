import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';
import { ProviderFactory } from '../../../../../../editor-common/provider-factory';
import EditorActions from '../../../../../actions';
import {
  createPMPlugins,
  processPluginsList,
} from '../../../../../create-editor/create-editor';
import { createSchema } from '../../../../../create-editor/create-schema';
import {
  EventDispatcher,
  createDispatch,
} from '../../../../../event-dispatcher';
import { FeatureFlags } from '../../../../../types/feature-flags';
import { PortalProviderAPI } from '../../../../../ui/PortalProvider';
import { processRawValue } from '../../../../../utils';
import { EditorSharedConfig } from '../../context/shared-config';
import { EditorPropsExtended } from '../../editor-props-type';

export function createEditor({
  context,
  onAnalyticsEvent,
  transformer,

  providerFactory,

  plugins,
  portalProviderAPI,
  defaultValue,
  ref,

  popupsMountPoint,
  popupsBoundariesElement,
  popupsScrollableElement,

  editorActions,

  disabled,
  onChange,
  onDestroy,
  onMount,
  featureFlags,
}: CreateEditorParams): EditorSharedConfig | null {
  if (!ref) {
    return null;
  }

  const eventDispatcher = new EventDispatcher();
  const dispatch = createDispatch(eventDispatcher);
  const editorConfig = processPluginsList(plugins || []);
  const schema = createSchema(editorConfig);
  const transformerInstance = transformer && transformer(schema);
  const pmPlugins = createPMPlugins({
    editorConfig,

    schema,

    dispatch,
    eventDispatcher,

    portalProviderAPI: portalProviderAPI,
    providerFactory,

    // Required to workaround issues with multiple react trees.
    // Though it's kinda leaking react to outside world.
    reactContext: () => context,

    // TODO: ED-8133 Need to make types more generic otherwise it's not extensible.
    dispatchAnalyticsEvent: onAnalyticsEvent as any,
    performanceTracking: {},
    featureFlags,
  });
  const state = EditorState.create({
    schema,
    plugins: pmPlugins,
    doc: transformerInstance
      ? transformerInstance.parse(defaultValue)
      : processRawValue(schema, defaultValue),
  });
  const editorView = new EditorView(
    { mount: ref },
    {
      state,
      attributes: { 'data-gramm': 'false' },

      // Ignore all transactions by default
      dispatchTransaction: () => {},

      // Disables the contentEditable attribute of the editor if the editor is disabled
      editable: (_state) => !!disabled,
    },
  );

  return {
    editorView,

    transformer: transformerInstance,
    dispatchAnalyticsEvent: onAnalyticsEvent,

    eventDispatcher,
    dispatch,

    primaryToolbarComponents: editorConfig.primaryToolbarComponents,
    contentComponents: editorConfig.contentComponents,

    popupsMountPoint,
    popupsBoundariesElement,
    popupsScrollableElement,

    providerFactory,
    editorActions,

    onChange,
    onDestroy,
    onMount,
  };
}

export type CreateEditorParams = Pick<
  EditorPropsExtended,
  | 'defaultValue'
  | 'plugins'
  | 'popupsMountPoint'
  | 'popupsBoundariesElement'
  | 'popupsScrollableElement'
  | 'onChange'
  | 'disabled'
  | 'transformer'
  | 'onAnalyticsEvent'
  | 'onDestroy'
  | 'onMount'
> & {
  context: any;
  ref?: HTMLDivElement | null;
  providerFactory: ProviderFactory;
  portalProviderAPI: PortalProviderAPI;
  createAnalyticsEvent?: any;
  editorActions: EditorActions;
  featureFlags: FeatureFlags;
};

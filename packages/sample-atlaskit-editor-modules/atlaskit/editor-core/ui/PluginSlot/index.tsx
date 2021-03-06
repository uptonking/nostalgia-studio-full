import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import styled from 'styled-components';

import { ProviderFactory } from '../../../editor-common';
import EditorActions from '../../actions';
import { EventDispatcher } from '../../event-dispatcher';
import {
  ACTION_SUBJECT,
  DispatchAnalyticsEvent,
} from '../../plugins/analytics';
import type { EditorAppearance, UIComponentFactory } from '../../types';
import { whichTransitionEvent } from '../../utils';
import { ErrorBoundary } from '../ErrorBoundary';

/** simply add: `display: flex;` */
const PluginsComponentsWrapper = styled.div`
  display: flex;
`;

export interface Props {
  items?: Array<UIComponentFactory>;
  editorView?: EditorView;
  editorActions?: EditorActions;
  eventDispatcher?: EventDispatcher;
  providerFactory: ProviderFactory;
  appearance?: EditorAppearance;
  popupsMountPoint?: HTMLElement;
  popupsBoundariesElement?: HTMLElement;
  popupsScrollableElement?: HTMLElement;
  containerElement: HTMLElement | null;
  disabled: boolean;
  dispatchAnalyticsEvent?: DispatchAnalyticsEvent;
  contentArea?: HTMLElement;
}

/** 与ReactEditorView平级的react组件，用来显示会出现在内容区的特殊组件，如mention、link-floating-bar */
export default class PluginSlot extends React.Component<Props, any> {
  static displayName = 'PluginSlot';

  transitionEvent = whichTransitionEvent<'transitionend'>();

  shouldComponentUpdate(nextProps: Props) {
    const {
      editorView,
      editorActions,
      items,
      providerFactory,
      eventDispatcher,
      popupsMountPoint,
      popupsBoundariesElement,
      popupsScrollableElement,
      containerElement,
      disabled,
    } = this.props;

    return !(
      nextProps.editorView === editorView &&
      nextProps.editorActions === editorActions &&
      nextProps.items === items &&
      nextProps.providerFactory === providerFactory &&
      nextProps.eventDispatcher === eventDispatcher &&
      nextProps.popupsMountPoint === popupsMountPoint &&
      nextProps.popupsBoundariesElement === popupsBoundariesElement &&
      nextProps.popupsScrollableElement === popupsScrollableElement &&
      nextProps.containerElement === containerElement &&
      nextProps.disabled === disabled
    );
  }

  componentDidMount() {
    this.addModeChangeListener(this.props.contentArea);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.contentArea !== nextProps.contentArea) {
      this.removeModeChangeListener(this.props.contentArea);
      this.addModeChangeListener(nextProps.contentArea);
    }
  }

  componentWillUnmount() {
    this.removeModeChangeListener(this.props.contentArea);
  }

  forceComponentUpdate = (event: TransitionEvent): void => {
    // Only trigger an update if the transition is on a property containing `width`
    // This will cater for media and the content area itself currently.
    if (event.propertyName.includes('width')) {
      this.forceUpdate();
    }
  };

  removeModeChangeListener = (contentArea?: HTMLElement) => {
    if (contentArea && this.transitionEvent) {
      contentArea.removeEventListener(
        this.transitionEvent,
        this.forceComponentUpdate,
      );
    }
  };

  addModeChangeListener = (contentArea?: HTMLElement) => {
    if (contentArea && this.transitionEvent) {
      /**
       * Update the plugin components once the transition
       * to full width / default mode completes
       */
      contentArea.addEventListener(
        this.transitionEvent,
        this.forceComponentUpdate,
      );
    }
  };

  render() {
    const {
      items,
      editorView,
      editorActions,
      eventDispatcher,
      providerFactory,
      appearance,
      popupsMountPoint,
      popupsBoundariesElement,
      popupsScrollableElement,
      containerElement,
      disabled,
      dispatchAnalyticsEvent,
    } = this.props;

    if (!items || !editorView) {
      return null;
    }

    return (
      <ErrorBoundary
        component={ACTION_SUBJECT.PLUGIN_SLOT}
        fallbackComponent={null}
      >
        <PluginsComponentsWrapper>
          {items.map((component, key) => {
            const props: any = { key };
            const element = component({
              editorView: editorView as EditorView,
              editorActions: editorActions as EditorActions,
              eventDispatcher: eventDispatcher as EventDispatcher,
              providerFactory,
              dispatchAnalyticsEvent,
              appearance: appearance!,
              popupsMountPoint,
              popupsBoundariesElement,
              popupsScrollableElement,
              containerElement,
              disabled,
            });
            return element && React.cloneElement(element, props);
          })}
        </PluginsComponentsWrapper>
      </ErrorBoundary>
    );
  }
}

import * as React from 'react';
import styled from 'styled-components';

import { akEditorMobileMaxWidth } from '../../../editor-shared-styles';
import type EditorActions from '../../actions';
import type { ToolbarInnerProps } from './toolbar-types';

/** 普通的styled.div，布局flex */
const ToolbarComponentsWrapper = styled.div`
  display: flex;

  @media (max-width: ${akEditorMobileMaxWidth}px) {
    justify-content: space-between;
  }
`;

/** 编辑区上方工具条上的所有项目，项目一般都是被WithPluginState包裹的组件 */
export class ToolbarInner extends React.Component<ToolbarInnerProps> {
  shouldComponentUpdate(nextProps: ToolbarInnerProps) {
    return (
      nextProps.toolbarSize !== this.props.toolbarSize ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.popupsMountPoint === this.props.popupsMountPoint ||
      nextProps.popupsBoundariesElement ===
        this.props.popupsBoundariesElement ||
      nextProps.popupsScrollableElement ===
        this.props.popupsScrollableElement ||
      nextProps.isReducedSpacing !== this.props.isToolbarReducedSpacing
    );
  }

  render() {
    const {
      appearance,
      editorView,
      editorActions,
      eventDispatcher,
      providerFactory,
      items,
      popupsMountPoint,
      popupsBoundariesElement,
      popupsScrollableElement,
      toolbarSize,
      disabled,
      isToolbarReducedSpacing,
      dispatchAnalyticsEvent,
      containerElement,
    } = this.props;

    if (!items || !items.length) {
      return null;
    }

    return (
      <ToolbarComponentsWrapper>
        {items.map((component, key) => {
          const props: any = { key };
          const element = component({
            editorView,
            editorActions: editorActions as EditorActions,
            eventDispatcher,
            providerFactory,
            appearance: appearance!,
            popupsMountPoint,
            popupsBoundariesElement,
            popupsScrollableElement,
            disabled,
            toolbarSize,
            isToolbarReducedSpacing,
            containerElement,
            isLastItem: key === items.length - 1,
            dispatchAnalyticsEvent,
          });
          return element && React.cloneElement(element, props);
        })}
      </ToolbarComponentsWrapper>
    );
  }
}

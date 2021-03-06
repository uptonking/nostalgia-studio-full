import { css } from 'styled-components';

import { ruleSharedStyles } from '../../../editor-common';
import {
  akEditorLineHeight,
  akEditorSelectedBorderColor,
  akEditorSelectedNodeClassName,
} from '../../../editor-shared-styles';

export const ruleStyles = css`
  .ProseMirror {
    ${ruleSharedStyles};

    hr {
      cursor: pointer;
      padding: 4px 0;
      margin: calc(${akEditorLineHeight}em - 4px) 0;
      background-clip: content-box;

      &.${akEditorSelectedNodeClassName} {
        outline: none;
        background-color: ${akEditorSelectedBorderColor};
      }
    }
  }
`;

import React from 'react';

import EditorAlignCenterIcon from '@atlaskit/icon/glyph/editor/align-center';
import EditorAlignLeftIcon from '@atlaskit/icon/glyph/editor/align-left';
import EditorAlignRightIcon from '@atlaskit/icon/glyph/editor/align-right';

export const iconMap = {
  start: <EditorAlignLeftIcon label='Align left' />,
  end: <EditorAlignRightIcon label='Align right' />,
  center: <EditorAlignCenterIcon label='Align center' />,
};

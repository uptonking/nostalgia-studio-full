import React, { useState } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: '👏 Hello, Slate editor!   A line of text in a paragraph.' },
    ],
  },
];

export const SlateMinimalApp = () => {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate editor={editor} value={initialValue as any}>
      <Editable />
    </Slate>
  );
};

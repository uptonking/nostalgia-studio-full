import {
  liftListItem,
  sinkListItem,
  splitListItem,
} from 'prosemirror-schema-list';

import Node from './Node';

export default class CheckboxItem extends Node {
  get name() {
    return 'checkbox_item';
  }

  get schema() {
    return {
      content: 'paragraph block*',
      attrs: {
        checked: {
          default: false,
        },
      },
      defining: true,
      draggable: true,
      parseDOM: [
        {
          tag: `li[data-type="${this.name}"]`,
          getAttrs: (dom: HTMLLIElement) => ({
            checked: dom.className.includes('checked'),
          }),
        },
      ],
      toDOM: (node) => {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.tabIndex = -1;
        input.addEventListener('change', this.handleChange);

        if (node.attrs.checked) {
          input.checked = true;
        }

        return [
          'li',
          {
            'data-type': this.name,
            class: node.attrs.checked ? 'checked' : undefined,
          },
          [
            'span',
            {
              contentEditable: false,
            },
            input,
          ],
          ['div', 0],
        ];
      },
    };
  }

  handleChange = (event) => {
    const { view } = this.editor;
    const { tr } = view.state;
    const { top, left } = event.target.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    if (result) {
      const transaction = tr.setNodeMarkup(result.inside, undefined, {
        checked: event.target.checked,
      });
      view.dispatch(transaction);
    }
  };

  keys({ type }) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      'Shift-Tab': liftListItem(type),
      'Mod-]': sinkListItem(type),
      'Mod-[': liftListItem(type),
    };
  }

  toMarkdown(state, node) {
    state.write(node.attrs.checked ? '[x] ' : '[ ] ');
    state.renderContent(node);
  }

  parseMarkdown() {
    return {
      block: 'checkbox_item',
      getAttrs: (tok) => ({
        checked: tok.attrGet('checked') ? true : undefined,
      }),
    };
  }
}

import { Node } from "@tiptap/core";

export const HorizontalRule = Node.create({
  name: "horizontalRule",

  group: "block",
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "hr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["hr", HTMLAttributes];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt--": () =>
        this.editor.commands.insertContent({
          type: this.name,
        }),
    };
  },
});

export default HorizontalRule;

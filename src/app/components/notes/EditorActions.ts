//src/app/components/notes/EditorActions.ts
export const setLink = (editor: any) => {
  const previous = editor.getAttributes("link").href || "";
  const url = window.prompt("Enter URL:", previous); // Ask user

  if (url === null) return; // Cancel pressed
  if (url === "") {
    editor.chain().focus().unsetLink().run(); // Remove link
    return;
  }

  editor.chain().focus().setLink({ href: url }).run();
};

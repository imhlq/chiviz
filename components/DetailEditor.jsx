import React, { useRef } from "react";
import { Editor } from "@monaco-editor/react";

function CodeEditor({ code }) {
    const editorRef = useRef(null);
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    return (
        <Editor 
          defaultLanguage="python" 
          defaultValue={code}
          height="90vh"
          onMount={handleEditorDidMount}
        />
    )
}

export default CodeEditor;
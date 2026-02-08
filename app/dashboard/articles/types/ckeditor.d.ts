declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: unknown;
  export = ClassicEditor;
}

declare module '@ckeditor/ckeditor5-react' {
  import { Component } from 'react';
  
  export interface CKEditorProps {
    editor: unknown;
    data?: string;
    config?: unknown;
      onChange?: (event: unknown, editor: unknown) => void;
      onReady?: (editor: unknown) => void;
      onBlur?: (event: unknown, editor: unknown) => void;
      onFocus?: (event: unknown, editor: unknown) => void;
    onError?: (error: Error, details: { phase: string; willEditorRestart?: boolean }) => void;
  }
  
  export class CKEditor extends Component<CKEditorProps> {}
}

import React, {createContext, useContext} from 'react';
import {Node} from 'reactflow';

interface CloudBoxEditorContextValue {
  openEditor: (node: Node) => void;
}

const CloudBoxEditorContext = createContext<
  CloudBoxEditorContextValue | undefined
>(undefined);

export function CloudBoxEditorProvider({
  children,
  onOpenEditor,
}: {
  children: React.ReactNode;
  onOpenEditor: (node: Node) => void;
}) {
  return (
    <CloudBoxEditorContext.Provider value={{openEditor: onOpenEditor}}>
      {children}
    </CloudBoxEditorContext.Provider>
  );
}

export function useCloudBoxEditor() {
  const context = useContext(CloudBoxEditorContext);
  if (!context) {
    throw new Error(
      'useCloudBoxEditor must be used within CloudBoxEditorProvider',
    );
  }
  return context;
}

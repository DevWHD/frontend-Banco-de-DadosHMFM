import DocumentExplorer from "@/components/document-explorer";
import { Toaster } from "sonner";

export default function Page() {
  return (
    <>
      <DocumentExplorer />
      <Toaster position="bottom-right" richColors />
    </>
  );
}

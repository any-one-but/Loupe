import { FOLDER_INPUT_ID, loadFromFileList } from "@/lib/library/open";

export function FolderInput() {
  return (
    <input
      id={FOLDER_INPUT_ID}
      type="file"
      multiple
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(event) => {
        loadFromFileList(event.target.files);
        event.target.value = "";
      }}
      {...{ webkitdirectory: "", directory: "" }}
    />
  );
}

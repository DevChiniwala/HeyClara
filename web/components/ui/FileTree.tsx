"use client";

interface FileTreeItem {
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}

const files: FileTreeItem[] = [
  {
    name: "personas",
    type: "folder",
    children: [
      { name: "default.yml", type: "file" },
      { name: "creative.yml", type: "file" },
      { name: "precise.yml", type: "file" },
      { name: "support.yml", type: "file" },
      { name: "technical.yml", type: "file" },
    ],
  },
];

export default function FileTree({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="py-1 px-2">
      {files.map((folder) => (
        <div key={folder.name}>
          <div className="flex items-center gap-2 py-1.5 px-2 text-label-caps font-label-caps text-on-surface-variant uppercase">
            <span className="material-symbols-outlined text-sm">folder_open</span>
            {folder.name}
          </div>
          {folder.children?.map((file) => (
            <button
              key={file.name}
              onClick={() => onSelect(file.name)}
              className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm transition-colors text-left ${
                selected === file.name
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-primary">description</span>
              {file.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

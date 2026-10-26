import {
  RiFileExcel2Line,
  RiFileLine,
  RiFilePdf2Line,
  RiFilePpt2Line,
  RiFileTextLine,
  RiFileWord2Line,
  RiImageLine,
  RiMailLine,
} from "@remixicon/react";

const ICONS: [RegExp, typeof RiFileLine][] = [
  [/pdf/, RiFilePdf2Line],
  [/docx?|dotx?|rtf|odt|word/, RiFileWord2Line],
  [/xlsx?|ods|csv|sheet|excel/, RiFileExcel2Line],
  [/pptx?|odp|presentation|powerpoint/, RiFilePpt2Line],
  [/png|jpe?g|gif|bmp|tiff?|heic|webp|image/, RiImageLine],
  [/msg|eml/, RiMailLine],
  [/txt|md|text/, RiFileTextLine],
];

/** fileType may be an extension or a MIME type, so match on both plus the file name. */
export function DocumentFileIcon({
  fileName,
  fileType,
  className,
}: {
  fileName: string;
  fileType?: string | null;
  className?: string;
}) {
  const hint = `${fileType ?? ""} ${fileName.split(".").pop() ?? ""}`.toLowerCase();
  const Icon = ICONS.find(([pattern]) => pattern.test(hint))?.[1] ?? RiFileLine;
  return <Icon className={className} />;
}

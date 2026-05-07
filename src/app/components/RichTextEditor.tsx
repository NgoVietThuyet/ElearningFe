import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Strikethrough,
  Undo,
  Redo,
  Unlink,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Nhập nội dung..." }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-orange-600 underline hover:text-orange-700 cursor-pointer",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] max-h-[400px] overflow-y-auto outline-none px-4 py-3 prose prose-sm max-w-none prose-orange focus:outline-none",
      },
    },
  });

  // Sync content if value prop changes externally (e.g., editing an existing item)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const insertLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    if (editor.state.selection.empty && linkText) {
      editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
    } else {
      editor.chain().focus().extendMarkToLink().setLink({ href: url }).run();
    }
    setLinkUrl("");
    setLinkText("");
    setShowLinkDialog(false);
  }, [editor, linkUrl, linkText]);

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageDialog(false);
  }, [editor, imageUrl]);

  if (!editor) return null;

  const ToolbarBtn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-orange-100 text-orange-700"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {/* Headings */}
        <ToolbarBtn title="Tiêu đề lớn (H1)" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Tiêu đề nhỏ (H2)" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Text styles */}
        <ToolbarBtn title="In đậm (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="In nghiêng (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Gạch ngang" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Danh sách không thứ tự" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Danh sách có thứ tự" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn title="Chèn link" active={editor.isActive("link")} onClick={() => { setShowLinkDialog(true); setLinkUrl(editor.getAttributes("link").href || ""); }}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn title="Xóa link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="w-4 h-4" />
          </ToolbarBtn>
        )}

        {/* Image */}
        <ToolbarBtn title="Chèn ảnh qua URL" onClick={() => setShowImageDialog(true)}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarBtn title="Hoàn tác (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Làm lại (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">Chèn liên kết</h3>
            <div className="space-y-3">
              <input
                autoFocus
                type="url"
                placeholder="https://drive.google.com/... hoặc bất kỳ URL nào"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                onKeyDown={(e) => { if (e.key === "Enter") insertLink(); if (e.key === "Escape") setShowLinkDialog(false); }}
              />
              {editor.state.selection.empty && (
                <input
                  type="text"
                  placeholder="Tên hiển thị (nếu không chọn text)"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowLinkDialog(false)} className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
              <button type="button" onClick={insertLink} className="flex-1 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700">Chèn link</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">Chèn ảnh từ URL</h3>
            <input
              autoFocus
              type="url"
              placeholder="https://i.imgur.com/... hoặc link Google Drive CDN"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              onKeyDown={(e) => { if (e.key === "Enter") insertImage(); if (e.key === "Escape") setShowImageDialog(false); }}
            />
            {imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 max-h-32">
                <img src={imageUrl} alt="Preview" className="w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowImageDialog(false)} className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
              <button type="button" onClick={insertImage} className="flex-1 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700">Chèn ảnh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

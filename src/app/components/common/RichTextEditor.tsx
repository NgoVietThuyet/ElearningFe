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
  X,
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
          "min-h-[200px] max-h-[400px] overflow-y-auto outline-none px-6 py-4 prose prose-sm max-w-none dark:prose-invert prose-orange focus:outline-none dark:text-gray-300",
      },
    },
  });

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
      className={`p-2 rounded-lg transition-all ${
        active
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5 self-center" />;

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all bg-white dark:bg-gray-900/50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        <ToolbarBtn title="Tiêu đề lớn (H1)" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Tiêu đề nhỏ (H2)" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

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

        <ToolbarBtn title="Danh sách không thứ tự" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Danh sách có thứ tự" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Chèn link" active={editor.isActive("link")} onClick={() => { setShowLinkDialog(true); setLinkUrl(editor.getAttributes("link").href || ""); }}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn title="Xóa link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="w-4 h-4" />
          </ToolbarBtn>
        )}

        <ToolbarBtn title="Chèn ảnh qua URL" onClick={() => setShowImageDialog(true)}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700 relative">
            <button onClick={() => setShowLinkDialog(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Liên kết web</h3>
            <div className="space-y-4">
              <input
                autoFocus
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 dark:text-white transition-all"
                onKeyDown={(e) => { if (e.key === "Enter") insertLink(); if (e.key === "Escape") setShowLinkDialog(false); }}
              />
              {editor.state.selection.empty && (
                <input
                  type="text"
                  placeholder="Tên hiển thị..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 dark:text-white transition-all"
                />
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowLinkDialog(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 transition-all">Hủy</button>
              <button type="button" onClick={insertLink} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 dark:shadow-none">Chèn link</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-700 relative">
            <button onClick={() => setShowImageDialog(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Chèn ảnh từ URL</h3>
            <input
              autoFocus
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 dark:text-white transition-all"
              onKeyDown={(e) => { if (e.key === "Enter") insertImage(); if (e.key === "Escape") setShowImageDialog(false); }}
            />
            {imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-40">
                <img src={imageUrl} alt="Preview" className="w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowImageDialog(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 transition-all">Hủy</button>
              <button type="button" onClick={insertImage} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 dark:shadow-none">Chèn ảnh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

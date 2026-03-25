import { useTheme } from "@/context/ThemeContext";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
type Props = {
  onSelect: (emoji: string) => void;
  width?: number;
  height?: number;
};
function MyEmojiPicker({ onSelect, width, height }: Props) {
  const { theme } = useTheme();
  function handleEmojiClick(emojiData: EmojiClickData) {
    onSelect(emojiData.emoji);
  }
  return (
    <EmojiPicker
      onEmojiClick={handleEmojiClick}
      theme={theme === "light" ? Theme.LIGHT : Theme.DARK}
      width={width ?? 350}
      height={height ?? 400}
      previewConfig={{ showPreview: false }}
    />
  );
}

export default MyEmojiPicker;

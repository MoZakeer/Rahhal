import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
type Props = {
  onSelect: (emoji: string) => void;
  width?: number;
  height?: number;
};
function MyEmojiPicker({ onSelect,width, height }: Props) {
  function handleEmojiClick(emojiData: EmojiClickData) {
    onSelect(emojiData.emoji);

  }
  return <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT}  width={width ?? 350}
  height={height ?? 400}  previewConfig={{ showPreview: false }}
/>;
}

export default MyEmojiPicker;

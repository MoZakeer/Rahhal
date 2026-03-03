import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
type Props = {
  onSelect: (emoji: string) => void;
};
function MyEmojiPicker({ onSelect }: Props) {
  function handleEmojiClick(emojiData: EmojiClickData) {
    onSelect(emojiData.emoji);
  }
  return <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} />;
}

export default MyEmojiPicker;

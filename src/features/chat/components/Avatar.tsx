function Avatar({ src }) {
  const source = !src ? "./avater.png" : src;
  return (
    <img
      src={source}
      className="w-12 h-12 aspect-square object-center rounded-full object-cover"
    />
  );
}

export default Avatar;

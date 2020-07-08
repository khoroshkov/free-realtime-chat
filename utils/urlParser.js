function urlParser() {
  const url_string = window.location;
  const url = new URL(url_string);
  const name = url.searchParams.get("username");
  const room = url.searchParams.get("room");
  return name, room
}

export default urlParser;

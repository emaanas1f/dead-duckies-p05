export function renderWrappedText(ctx, text, xStart, yStart, width, lineHeight) {
  let words = text.split(" ");
  let currentLine = "";
  let lines = [];
  words.forEach(word => {
    if (ctx.measureText((currentLine + " " + word).trim()).width > width) {
      lines.push(currentLine);
      currentLine = word;
    }
    else {
      currentLine += " " + word;
    }
  });
  lines.push(currentLine);
  lines[0] = lines[0].trim()

  lines.forEach((line, i) => {
    ctx.fillText(line, xStart, yStart + i * lineHeight)
  });
}

export function getItemTitle(item) {
  let title = "";
  item.split("_").forEach(word => {
    if (word.length > 0) {
      title += word[0].toUpperCase() + word.slice(1) + " ";
    }
  });
  return title.trim()
}
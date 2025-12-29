function extractMessage(args = []) {
  const maybeMessage = args[args.length - 1];
  const isMessageObject =
    maybeMessage && typeof maybeMessage === "object" && "content" in maybeMessage;

  if (isMessageObject) {
    return { message: maybeMessage, cleanedArgs: args.slice(0, -1) };
  }

  return { message: null, cleanedArgs: args };
}

module.exports = extractMessage;

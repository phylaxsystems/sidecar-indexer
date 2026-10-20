export function resolve(specifier, context, nextResolve) {
  const isRelativeJs =
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    specifier.endsWith(".js");
  if (isRelativeJs) {
    return nextResolve(`${specifier.slice(0, -3)}.ts`, context);
  }
  return nextResolve(specifier, context);
}

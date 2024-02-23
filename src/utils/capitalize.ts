export function capitalize(text: string) {
    return text.toLocaleLowerCase().replace(/(^[a-zA-Z]|\s[a-zA-Z])/g, (_, args) => args.toUpperCase())
}
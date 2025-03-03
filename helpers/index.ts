function nonAccentConverter(str: string): string {
  if (!str) {
    return ""
  }

  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"))
}

export { nonAccentConverter }

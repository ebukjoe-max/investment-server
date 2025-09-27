export const generateRefCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

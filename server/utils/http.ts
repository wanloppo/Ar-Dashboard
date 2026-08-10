export function serverError(error: unknown) {
  if (error && typeof error === 'object' && 'statusCode' in error) throw error
  console.error(error)
  throw createError({ statusCode: 500, statusMessage: 'ไม่สามารถเชื่อมต่อหรือประมวลผลฐานข้อมูลได้' })
}

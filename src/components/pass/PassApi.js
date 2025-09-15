export const verifyPassAuth = async (authData) => {
  return apiRequest('/pass/verify', {
    method: 'POST',
    body: JSON.stringify(authData)
  })
}
exports.validateAPIToken = (req, res, next) => {
  if (req.headers.apitoken === process.env.APITOKEN) return next()
  return res.status(401).json({ status: 401, message: 'Invalid API token.' })
}

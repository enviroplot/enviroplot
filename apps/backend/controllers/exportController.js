exports.exportExcel = async (req, res) => {
  try {
    res.status(200).json({ message: 'Excel exported' })
  } catch (err) {
    res.status(500).json({ error: 'Excel export failed' })
  }
}

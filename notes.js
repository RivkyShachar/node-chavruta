userList: async (req, res) => {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.status(201).json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
}

requestsList: async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  // let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await StudyRequestModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse })
    res.status(201).json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }

}
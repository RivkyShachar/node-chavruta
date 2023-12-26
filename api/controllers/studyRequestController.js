exports.studyRequestController = {
    requestsList: async (req, res) => {
        let perPage = Math.min(req.query.perPage, 20) || 10;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;
    
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
    
    },
    myStudyRequests: async (req, res) => {
        let perPage = Math.min(req.query.perPage, 20) || 10;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;
    
        try {
            let data = await StudyRequestModel
                .find({ user_id: req.tokenData._id })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ [sort]: reverse })
            res.status(201).json(data);
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ msg: "err", err })
        }
    
    },
    search: async (req, res) => {
        let perPage = req.query.perPage || 10;
        let page = req.query.page || 1;
    
        try {
            let queryT = req.query.topic;
            let queryL = req.query.language;
            let searchTopicReg = new RegExp(queryT, "i");
            let searchLanguageReg = new RegExp(queryL, "i");
    
            let data = await StudyRequestModel.find({
                $and: [
                    { topics: { $in: [searchTopicReg] } },
                    { preferredLanguages: { $in: [searchLanguageReg] } }
                ]
            })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ _id: -1 });
    
            res.status(201).json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "There was an error. Please try again later.", err });
        }
    },
    singleRequest: async (req, res) => {
        try {
          let idSingle = req.params.idSingle1;
          let data = await StudyRequestModel.findOne({ _id: idSingle });
      
          if (data === null) {
            res.status(404).json({ msg: "No item found" });
          } else {
            res.status(200).json(data);
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ msg: "Internal server error", err: err.message });
        }
      },
      duration: async (req, res) => {
        let perPage = req.query.perPage || 10;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id"
        let reverse = req.query.reverse == "yes" ? -1 : 1;
        try {
            let minP = req.query.min;
            let maxP = req.query.max;
            if (minP && maxP) {
                let data = await StudyRequestModel.find({ $and: [{ "studyDuration.min": { $gte: minP } }, { "studyDuration.max": { $lte: maxP } }] })
    
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            }
            else if (maxP) {
                let data = await StudyRequestModel.find({ "studyDuration.max": { $gte: maxP } })
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            } else if (minP) {
                let data = await StudyRequestModel.find({ "studyDuration.min": { $gte: minP } })
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            } else {
                let data = await StudyRequestModel.find({})
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there is an error try again later", err })
        }
    },
    topic: async (req, res) => {
        let perPage = req.query.perPage || 10;
        let page = req.query.page || 1;
        try {
          let topN = req.params.topName;
          let topReg = new RegExp(topN, "i")
          let data = await StudyRequestModel.find({ topics: { $in: [topReg] } })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
          res.json(data);
        }
        catch (err) {
          console.log(err);
          res.status(500).json({ msg: "there is an error try again later", err })
        }
      },
      addRequest: async (req, res) => {
        let validBody = validateStudyRequest(req.body);
        if (validBody.error) {
            return res.status(400).json(validBody.error.details);
        }
        try {
            let studyRequest = new StudyRequestModel(req.body);
            // add the user_id of the user that add the studyRequest
            studyRequest.user_id = req.tokenData._id;
            await studyRequest.save();
            res.status(201).json(studyRequest);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "err", err })
        }
    },
    editRequest: async (req, res) => {
        let validBody = validateStudyRequest(req.body);
        if (validBody.error) {
            return res.status(400).json(validBody.error.details);
        }
        try {
            let editId = req.params.editId;
            let data;
            if (req.tokenData.role == "admin") {
                data = await StudyRequestModel.updateOne({ _id: editId }, req.body)
            }
            else {
                data = await StudyRequestModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
            }
            res.status(201).json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "err", err })
        }
    },
    deleteRequest: async (req, res) => {
        try {
            let delId = req.params.delId;
            let data;
            if (req.tokenData.role == "admin") {
                data = await StudyRequestModel.deleteOne({ _id: delId })
            }
            else {
                data = await StudyRequestModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
            }
            res.status(201).json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "err", err })
        }
    }

}
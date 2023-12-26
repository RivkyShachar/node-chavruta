const {UserModel} = require("../models/userModel");
const {EducationModel} = require("../models/educationModel");
const { validEduItem } = require("../validations/educationValidation");
const { createToken } = require("../helpers/userHelper")

// צריך לעדכן את הבקשות מאחר והמודל השתנה
exports.EducationController = {
    getItem: async (req, res) => {
        let { userId } = req.params
        try {
            
            let user = await EducationModel.findOne({ _id: userId }).populate({path: 'education',model: 'eduItem'});
            res.json(user.menu)
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there error try again later", err })
        }
    },
    createItem: async (req, res) => {
        let validBody = validEduItem(req.body);
        let {userId } = req.params

        if (validBody.error) return res.status(401).json(validBody.error.details);
        try {
            let itedEducation = new  EducationModel(req.body);
           await itedEducation.save();

            let rest = await EducationModel.updateOne({ _id: userId }, { $push: { 'menu': itedEducation._id } })
            
            res.json(itedEducation)
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there error try again later", err })
        }
    },
   
    removeItem: async (req, res) => {

        let { itemId, userId } = req.params
        try {
            // console.log(userId)

            let rest = await EducationModel.updateOne({ _id: userId }, { $pull: { 'menu': { $in: [itemId] } } })
            let itemDel = await EducationModel.deleteOne({ _id: itemId })

            // console.log(rest)

            res.json({itemDel,rest})
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there error try again later", err })
        }
    }
    
    ,
    editItem: async (req, res) => {
        let validBody = validEduItem(req.body);
        if (validBody.error) {
          return res.status(400).json({ msg: "Need to send body" });
        }
        let { editItemId } = req.params
        try {
            console.log(req.body)
            let itemEdit = await EducationModel.updateOne({ _id: editItemId },req.body)
            res.json(itemEdit)
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there error try again later", err })
        }
    },

}
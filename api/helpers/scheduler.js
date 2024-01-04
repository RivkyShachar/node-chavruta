// studyRequestUtils.js

const { StudyRequestModel } = require('../models/studyRequestModel');

const updateStudyRequestStates = async () => {
  try {
    const currentDate = new Date();

    // Find study requests that are still 'open' or 'close' and where studyEndTime has passed
    const openAndCloseStudyRequests = await StudyRequestModel.find({
      state: { $in: ['open', 'close'] },
      'startDateAndTime': { $lte: currentDate },
    });

    // Update the state of each study request to 'past' or 'done' if studyEndTime has passed
    for (const studyRequest of openAndCloseStudyRequests) {
      // Calculate the study end time by adding studyDuration.max to startDateAndTime
      const studyEndTime = new Date(studyRequest.startDateAndTime.getTime() + studyRequest.studyDuration.max);

      // Check if studyEndTime has passed
      if (studyEndTime < currentDate) {
        studyRequest.state = studyRequest.state === 'open' ? 'past' : 'done';
        await studyRequest.save();
      }
    }

  } catch (error) {
    console.error('Error updating study request states:', error);
  }
};

module.exports = { updateStudyRequestStates };

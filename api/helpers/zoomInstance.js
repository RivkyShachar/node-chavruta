const axios = require('axios');

exports.generateZoomLink = async(data = {}) => {
  try {
    const dataToGenerateToken = {
      params: {
        grant_type: process.env.zoom_grant_type,
        account_id: process.env.zoom_account_id,
      },
      auth: {
        username: process.env.zoom_username,
        password: process.env.zoom_password,
      }
    }
    console.log("dataToGenerateToken");
    console.log(dataToGenerateToken);
    // Step 1: Generate Zoom Token
    const zoomTokenResponse = await axios.post('https://zoom.us/oauth/token', null,dataToGenerateToken );
    console.log("now will generate access token");

    const accessToken = zoomTokenResponse.data.access_token;
    console.log("accessTokenZoom",accessToken);

    // Step 2: Create Zoom Meeting
    const createMeetingResponse = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic: `Chavruta`,
      type: 1,
      duration: 40,
      timezone: data.timezone || 'Israel',
      password: '123',
      agenda: "Chavruta now!",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: true,
      },
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const zoomMeetingLink = createMeetingResponse.data.start_url;

    console.log('Zoom Meeting Link:', zoomMeetingLink);
    return zoomMeetingLink;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return "https://us05web.zoom.us/j/83054726798?pwd=qRuiRbQ2PObCwM0YNjNw2wi1P4Sc24.1";
  }
}

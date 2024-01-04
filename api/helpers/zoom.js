const axios = require('axios');

exports.generateZoomLink = async(data) => {
  try {
    // Step 1: Generate Zoom Token
    const zoomTokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: process.env.zoom_grant_type,
        account_id: process.env.zoom_account_id,
      },
      auth: {
        username: process.env.zoom_username,
        password: process.env.zoom_password,
      },
    });

    const accessToken = zoomTokenResponse.data.access_token;

    // Step 2: Create Zoom Meeting
    const createMeetingResponse = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic: `Chavruta with ${data.name}`,
      type: 2,
      start_time: data.start_time,
      duration: min(20,data.duration),
      timezone: data.timezone || 'Israel',
      password: '123',
      agenda: data.agenda,
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

    const zoomMeetingLink = createMeetingResponse.data.join_url;

    console.log('Zoom Meeting Link:', zoomMeetingLink);
    return zoomMeetingLink;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

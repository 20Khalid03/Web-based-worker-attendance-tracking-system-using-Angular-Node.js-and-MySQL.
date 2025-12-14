const axios = require('axios');

const oneSignalAppId = 'f5547719-f95a-4a17-9c90-acb1fc9a9a30';
const oneSignalApiKey = 'N2RhOWI4ZDMtM2FhNS00MThlLTgyZWMtMjVkNmIwN2YwMWZh';

const sendNotificationToAllDevices = async (title, message) => {
  try {
    const response = await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: oneSignalAppId,
      included_segments: ['All'],
      headings: { en: title },
      contents: { en: message },
    }, {
      headers: {
        Authorization: `Basic ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification OneSignal :', error.message);
    throw new Error('Erreur lors de l\'envoi de la notification OneSignal');
  }
};

module.exports = {
  sendNotificationToAllDevices
};

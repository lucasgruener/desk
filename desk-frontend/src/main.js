import { joinGame } from './game.js'
import { joinGroupChat } from './voice.js'


export let stream;

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}



// Get the 'code' query parameter from the URL
var roomCode = getQueryParam('room');

if (!roomCode) {
    window.location.href = "/welcome/index.html"
} else {


    window.addEventListener('load', getMediaStream);
    let placeholder = document.getElementById('placeholder')
    placeholder.style.display = 'none'
    // let stream;
    let audio = true;
    let video = true
    window.addEventListener('load', () => {
        const toggleAudioButton = document.getElementById('selectAudio');
        const toggleVideoButton = document.getElementById('selectVideo');
        const joinButton = document.getElementById('joinRoom')

        toggleAudioButton.addEventListener('click', () => {
            if (toggleAudioButton.className === "comms-button-start inactive") {
                toggleAudioButton.className = "comms-button-start active"
                audio = true

            } else {
                toggleAudioButton.className = "comms-button-start inactive"
                audio = false
            };

            // Toggle audio track
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;

            });

        });

        toggleVideoButton.addEventListener('click', () => {
            if (toggleVideoButton.className === "comms-button inactive") {
                toggleVideoButton.className = "comms-button active"
                video = true

            } else {
                toggleVideoButton.className = "comms-button inactive"
                video = false
            };
            // Toggle video track
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });

            // let ownVideo = document.getElementById('ownVideo');
            // if (ownVideo.style.display === 'none') {
            //     ownVideo.style.display = 'flex'
            // } else {
            //     ownVideo.style.display = 'none'
            // }
        });

        joinButton.addEventListener('click', join)
    });
    let audioDeviceId, videoDeviceId
    // Get user media devices and handle device selection
    async function getMediaStream() {
        const audioSelect = document.getElementById('audioSelect');
        const videoSelect = document.getElementById('videoSelect');
        const startButton = document.getElementById('startButton');
        const deviceSelection = document.getElementById('deviceSelection');

        let devices
        await setMedia()



        devices = await getDevices();
    
        deviceSelection.addEventListener('change', () => {
            if (audioSelect.value) {

                audioDeviceId = audioSelect.value;
            }
            if (videoSelect.value) {
                videoDeviceId = videoSelect.value;
            }
            setMedia();
        })

        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label;

            if (device.kind === 'audioinput') {
                audioSelect.appendChild(option);
                audioDeviceId = option.deviceId;
            } else if (device.kind === 'videoinput') {
                videoDeviceId = option.deviceId;
                videoSelect.appendChild(option);
            }
        });



    }

    async function getDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        while (!devices) {
            setTimeout(
                devices = await navigator.mediaDevices.enumerateDevices(),
                500)
        }
        return devices
    }
    async function setMedia() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: audioDeviceId },
                video: { deviceId: videoDeviceId }
            })
            startCameraPreview(stream);
            // Hide device selection and start the chat
            // deviceSelection.style.display = 'none';
            // joinGroupChat(roomCode, stream); // Pass the stream to the chat function
        } catch (error) {
            console.error('Error getting media stream:', error);
        }
    }
    async function startCameraPreview(stream) {
        const cameraPreview = document.getElementById('cameraPreview');
        cameraPreview.srcObject = stream;
        cameraPreview.muted = true;
        await cameraPreview.play().catch(error => {
            console.error('Error playing camera preview:', error);
        });
    }
    function join() {
        if (stream) {
            let deviceSelector = document.getElementById('start')
            deviceSelector.remove()
            joinGame(roomCode);
            joinGroupChat(roomCode, audio, video)
        }
    }

} 
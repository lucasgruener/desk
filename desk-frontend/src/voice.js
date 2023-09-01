import { stream } from './main'

export async function joinGroupChat(roomCode, audio, video) {
    const socket = io('https://virtual-office-comms-array-54a29fd4d668.herokuapp.com/', { transports: ['websocket'] });
    let peerConnectionMap = {}; // Use a map to store peer connections by user ID
    let addedTracks = {};

    // let stream;
    function start() {
        toggleAudioButton.addEventListener('click', () => {
            if (toggleAudioButton.className === "comms-button inactive") {
                toggleAudioButton.className = "comms-button active"

            } else {
                toggleAudioButton.className = "comms-button inactive"

            };

            // Toggle audio track
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;

            });
            socket.emit('toggle-audio', {
                source: socket.id,
            });
        });

        toggleVideoButton.addEventListener('click', () => {
            if (toggleVideoButton.className === "comms-button inactive") {
                toggleVideoButton.className = "comms-button active"


            } else {
                toggleVideoButton.className = "comms-button inactive"

            };
            // Toggle video track
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            socket.emit('toggle-video', {
                source: socket.id,
            });
            let ownVideo = document.getElementById('ownVideo');
            if (ownVideo.style.display === 'none') {
                ownVideo.style.display = 'flex'
            } else {
                ownVideo.style.display = 'none'
            }
        });

    };

    try {
        // const ownConnection = new RTCPeerConnection();
        // stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        // ownConnection.addStream(stream);
        let container = document.createElement('div')
        container.className = 'video-container'
        container.id = 'ownVideoContainer'





        const remoteVideo = document.createElement('video');

        remoteVideo.id = 'ownVideo';
        remoteVideo.autoplay = true;
        remoteVideo.muted = true;
        remoteVideo.srcObject = stream;
        container.appendChild(remoteVideo)
        let wrapper = document.getElementById('control')

        wrapper.appendChild(container);

        socket.on('userJoined', async data=> {
            const parsedData = JSON.parse(data);
            let userId = parsedData.clientId;
            let userSettings = parsedData.settings;


            // Create a new peer connection for that user
            let peerConnection = new RTCPeerConnection();
            peerConnectionMap[userId] = peerConnection;
            peerConnection = peerConnectionMap[userId]
            // Add your local stream to the peer connection
           
            peerConnection.addStream(stream);


            // Handle ice candidates
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        source: socket.id,
                        target: userId,
                        candidate: event.candidate
                    });
                }
            };
            // Handle remote stream

            peerConnection.onaddstream = event => {
                let remoteStream = event.stream

                let container = document.createElement('div')
                container.className = 'video-container'
                container.id = userId + 'container'
              
                let remoteVideo = document.createElement('video');
                remoteVideo.autoplay = true;
                remoteVideo.id = userId
                remoteVideo.srcObject = remoteStream;
                remoteVideo.id = userId;
                if (!userSettings.video) {
                    remoteVideo.style.display = 'none';
                }
                if (!userSettings.audio) {
                    remoteVideo.muted = true;
                }


                container.appendChild(remoteVideo)
                let wrapper = document.getElementById('wrapper')
                remoteVideo.id = userId;
                wrapper.appendChild(container);


            };
            // Store the peer connection in the map with the user ID as the key

        });
        socket.on('userIn', async data => {
            const parsedData = JSON.parse(data);
            let userId = parsedData.clientId;
            let userSettings = parsedData.settings;
            // Create a new peer connection for that user



            let peerConnection = new RTCPeerConnection();
            peerConnectionMap[userId] = peerConnection;
            peerConnection = peerConnectionMap[userId]
            // let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            // Add your local stream to the peer connection
            peerConnection.addStream(stream);
            // Handle ice candidates
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        source: socket.id,
                        target: userId,
                        candidate: event.candidate
                    });
                }
            };
            // Handle remote stream
            peerConnection.onaddstream = event => {
                let remoteStream = event.stream
        

                let container = document.createElement('div')
                container.className = 'video-container'
                container.id = userId + 'container'



                let remoteVideo = document.createElement('video');
                remoteVideo.autoplay = true;
                remoteVideo.id = userId
                remoteVideo.srcObject = remoteStream;
                remoteVideo.id = userId;

                if (!userSettings.video) {
                    remoteVideo.style.display = 'none';
                }
                if (!userSettings.audio) {
                    remoteVideo.muted = true;
                }

                container.appendChild(remoteVideo)
                let wrapper = document.getElementById('wrapper')
                remoteVideo.id = userId;
                wrapper.appendChild(container);


            };



            // Store the peer connection in the map with the user ID as the key



            try {
                const offer = await peerConnection.createOffer();
                if (offer) {
                    await peerConnection.setLocalDescription(offer);
                    socket.emit('offer', {
                        source: socket.id,
                        target: userId,
                        offer: offer
                    });

                } else {
                    console.error('Offer is null or invalid:', offer);
                }
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        });

        // When you receive an offer from another user
        socket.on('offer', async offer => {

            if (offer) {
                try {

                    console.log('offer received from:',offer.source)
                    // Get the peer connection for that user from the map
                    let peerConnection = peerConnectionMap[offer.source];
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit('answer', {
                        source: socket.id,
                        target: offer.source,
                        answer: answer
                    });

                } catch (error) {
                    console.error('Error handling offer:', error);
                }
            } else {
                console.error('Offer is null or invalid:', offer);
            }
        });
        // When you receive an answer from another user
        socket.on('answer', async answer => {

            try {
                // Get the peer connection for that user from the map
                let peerConnection = peerConnectionMap[answer.source];
                // Check if the signaling state allows setting the remote description
                if (peerConnection.signalingState === 'have-local-offer' || peerConnection.signalingState === 'have-remote-offer') {

                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer.answer))

                } else {
                    // Ignore or reject the answer
                    console.warn('Ignoring answer from', answer.source, 'because signaling state is', peerConnection.signalingState);
                }

            } catch (error) {
                console.error('Error setting remote description:', error);
            }
        });

        socket.on('ice-candidate', candidate => {
            let peerConnection = peerConnectionMap[candidate.source];
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate.candidate)).catch(error => {
                console.error('Error adding ICE candidate:', error);
            });
        });



        socket.on('toggle-audio', data => {
            let video = document.getElementById(data.source);
            video.muted = !video.muted
        });

        socket.on('toggle-video', data => {
            let video = document.getElementById(data.source);
            if (video) {
                if (video.style.display === 'none') {
                    video.style.display = 'flex';
                } else {
                    video.style.display = 'none';
                }
            }

        });

        socket.on('user-disconnected', userId => {

            peerConnectionMap[userId] = null
            let video = document.getElementById(userId + 'container')
            video.remove();

        })

        const toggleAudioButton = document.getElementById('toggleAudioButton');
        const toggleVideoButton = document.getElementById('toggleVideoButton');

        if (!audio) {
            toggleAudioButton.className = "comms-button inactive"
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;

            });
            // socket.emit('toggle-audio', {
            //     source: socket.id,
            // });
        }
        if (!video) {
            toggleVideoButton.className = "comms-button inactive"
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;

            });
            // socket.emit('toggle-audio', {
            //     source: socket.id,
            // });
            let ownVideo = document.getElementById('ownVideo');

            ownVideo.style.display = 'none'


        }

        start();

        socket.emit('roomCode', {
            roomCode: roomCode,
            audio: audio,
            video: video
        });
    } catch (error) {
        console.error('Error joining group chat:', error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const createRoomButton = document.getElementById("createRoomButton");
    const joinRoomButton = document.getElementById("joinRoomButton");
    const roomIdInput = document.getElementById("roomIdInput");

    createRoomButton.addEventListener("click", function () {
        // Generate a random room ID
        const roomId = generateRoomId();

        // Redirect to the /roomid route
        window.location.href = `/?room=${roomId}`;
    });



    joinRoomButton.addEventListener("click", function () {
        const roomId = roomIdInput.value.trim();
        if (roomId) {
            // Redirect to the /roomid route
            window.location.href = `/?room=${roomId}`;
        }
    });

    function generateRoomId() {
        // Generate a unique room ID (you can use a more robust method)
        return Math.random().toString(36).substr(2, 8);
    }

});
export let joystickPosition = { x: 0, y: 0 };
export function joystick() {
    

    const joystickContainer = document.querySelector('.joystick-container');
    const joystick = document.querySelector('.joystick');

    let isJoystickPressed = false;
    

    joystickContainer.addEventListener('mousedown', (e) => {
        isJoystickPressed = true;
        updateJoystickPosition(e);
    });

    joystickContainer.addEventListener('touchstart', (e) => {
        isJoystickPressed = true;
        updateJoystickPosition(e.touches[0]);
    });

    joystickContainer.addEventListener('mousemove', (e) => {
        if (isJoystickPressed) {
            updateJoystickPosition(e);
        }
    });

    joystickContainer.addEventListener('touchmove', (e) => {
        if (isJoystickPressed) {
            updateJoystickPosition(e.touches[0]);
        }
    });


    
    window.addEventListener('mouseup', () => {
      
        isJoystickPressed = false;
        // setTimeout(resetJoystickPosition,300);
        resetJoystickPosition();
       
    });
    
    window.addEventListener('touchend', () => {
        isJoystickPressed = false;
        resetJoystickPosition();
    });
    function updateJoystickPosition(event) {
        const containerRect = joystickContainer.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
    
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;
    
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
        if (distance > centerX) {
            const angle = Math.atan2(deltaY, deltaX);
            joystickPosition.x = Math.cos(angle) * centerX;
            joystickPosition.y = Math.sin(angle) * centerY;
        } else {
            joystickPosition.x = deltaX;
            joystickPosition.y = deltaY;
        }
        let elementPosition;
        elementPosition = {x: joystickPosition.x + 30, y: joystickPosition.y + 30};
       

        joystick.style.transform = `translate(${elementPosition.x}px, ${elementPosition.y}px)`;
    }
    function resetJoystickPosition() {
        
        joystickPosition.x = 0;
        joystickPosition.y = 0;
        joystick.style.transform = 'translate(30px, 30px)';
    }
    resetJoystickPosition()
}
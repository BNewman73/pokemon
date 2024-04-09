const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

// canvas.width = 1024
// canvas.height = 576 
canvas.width = innerWidth
canvas.height = innerHeight 

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i+= 70) {
    battleZonesMap.push(battleZonesData.slice(i, i + 70))
}
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, i + 70))
}

const offset = {
    x: -736,
    y: -611
}

const battleZones = []
battleZonesMap.forEach((row, i) => {
    row.forEach((val, j) => {
        if (val === 1025) {
            battleZones.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            }))
        }
    })
})

const boundaries = []
collisionsMap.forEach((row, i) => {
    row.forEach((val, j) => {
        if (val === 1025) {
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            }))
        }
    })
})

const backgroundImage = new Image()
backgroundImage.src = './Images/Pellet Town.png'
const foregroundImage = new Image()
foregroundImage.src = './Images/foreground.png'
const playerDownImage = new Image()
playerDownImage.src = './Images/playerDown.png'
const playerUpImage = new Image()
playerUpImage.src = './Images/playerUp.png'
const playerLeftImage = new Image()
playerLeftImage.src = './Images/playerLeft.png'
const playerRightImage = new Image()
playerRightImage.src = './Images/playerRight.png'

const background = new Drawable({
    position: {
        x: offset.x, 
        y: offset.y
    }, 
    image: backgroundImage
})

const player = new Drawable({
    position: {
        x: canvas.width / 2 - 192 / 8, // playerImage.width
        y: canvas.height / 2 - 68 / 2 // playerImage.height
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 20
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        right: playerRightImage,
        left: playerLeftImage
    }
})

const foreground = new Drawable({
    position: {
        x: offset.x, 
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
let lastKey = ''

function rectCollision({rectangle1, rectangle2}) {
    return rectangle1.position.x + rectangle1.width >= rectangle2.position.x + 10 && 
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width - 10 &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y + 10 &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height - 30
}

const movables = [background, foreground, ...boundaries, ...battleZones]

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    // boundaries.forEach(boundary => {
    //     boundary.draw()
    // })
    player.draw()
    foreground.draw()
    player.animate = false
    let moving = true
    if (battle.initiated) return 
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y))
            if (rectCollision({rectangle1: player, rectangle2: battleZone}) && overlappingArea > (player.width * player.height) / 2 && Math.random() < 0.01) {
                window.cancelAnimationFrame(animationId)
                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1, 
                    repeat: 3,
                    yoyo: true, 
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                initBattle()
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })
                break
            }
        }
    }
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectCollision({rectangle1: player, rectangle2: {...boundary, position: {x: boundary.position.x, y: boundary.position.y + 2}}})) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.y += 2
            })
        }
    }
    else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectCollision({rectangle1: player, rectangle2: {...boundary, position: {x: boundary.position.x + 2, y: boundary.position.y}}})) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x += 2
            })
        }
    }
    else if (keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectCollision({rectangle1: player, rectangle2: {...boundary, position: {x: boundary.position.x, y: boundary.position.y - 2}}})) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.y -= 2
            })
        }
    }
    else if (keys.d.pressed && lastKey === 'd') { 
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectCollision({rectangle1: player, rectangle2: {...boundary, position: {x: boundary.position.x - 2, y: boundary.position.y}}})) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x -= 2
            })
        }
    }
}
animate()

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})

function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}
window.addEventListener('resize', resizeCanvas)
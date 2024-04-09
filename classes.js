class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = Boundary.width
        this.height = Boundary.height
    }

    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0.1'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Drawable {
    constructor({position, velocity, image, frames = {max: 1, hold: 10}, sprites, animate = false, rotation = 0}) {
        this.position = position
        this.image = new Image()
        this.frames = {...frames, val: 0, elapsed: 0}
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.sprites = sprites
        this.animate = animate
        this.opacity = 1
        this.rotation = rotation
    }

    draw() {
        context.save()
        context.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
        context.rotate(this.rotation)
        context.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)
        context.globalAlpha = this.opacity
        context.drawImage(
            this.image,
            this.frames.val * this.width, // crop x start
            0, // crop y start
            this.image.width / this.frames.max, // crop x end
            this.image.height, // crop y end
            this.position.x, // x position
            this.position.y, // y position
            this.image.width / this.frames.max,
            this.image.height
        )
        context.restore()
        if (!this.animate) return
        if (this.frames.max > 1) {
            this.frames.elapsed++
            if (this.frames.elapsed % this.frames.hold == 0) {
                if (this.frames.val + 1 < this.frames.max) this.frames.val++
                else this.frames.val = 0
            }
        }
    }
}

class Monster extends Drawable {
    constructor({
        position, 
        velocity, 
        image, 
        frames = {
            max: 1, 
            hold: 10
        }, 
        sprites, 
        animate = false, 
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position, 
            velocity, 
            image, 
            frames, 
            sprites, 
            animate, 
            rotation
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }

    attack({attack, recipient, renderedSprites}) {
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name
        let healthBar = '#enemyHealthBar'
        let rotation = 1
        if (this.isEnemy) {
            healthBar = '#playerHealthBar'
            rotation = -2.2
        }
        recipient.health = recipient.health - attack.damage
        switch(attack.name) {
            case 'Tackle':
                const tl = gsap.timeline()
                let movementDistance = 20
                if (this.isEnemy) {
                    movementDistance = -20
                }
                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break
            case 'Fireball': 
                const fireballImage = new Image();
                fireballImage.src = './Images/fireball.png'
                const fireball = new Drawable( {
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation: rotation
                })
                renderedSprites.splice(1, 0, fireball)
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1)
                    }
                })
                break
        }
    }

    faint() {
        document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted'
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
    }
}
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game;
let playerName = '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

document.getElementById('start-button').addEventListener('click', () => {
    playerName = document.getElementById('player-name').value;
    if (playerName) {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        game = new Phaser.Game(config);
    }
});

document.getElementById('play-again-button').addEventListener('click', () => {
    document.getElementById('leaderboard-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    resetGame();
});

let paddle;
let hatchet;
let blocks;
let cursors;
let score = 0;
let scoreText;
let isGameOver = false;

function preload() {
    this.load.image('paddle', 'paddle.png');
    this.load.image('hatchet', 'hatchet.png');
    this.load.image('car', 'car.png');
}

function create() {
    paddle = this.physics.add.image(512, 700, 'paddle').setImmovable().setScale(0.25);
    paddle.body.allowGravity = false;
    paddle.setCollideWorldBounds(true);

    hatchet = this.physics.add.image(512, 650, 'hatchet');
    hatchet.setCollideWorldBounds(true);
    hatchet.setBounce(1, 1);
    hatchet.setScale(0.1);
    hatchet.setVelocity(200, -200);

    blocks = this.physics.add.staticGroup();
    for (let y = 100; y < 300; y += 50) {
        for (let x = 80; x < 920; x += 60) {
            let block = blocks.create(x, y, 'car').setScale(0.1);
            block.refreshBody();
        }
    }

    this.physics.add.collider(hatchet, paddle, hitPaddle, null, this);
    this.physics.add.collider(hatchet, blocks, hitBlock, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
}

function update() {
    if (isGameOver) {
        return;
    }

    if (cursors.left.isDown) {
        paddle.setVelocityX(-500);
    } else if (cursors.right.isDown) {
        paddle.setVelocityX(500);
    } else {
        paddle.setVelocityX(0);
    }

    if (hatchet.y > 671) {
        endGame(this);
    }
}

function hitPaddle(hatchet, paddle) {
    let diff = 0;

    if (hatchet.x < paddle.x) {
        diff = paddle.x - hatchet.x;
        hatchet.setVelocityX(-10 * diff);
    } else if (hatchet.x > paddle.x) {
        diff = hatchet.x - paddle.x;
        hatchet.setVelocityX(10 * diff);
    } else {
        hatchet.setVelocityX(2 + Math.random() * 8);
    }
}

function hitBlock(hatchet, block) {
    block.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (blocks.countActive() === 0) {
        this.scene.restart();
    }
}

function endGame(scene) {
    isGameOver = true;
    scene.physics.pause();
    scene.scene.stop();
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');

    leaderboard.push({ name: playerName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    document.getElementById('leaderboard').innerHTML = leaderboard.map(entry => `<p>${entry.name}: ${entry.score}</p>`).join('');
}

function resetGame() {
    isGameOver = false;
    score = 0;
    game.destroy(true);
    game = new Phaser.Game(config);
}

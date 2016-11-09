var screenWidth = 1080;
var screenHeight = 640;
var brideDimensions = 16;

var cursors;
var baseVelocity = 150;

var sounds = {
    throw: 'sounrdThrow'
};

var sprites = {
    bride: 'imageBride',
    bouquet: 'imageBouquet',
    maid1: 'imageMaid1',
    maid2: 'imageMaid2',
    maid3: 'imageMaid3',
    explosion: 'imageExplosion',
};

var score = 0;
var scoreText;
var bouquetsUsed = 0;
var bouquetsUsedText;

var state = {
    preload: function() {
        //game.load.audio('music', ['res/music.mp3']);
        game.load.audio(sounds.throw, ['res/throw.wav']);
        game.load.image(sprites.bride, 'res/bride.png');
        game.load.image(sprites.bouquet, 'res/bouquet.png');
        game.load.image(sprites.maid1, 'res/maid1.png');
        game.load.image(sprites.maid2, 'res/maid2.png');
        game.load.image(sprites.maid3, 'res/maid3.png');
        game.load.spritesheet(sprites.explosion, 'res/explosion_sprite.png', 128, 128);
    },
    create: function() {
        game.stage.backgroundColor = '#4488AA';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        bouquetsUsedText = game.add.text(16, 50, 'Bouquets Used: 0', { fontSize: '32px', fill: '#000' });

        this.createBride();
        this.createBouquet();
        this.createMaids();
        this.createExplosions();
    },
    update: function() {
        this.brideUpdate();
        this.bouquetUpdate();
    },
    createBride: function() {
        this.bride = game.add.sprite(0, game.world.height / 2, sprites.bride);
        game.physics.arcade.enable(this.bride);
        this.bride.body.allowGravity = false;
        this.bride.collideWorldBounds = true;
        this.bride.anchor.x = 0.5;
        this.bride.anchor.y = 0.5;
    },
    createBouquet: function() {
        var bouquetInitialPosition = this.bouquetInitialPosition();
        this.bouquet = game.add.sprite(bouquetInitialPosition.x, bouquetInitialPosition.y, sprites.bouquet);
        this.bouquet.visible = false;
        game.physics.arcade.enable(this.bouquet);
        this.bouquet.body.allowGravity = false;
        this.bouquet.checkWorldBounds = true;
        this.bouquet.kill();

        this.bouquet.events.onOutOfBounds.add(function() {
            this.bouquet.kill();
        }, this);
    },
    bouquetInitialPosition: function() {
        return {
            x: this.bride.body.position.x + 35,
            y: this.bride.body.position.y
        }
    },
    createMaids: function() {
        this.maids = game.add.physicsGroup();

        for(var i = 0; i < 20; i++) {
            this.createMaid();
        }
        this.setMaidCallbacks();
    },
    createMaid: function() {
        var spriteMaid = Phaser.ArrayUtils.getRandomItem([sprites.maid1, sprites.maid2, sprites.maid3]);
        do {
            var posX = game.world.randomX;
        } while(posX < game.world.width/3);
        
        var posY = game.world.randomY;
        var maid = this.maids.create(posX, posY, spriteMaid);
        maid.body.velocity.y = game.rnd.between(100, 300);
        maid.body.mass = -100;
    },
    createExplosions: function() {
        this.explosions = game.add.group();
        this.explosions.createMultiple(30, sprites.explosion);
        this.explosions.forEach(function(e) {
            e.anchor.x = 0.5;
            e.anchor.y = 0.5;
            e.animations.add(sprites.explosion);
        }, this);
    },
    setMaidCallbacks: function() {
        this.maids.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', function(maid) {
            maid.body.velocity.y = -maid.body.velocity.y;
        }, this);
        this.maids.setAll('checkWorldBounds', true);
    },
    brideUpdate: function() {
        var b = this.bride.body;
        b.velocity.x = 0;
        b.velocity.y = 0;

        if((this.cursors.left.isDown) ||
           (game.input.mousePointer.pageX < this.bride.x - brideDimensions) ||
           (game.input.pointer1.isDown && (game.input.pointer1.pageX < this.bride.x - brideDimensions))) {
            b.velocity.x = -baseVelocity;
        }
        if((this.cursors.right.isDown) ||
           (game.input.mousePointer.pageX > this.bride.x + brideDimensions) ||
           (game.input.pointer1.isDown && (game.input.pointer1.pageX > this.bride.x + brideDimensions))) {
            b.velocity.x = baseVelocity;
        }
        if((this.cursors.up.isDown) ||
           (game.input.mousePointer.pageY < this.bride.y - brideDimensions) ||
           (game.input.pointer1.isDown && (game.input.pointer1.pageY < this.bride.y - brideDimensions))) {
            b.velocity.y = -baseVelocity;
        }
        if((this.cursors.down.isDown) ||
           (game.input.mousePointer.pageY > this.bride.y + brideDimensions) ||
           (game.input.pointer1.isDown && (game.input.pointer1.pageY > this.bride.y + brideDimensions))) {
            b.velocity.y = baseVelocity;
        }

        if(this.fireCommand()) {
            this.fireBouquet();
        }
    },
    fireCommand: function() {
        return (this.spaceKey.isDown || game.input.mousePointer.isDown || game.input.pointer2.isDown);
    },
    fireBouquet: function() {
        if(!this.bouquet.alive) {
            this.bouquet.visible = true;
            game.add.audio(sounds.throw).play();
            var bouquetInitialPosition = this.bouquetInitialPosition();
            this.bouquet.x = bouquetInitialPosition.x;
            this.bouquet.y = bouquetInitialPosition.y;
            this.bouquet.revive();
            this.updateBouquetsUsed();
        }
    },
    bouquetUpdate: function() {
        this.bouquet.body.velocity.x = 3 * baseVelocity;
        this.bouquet.body.velocity.y = 0;
        game.physics.arcade.collide(this.bouquet, this.maids, this.bouquetCollisionHandler, null, this);
    },
    updateScore: function(val) {
        score += val;
        scoreText.text = 'Score: ' + score;
    },
    updateBouquetsUsed: function() {
        bouquetsUsed += 1;
        bouquetsUsedText.text = 'Bouquets Used: ' + bouquetsUsed;
    },
    bouquetCollisionHandler: function(b, m) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(m.body.x, m.body.y);
        explosion.play(sprites.explosion, 30, false, true);
        m.kill();
        b.kill();
        this.updateScore(10);
    }
};

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'crazy-bride', state);
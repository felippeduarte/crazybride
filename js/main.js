var screenWidth = 720;
var screenHeight = 480;
var brideDimensions = 16;
var maidDimensions = 16;

var cursors;
var baseVelocity = 100;

var numberOfMaids = 20;

var floor;

var sounds = {
    throw: 'soundThrow'
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
var scoreTextLabel = 'Inimigas Eliminadas:';
var bouquetsUsedTextLabel = 'Buquês-bomba Utilizados:';
var labelFontSize = '24px';

var endGame = {text1: null, text2: null, button: null};

var gameRunning = false;

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

        floor = [{x: 0, y: 0}, {x: brideDimensions * 8, y: game.world.height}];

        this.createFloor();
        this.createBride();
        this.createBouquet();
        this.createMaids();
        this.createExplosions();
        this.createScoreText();

        gameRunning = true;
    },
    update: function() {
        this.brideUpdate();
        this.bouquetUpdate();
    },
    createScoreText: function() {
        var graphics = this.game.add.graphics();
        
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawRect(10, 10, 340, 75);
        graphics.endFill();

        scoreText = game.add.text(16, 16, scoreTextLabel + ' 0', { fontSize: labelFontSize, fill: '#000' });
        bouquetsUsedText = game.add.text(16, 50, bouquetsUsedTextLabel + ' 0', { fontSize: labelFontSize, fill: '#000' });
    },
    createFloor: function() {
        var graphics = this.game.add.graphics();
        graphics.lineStyle(2, 0xE90000, 1);
        graphics.beginFill(0xD80000, 1);
        graphics.drawRect(floor[0].x, floor[0].y, floor[1].x, floor[1].y);
        graphics.endFill();
    },
    createBride: function() {
        this.bride = game.add.sprite(brideDimensions, game.world.height / 2, sprites.bride);
        game.physics.arcade.enable(this.bride);
        this.bride.body.allowGravity = false;
        this.bride.collideWorldBounds = true;
        this.bride.anchor.x = 0.5;
        this.bride.anchor.y = 0.5;
        this.setBrideInitialPosition();
    },
    setBrideInitialPosition: function() {
        this.bride.x = floor[1].x / 2;
        this.bride.y = game.world.height / 2;
    },
    createBouquet: function() {
        this.bouquet = game.add.weapon(2, sprites.bouquet);
        this.bouquet.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.bouquet.bulletSpeed = 200;
        this.bouquet.fireRate = 1200;

        this.bouquet.trackSprite(this.bride, this.bride.width + this.bouquet.halfWidth, 0, true);
    },
    createMaids: function() {
        this.maids = game.add.physicsGroup();

        for(var i = 0; i < numberOfMaids; i++) {
            this.createMaid();
        }
        this.setMaidCallbacks();
    },
    createMaid: function() {
        var spriteMaid = Phaser.ArrayUtils.getRandomItem([sprites.maid1, sprites.maid2, sprites.maid3]);
        do {
            var posX = game.world.randomX;
        } while(posX < floor[1].x || posX > screenWidth - maidDimensions);
        
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

        var mouseWithinFloor = this.mouseWithinFloor();

        if((this.cursors.left.isDown) ||
            (
              (mouseWithinFloor && (game.input.mousePointer.pageX < this.bride.x - brideDimensions)) ||
              (game.input.pointer1.isDown && (game.input.pointer1.pageX < this.bride.x - brideDimensions))
            )
        ) {
            b.velocity.x = -baseVelocity;
        }

        if((this.cursors.right.isDown) ||
            (
              (mouseWithinFloor && (game.input.mousePointer.pageX > this.bride.x + brideDimensions)) ||
              (game.input.pointer1.isDown && (game.input.pointer1.pageX > this.bride.x + brideDimensions))
            )
        ) {
            b.velocity.x = baseVelocity;
        }

        if((this.cursors.up.isDown) ||
            (
              (mouseWithinFloor && (game.input.mousePointer.pageY < this.bride.y - brideDimensions)) ||
              (game.input.pointer1.isDown && (game.input.pointer1.pageY < this.bride.y - brideDimensions))
            )
        ) {
            b.velocity.y = -baseVelocity;
        }

        if((this.cursors.down.isDown) ||
            (
              (mouseWithinFloor && (game.input.mousePointer.pageY > this.bride.y + brideDimensions)) ||
              (game.input.pointer1.isDown && (game.input.pointer1.pageY > this.bride.y + brideDimensions))
            )
        ) {
            b.velocity.y = baseVelocity;
        }

        if(this.bride.x + b.halfWidth> floor[1].x) {
            this.bride.x = floor[1].x - b.halfWidth;
        }

        this.game.input.touch.touchEndCallback = function(){
            b.velocity.x = 0;
            b.velocity.y = 0;
        };

        if(this.fireCommand()) {
            this.fireBouquet();
        }
    },
    mouseWithinFloor: function() {
        var mp = game.input.mousePointer;
        var ret = mp.withinGame &&
            mp.pageX > floor[0].x &&
            mp.pageX < floor[1].x &&
            mp.pageY > floor[0].y &&
            mp.pageY < floor[1].y;

        return ret;
    },
    fireCommand: function() {
        return gameRunning &&
            (this.spaceKey.isDown ||
            game.input.mousePointer.isDown ||
            (game.input.pointer1.isDown &&
                game.input.pointer1.pageY > 0 &&
                game.input.pointer1.pageY < floor[1].y &&
                game.input.pointer1.pageX > floor[1].x &&
                game.input.pointer1.pageY < screenWidth
            ));
    },
    fireBouquet: function() {
        var fired = this.bouquet.fire();
        if(fired) {
            game.add.audio(sounds.throw).play();
            this.updateBouquetsUsed();
        }
    },
    bouquetUpdate: function() {
        game.physics.arcade.overlap(this.bouquet.bullets, this.maids, this.bouquetCollisionHandler, null, this);
    },
    updateScore: function(val) {
        score += val;
        this.updateScoreText(score);
    },
    updateScoreText: function(score) {
        scoreText.text = scoreTextLabel + score;
    },
    updateBouquetsUsed: function() {
        bouquetsUsed += 1;
        this.updateBouquetsUsedText(bouquetsUsed);
    },
    updateBouquetsUsedText: function(bouquetsUsed) {
        bouquetsUsedText.text = bouquetsUsedTextLabel + bouquetsUsed;
    },
    bouquetCollisionHandler: function(b, m) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(m.body.x, m.body.y);
        explosion.play(sprites.explosion, 30, false, true);
        m.kill();
        b.kill();
        this.updateScore(1);

        if(this.maids.total <= 0) {
            this.showEndGameStatistics();
        }
    },
    showEndGameStatistics: function() {
        this.bouquet.bullets.callAll('kill');
        this.bride.kill();

        var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        endGame.text1 = game.add.text(0, 0, "Parabéns! Você eliminou todas as inimigas", style);
        endGame.text1.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        endGame.text1.setTextBounds(0, 100, screenWidth, 100);

        endGame.text2 = game.add.text(0, 0, "Seu aproveitamento foi de " + Math.round((score * 100 / bouquetsUsed),2) + "%", style);
        endGame.text2.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        endGame.text2.setTextBounds(0, 150, screenWidth, 150);

        endGame.button = new LabelButton(this.game, screenWidth/2, 300, null, "Clique aqui para reiniciar", function(){this.restart();}, this, 2, 0, 1, style);

        gameRunning = false;
    },
    restart: function() {
        endGame.text1.destroy();
        endGame.text2.destroy();
        endGame.button.destroy();
        score = 0;
        this.updateScoreText(score);
        bouquetsUsed = 0;
        this.updateBouquetsUsedText(bouquetsUsed);
        this.bride.revive();
        this.setBrideInitialPosition();
        this.createMaids();

        gameRunning = true;
    }
};

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'crazy-bride', state);

//trick to create a button with text instead of sprite
var LabelButton = function(game, x, y, key, label, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, style) {
    Phaser.Button.call(this, game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
    
    this.anchor.setTo( 0.5, 0.5 );
    this.label = new Phaser.Text(game, 0, 0, label, style);
    this.label.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //puts the label in the center of the button
    this.label.anchor.setTo( 0.5, 0.5 );
    this.addChild(this.label);
    this.setLabel( label );
    //adds button to game
    game.add.existing( this );
};
LabelButton.prototype = Object.create(Phaser.Button.prototype);
LabelButton.prototype.constructor = LabelButton;
LabelButton.prototype.setLabel = function( label ) {
    this.label.setText(label);
};

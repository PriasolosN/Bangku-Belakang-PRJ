/*:
 * @plugindesc Title Screen kustom dengan animasi, tombol minimalis, dan latar belakang dinamis seperti OMORI.
 * @author Anda
 *
 * @param Background Image
 * @type file
 * @dir img/titles1
 * @desc Gambar latar belakang untuk title screen.
 *
 * @param Logo Image
 * @type file
 * @dir img/pictures
 * @desc Gambar logo atau judul game untuk title screen.
 *
 * @param Music
 * @type file
 * @dir audio/bgm
 * @desc Musik latar untuk title screen.
 *
 * @param Button New Game
 * @desc Teks untuk tombol New Game.
 * @default New Game
 *
 * @param Button Continue
 * @desc Teks untuk tombol Continue.
 * @default Continue
 *
 * @param Button Options
 * @desc Teks untuk tombol Options.
 * @default Options
 *
 * @param Button Font Size
 * @type number
 * @min 12
 * @default 28
 * @desc Ukuran font untuk tombol menu.
 *
 * @help
 * Plugin ini menggantikan title screen default dengan versi kustom.
 * Anda dapat mengatur latar belakang, logo, musik, dan teks tombol.
 *
 * Cara Menggunakan:
 * 1. Siapkan gambar latar belakang dan logo.
 * 2. Tentukan musik latar di parameter plugin.
 * 3. Jalankan game untuk melihat hasilnya.
 */
(function() {
    const params = PluginManager.parameters('CustomTitleScreen');

    const backgroundImage = params['Background Image'] || '';
    const logoImage = params['Logo Image'] || '';
    const bgm = params['Music'] || '';

    const newGameText = params['Button New Game'] || 'New Game';
    const continueText = params['Button Continue'] || 'Continue';
    const optionsText = params['Button Options'] || 'Options';
    const buttonFontSize = Number(params['Button Font Size'] || 28);

    Scene_Title.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createLogo();
        this.createCommandWindow();
        this.playTitleMusic();
    };

    Scene_Title.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite(ImageManager.loadTitle1(backgroundImage));
        this.addChild(this._backgroundSprite);
    };

    Scene_Title.prototype.createLogo = function() {
        this._logoSprite = new Sprite(ImageManager.loadPicture(logoImage));
        this._logoSprite.x = Graphics.width / 2 - this._logoSprite.width / 2;
        this._logoSprite.y = Graphics.height / 4;
        this._logoSprite.opacity = 0;
        this.addChild(this._logoSprite);

        // Fade-in animation
        this._logoFadeIn = true;
    };

    Scene_Title.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._logoFadeIn) {
            this._logoSprite.opacity += 2;
            if (this._logoSprite.opacity >= 255) {
                this._logoFadeIn = false;
            }
        }
    };

    Scene_Title.prototype.createCommandWindow = function() {
        this._commandWindow = new Window_TitleCommand();
        this._commandWindow.y = Graphics.height - this._commandWindow.height - 100;

        // Customize button appearance
        this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this));
        this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this.addWindow(this._commandWindow);

        this._commandWindow.contents.fontSize = buttonFontSize;
    };

    Scene_Title.prototype.playTitleMusic = function() {
        if (bgm) {
            AudioManager.playBgm({ name: bgm, volume: 90, pitch: 100, pan: 0 });
        }
    };
})();
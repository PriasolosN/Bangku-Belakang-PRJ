/*:
 * @plugindesc Minigame matematika 3 variabel (dengan kurung) + tingkat kesulitan & SE custom.
 * @author Assistant
 *
 * @param ResultSwitch
 * @text Switch Hasil
 * @desc ID Switch yang bernilai ON jika pemain benar dan OFF jika salah.
 * @type switch
 * @default 1
 *
 * @param DefaultDifficulty
 * @text Tingkat Kesulitan Default
 * @desc Kesulitan awal jika tidak ditentukan saat dipanggil: easy, medium, hard
 * @type select
 * @option Mudah (Easy)
 * @value easy
 * @option Sedang (Medium)
 * @value medium
 * @option Sulit (Hard)
 * @value hard
 * @default medium
 *
 * @param CorrectSE
 * @text SE Jawaban Benar
 * @desc File audio dari folder audio/se/ saat jawaban benar.
 * @type file
 * @dir audio/se/
 * @default Item3
 *
 * @param WrongSE
 * @text SE Jawaban Salah
 * @desc File audio dari folder audio/se/ saat jawaban salah.
 * @type file
 * @dir audio/se/
 * @default Buzzer1
 *
 * @param SEVolume
 * @text Volume Efek Suara
 * @desc Volume efek suara (0 - 100).
 * @type number
 * @default 90
 *
 * @help
 * ============================================================================
 * Perintah Plugin (Plugin Command)
 * ============================================================================
 *
 * 1. Memanggil dengan Kesulitan Default (sesuai Parameter Plugin):
 *    MATH_QUIZ start
 *
 * 2. Memanggil dengan Kesulitan Spesifik:
 *    MATH_QUIZ start easy     (Angka kecil & operasi dasar)
 *    MATH_QUIZ start medium   (Angka sedang, kombinasi tambah/kurang/kali/bagi)
 *    MATH_QUIZ start hard     (Angka besar & perkalian/pembagian kompleks)
 */

(function() {
    var parameters = PluginManager.parameters('MATH_QUIZ');
    if (!parameters || Object.keys(parameters).length === 0) {
        parameters = PluginManager.parameters('MathMinigame');
    }

    var resultSwitchId = Number(parameters['ResultSwitch'] || 1);
    var defaultDifficulty = String(parameters['DefaultDifficulty'] || 'medium').toLowerCase();
    var correctSE = String(parameters['CorrectSE'] || 'Item3');
    var wrongSE = String(parameters['WrongSE'] || 'Buzzer1');
    var seVolume = Number(parameters['SEVolume'] || 90);

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MathMinigame' || command === 'MATH_QUIZ') {
            if (args[0] === 'start') {
                var diff = args[1] ? args[1].toLowerCase() : defaultDifficulty;
                Scene_MathMinigame.selectedDifficulty = diff;
                SceneManager.push(Scene_MathMinigame);
            }
        }
    };

    function playAudio(seName) {
        if (seName) {
            AudioManager.playSe({
                name: seName,
                volume: seVolume,
                pitch: 100,
                pan: 0
            });
        }
    }

    //-----------------------------------------------------------------------------
    // Scene_MathMinigame
    //-----------------------------------------------------------------------------
    function Scene_MathMinigame() {
        this.initialize.apply(this, arguments);
    }

    Scene_MathMinigame.prototype = Object.create(Scene_Base.prototype);
    Scene_MathMinigame.prototype.constructor = Scene_MathMinigame;

    Scene_MathMinigame.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._difficulty = Scene_MathMinigame.selectedDifficulty || defaultDifficulty;
        this.generateQuestion();
    };

    Scene_MathMinigame.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createQuestionWindow();
        this.createChoiceWindow();
    };

    Scene_MathMinigame.prototype.generateQuestion = function() {
        var pattern = Math.floor(Math.random() * 5);
        var a, b, c, ans, text;

        if (this._difficulty === 'easy') {
            // TINGKAT MUDAH (Angka Kecil 1-10, Operasi Sederhana)
            switch(pattern) {
                case 0: // (A + B) - C
                    a = Math.floor(Math.random() * 10) + 1;
                    b = Math.floor(Math.random() * 10) + 1;
                    c = Math.floor(Math.random() * (a + b - 1)) + 1;
                    ans = (a + b) - c;
                    text = "(" + a + " + " + b + ") - " + c;
                    break;
                case 1: // A + (B - C)
                    b = Math.floor(Math.random() * 10) + 2;
                    c = Math.floor(Math.random() * (b - 1)) + 1;
                    a = Math.floor(Math.random() * 10) + 1;
                    ans = a + (b - c);
                    text = a + " + (" + b + " - " + c + ")";
                    break;
                case 2: // (A - B) + C
                    a = Math.floor(Math.random() * 10) + 2;
                    b = Math.floor(Math.random() * (a - 1)) + 1;
                    c = Math.floor(Math.random() * 10) + 1;
                    ans = (a - b) + c;
                    text = "(" + a + " - " + b + ") + " + c;
                    break;
                case 3: // (A + B) + C
                    a = Math.floor(Math.random() * 10) + 1;
                    b = Math.floor(Math.random() * 10) + 1;
                    c = Math.floor(Math.random() * 10) + 1;
                    ans = a + b + c;
                    text = "(" + a + " + " + b + ") + " + c;
                    break;
                default: // A × (B + C)
                    b = Math.floor(Math.random() * 5) + 1;
                    c = Math.floor(Math.random() * 5) + 1;
                    a = Math.floor(Math.random() * 3) + 2;
                    ans = a * (b + c);
                    text = a + " × (" + b + " + " + c + ")";
                    break;
            }

        } else if (this._difficulty === 'hard') {
            // TINGKAT SULIT (Angka Ratusan/Belasan, Perkalian & Pembagian Kompleks)
            switch(pattern) {
                case 0: // (A × B) - C
                    a = Math.floor(Math.random() * 15) + 5;
                    b = Math.floor(Math.random() * 12) + 3;
                    c = Math.floor(Math.random() * 50) + 10;
                    ans = (a * b) - c;
                    text = "(" + a + " × " + b + ") - " + c;
                    break;
                case 1: // (A + B) × C
                    a = Math.floor(Math.random() * 30) + 10;
                    b = Math.floor(Math.random() * 30) + 10;
                    c = Math.floor(Math.random() * 8) + 3;
                    ans = (a + b) * c;
                    text = "(" + a + " + " + b + ") × " + c;
                    break;
                case 2: // (A + B) ÷ C
                    c = Math.floor(Math.random() * 10) + 2;
                    ans = Math.floor(Math.random() * 20) + 5;
                    var total = ans * c;
                    a = Math.floor(Math.random() * (total - 10)) + 5;
                    b = total - a;
                    text = "(" + a + " + " + b + ") ÷ " + c;
                    break;
                case 3: // (A - B) ÷ C
                    c = Math.floor(Math.random() * 10) + 2;
                    ans = Math.floor(Math.random() * 20) + 5;
                    var diff = ans * c;
                    b = Math.floor(Math.random() * 50) + 10;
                    a = b + diff;
                    text = "(" + a + " - " + b + ") ÷ " + c;
                    break;
                default: // A × (B - C)
                    b = Math.floor(Math.random() * 20) + 10;
                    c = Math.floor(Math.random() * (b - 2)) + 1;
                    a = Math.floor(Math.random() * 12) + 4;
                    ans = a * (b - c);
                    text = a + " × (" + b + " - " + c + ")";
                    break;
            }

        } else {
            // TINGKAT SEDANG (MEDIUM)
            switch(pattern) {
                case 0: // (A + B) - C
                    a = Math.floor(Math.random() * 20) + 5;
                    b = Math.floor(Math.random() * 20) + 5;
                    c = Math.floor(Math.random() * 15) + 1;
                    ans = (a + b) - c;
                    text = "(" + a + " + " + b + ") - " + c;
                    break;
                case 1: // (A - B) × C
                    a = Math.floor(Math.random() * 15) + 5;
                    b = Math.floor(Math.random() * (a - 1)) + 1;
                    c = Math.floor(Math.random() * 5) + 2;
                    ans = (a - b) * c;
                    text = "(" + a + " - " + b + ") × " + c;
                    break;
                case 2: // (A + B) ÷ C
                    c = Math.floor(Math.random() * 5) + 2;
                    ans = Math.floor(Math.random() * 10) + 2;
                    var totalM = ans * c;
                    a = Math.floor(Math.random() * (totalM - 2)) + 1;
                    b = totalM - a;
                    text = "(" + a + " + " + b + ") ÷ " + c;
                    break;
                case 3: // A + (B × C)
                    b = Math.floor(Math.random() * 8) + 2;
                    c = Math.floor(Math.random() * 8) + 2;
                    a = Math.floor(Math.random() * 20) + 5;
                    ans = a + (b * c);
                    text = a + " + (" + b + " × " + c + ")";
                    break;
                default: // (A × B) - C
                    a = Math.floor(Math.random() * 8) + 2;
                    b = Math.floor(Math.random() * 8) + 2;
                    c = Math.floor(Math.random() * 10) + 1;
                    ans = (a * b) - c;
                    text = "(" + a + " × " + b + ") - " + c;
                    break;
            }
        }

        this._answer = ans;
        this._questionText = text;

        // Pilihan ganda acak tanpa duplikat & bernilai positif/nol
        this._options = [this._answer];
        while (this._options.length < 4) {
            var offsets = [-1, 1, -2, 2, -5, 5, -10, 10, -3, 3];
            var offset = offsets[Math.floor(Math.random() * offsets.length)];
            var fakeOption = this._answer + offset;
            
            if (fakeOption >= 0 && this._options.indexOf(fakeOption) === -1) {
                this._options.push(fakeOption);
            }
        }
        this._options.sort(function() { return Math.random() - 0.5; });
    };

    Scene_MathMinigame.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_MathMinigame.prototype.createQuestionWindow = function() {
        var ww = 600;
        var wh = 100;
        var wx = (Graphics.boxWidth - ww) / 2;
        var wy = 140;
        
        this._questionWindow = new Window_Base(wx, wy, ww, wh);
        this._questionWindow.opacity = 0;
        
        var text = "Berapakah hasil dari:  " + this._questionText + " = ?";
        this._questionWindow.drawText(text, 0, 10, ww - 36, 'center');
        this.addChild(this._questionWindow);
    };

    Scene_MathMinigame.prototype.createChoiceWindow = function() {
        var ww = 300;
        var wy = 260;
        var wx = (Graphics.boxWidth - ww) / 2;
        
        this._choiceWindow = new Window_MathChoice(wx, wy, this._options);
        this._choiceWindow.opacity = 0;
        this._choiceWindow.setHandler('ok', this.onChoiceOk.bind(this));
        
        this._choiceWindow.activate();
        this._choiceWindow.select(0);
        
        this.addChild(this._choiceWindow);
    };

    Scene_MathMinigame.prototype.onChoiceOk = function() {
        var selectedValue = this._choiceWindow.currentExt();
        if (selectedValue === this._answer) {
            $gameSwitches.setValue(resultSwitchId, true);
            playAudio(correctSE);
        } else {
            $gameSwitches.setValue(resultSwitchId, false);
            playAudio(wrongSE);
        }
        this.popScene();
    };

    //-----------------------------------------------------------------------------
    // Window_MathChoice
    //-----------------------------------------------------------------------------
    function Window_MathChoice() {
        this.initialize.apply(this, arguments);
    }

    Window_MathChoice.prototype = Object.create(Window_Command.prototype);
    Window_MathChoice.prototype.constructor = Window_MathChoice;

    Window_MathChoice.prototype.initialize = function(x, y, options) {
        this._options = options || [];
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_MathChoice.prototype.windowWidth = function() {
        return 300;
    };

    Window_MathChoice.prototype.itemTextAlign = function() {
        return 'center';
    };

    Window_MathChoice.prototype.makeCommandList = function() {
        if (!this._options) return;
        for (var i = 0; i < this._options.length; i++) {
            var opt = this._options[i];
            this.addCommand(String(opt), 'ok', true, opt);
        }
    };
})();
//=============================================================================
// OMORI_TextSpeed.js
// Versi 1.0.0
//=============================================================================

/*:
 * @plugindesc [v1.0.0] Menambahkan efek ketik (typewriter) pada dialog dan
 * membuat kecepatannya bisa dikonfigurasi lewat menu Options / Plugin Command.
 * @author Claude
 *
 * @help
 * =============================================================================
 * TEXT SPEED CONFIG
 * =============================================================================
 * Secara bawaan, RPG Maker MV menampilkan seluruh isi kotak dialog secara
 * instan. Plugin ini menambahkan efek ketik huruf-per-huruf dengan kecepatan
 * yang bisa diatur pemain lewat menu Options, atau diubah lewat Plugin
 * Command / kode escape khusus di dalam teks.
 *
 * -----------------------------------------------------------------------------
 * MENU OPTIONS
 * -----------------------------------------------------------------------------
 * Jika parameter "Tambahkan ke Options" = true, akan muncul opsi baru di
 * menu Options (mis. "Kecepatan Teks") yang bisa diubah pemain dengan
 * tombol kiri/kanan atau OK, berputar di antara daftar level pada parameter
 * "Daftar Level Kecepatan". Pengaturan ini tersimpan otomatis (seperti BGM
 * Volume) dan tidak terikat pada save file tertentu.
 *
 * Menahan tombol OK/Cancel/klik tetap akan membuat teks langsung tampil
 * penuh (skip), seperti perilaku bawaan RPG Maker MV.
 *
 * -----------------------------------------------------------------------------
 * PLUGIN COMMAND
 * -----------------------------------------------------------------------------
 *   TextSpeed set 0
 *      Mengubah kecepatan teks ke level index ke-0 pada daftar parameter
 *      (index dimulai dari 0).
 *
 *   TextSpeed set Lambat
 *      Mengubah kecepatan teks berdasarkan nama level (harus sama persis
 *      dengan nama pada parameter "Daftar Level Kecepatan").
 *
 * -----------------------------------------------------------------------------
 * KODE ESCAPE DI DALAM TEKS (opsional, per pesan)
 * -----------------------------------------------------------------------------
 *   \SPD[2]
 *      Ditulis di awal (atau di mana saja) dalam satu kotak pesan untuk
 *      memaksa pesan itu memakai level kecepatan index ke-2, terlepas dari
 *      pengaturan Options pemain. Berlaku hanya untuk pesan tsb saja.
 *      Aktif hanya jika parameter "Izinkan Kode \SPD" = true.
 * =============================================================================
 *
 * @param speedLevels
 * @text Daftar Level Kecepatan (JSON)
 * @type text
 * @desc Array {name, delay}. "delay" = jumlah frame jeda antar huruf. delay 0 = instan (bawaan RPG Maker MV).
 * @default [{"name":"Instan","delay":0},{"name":"Sangat Cepat","delay":1},{"name":"Cepat","delay":2},{"name":"Normal","delay":3},{"name":"Lambat","delay":5},{"name":"Sangat Lambat","delay":8}]
 *
 * @param defaultIndex
 * @text Index Default
 * @type number
 * @min 0
 * @desc Index (mulai dari 0) pada Daftar Level Kecepatan yang dipakai sebelum pemain mengubahnya.
 * @default 3
 *
 * @param addToOptions
 * @text Tambahkan ke Options
 * @type boolean
 * @default true
 *
 * @param optionName
 * @text Nama Opsi di Menu Options
 * @type text
 * @default Kecepatan Teks
 *
 * @param allowInlineOverride
 * @text Izinkan Kode \SPD[n]
 * @type boolean
 * @default true
 */

var Imported = Imported || {};
Imported.OMORI_TextSpeed = 1;

(function() {
    "use strict";

    var pluginName = "OMORI_TextSpeed";
    var params = PluginManager.parameters(pluginName);

    function jsonParse(str, fallback) {
        try {
            var v = JSON.parse(str);
            return v === undefined || v === null ? fallback : v;
        } catch (e) {
            return fallback;
        }
    }
    function toBool(v, fallback) {
        if (v === undefined || v === "") return fallback;
        return String(v) === "true";
    }

    var SPEED_LEVELS = jsonParse(params.speedLevels, [
        { name: "Instan", delay: 0 },
        { name: "Sangat Cepat", delay: 1 },
        { name: "Cepat", delay: 2 },
        { name: "Normal", delay: 3 },
        { name: "Lambat", delay: 5 },
        { name: "Sangat Lambat", delay: 8 }
    ]);
    if (!Array.isArray(SPEED_LEVELS) || SPEED_LEVELS.length === 0) {
        SPEED_LEVELS = [{ name: "Normal", delay: 3 }];
    }

    var DEFAULT_INDEX = Number(params.defaultIndex);
    if (isNaN(DEFAULT_INDEX) || DEFAULT_INDEX < 0 || DEFAULT_INDEX >= SPEED_LEVELS.length) {
        DEFAULT_INDEX = 0;
    }
    var ADD_TO_OPTIONS = toBool(params.addToOptions, true);
    var OPTION_NAME = params.optionName || "Kecepatan Teks";
    var ALLOW_INLINE = toBool(params.allowInlineOverride, true);

    function clampIndex(idx) {
        idx = Number(idx);
        if (isNaN(idx)) return DEFAULT_INDEX;
        var len = SPEED_LEVELS.length;
        return ((idx % len) + len) % len;
    }

    function levelByName(name) {
        for (var i = 0; i < SPEED_LEVELS.length; i++) {
            if (SPEED_LEVELS[i].name === name) return i;
        }
        return -1;
    }

    //=========================================================================
    // ConfigManager - simpan preferensi kecepatan teks (global, seperti volume)
    //=========================================================================
    ConfigManager.omoriTextSpeedIndex = DEFAULT_INDEX;

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.call(this);
        config.omoriTextSpeedIndex = this.omoriTextSpeedIndex;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        var value = config.omoriTextSpeedIndex;
        this.omoriTextSpeedIndex = value === undefined ? DEFAULT_INDEX : clampIndex(value);
    };

    //=========================================================================
    // Window_Message - efek ketik dengan jeda per karakter
    //=========================================================================
    var _Window_Message_initMembers = Window_Message.prototype.initMembers;
    Window_Message.prototype.initMembers = function() {
        _Window_Message_initMembers.call(this);
        this._omoriCharWait = 0;
    };

    var _Window_Message_newPage = Window_Message.prototype.newPage;
    Window_Message.prototype.newPage = function(textState) {
        _Window_Message_newPage.call(this, textState);
        this._omoriCharWait = 0;
    };

    var _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        if (ALLOW_INLINE) {
            $gameTemp._omoriSpeedOverrideIndex = null;
        }
        _Window_Message_startMessage.call(this);
        this._omoriCharWait = 0;
    };

    Window_Message.prototype.omoriCurrentDelay = function() {
        var idx;
        if (ALLOW_INLINE && $gameTemp._omoriSpeedOverrideIndex !== null && $gameTemp._omoriSpeedOverrideIndex !== undefined) {
            idx = clampIndex($gameTemp._omoriSpeedOverrideIndex);
        } else {
            idx = clampIndex(ConfigManager.omoriTextSpeedIndex);
        }
        var level = SPEED_LEVELS[idx];
        return level ? Number(level.delay) || 0 : 0;
    };

    Window_Message.prototype.updateMessage = function() {
        if (this._textState) {
            while (!this.isEndOfText(this._textState)) {
                if (this.needsNewPage(this._textState)) {
                    this.newPage(this._textState);
                }
                this.updateShowFast();
                if (!this._showFast) {
                    var delay = this.omoriCurrentDelay();
                    if (delay > 0) {
                        if (this._omoriCharWait > 0) {
                            this._omoriCharWait--;
                            break;
                        }
                        this._omoriCharWait = delay;
                    }
                }
                this.processCharacter(this._textState);
                if (this.pause || this._waitCount > 0) {
                    break;
                }
            }
            this.onEndOfText();
            return true;
        } else {
            return false;
        }
    };

    //=========================================================================
    // Kode escape \SPD[n]
    //=========================================================================
    if (ALLOW_INLINE) {
        var _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
        Window_Base.prototype.convertEscapeCharacters = function(text) {
            text = _Window_Base_convertEscapeCharacters.call(this, text);
            text = text.replace(/\x1bSPD\[(\d+)\]/gi, function(match, p1) {
                $gameTemp._omoriSpeedOverrideIndex = Number(p1);
                return "";
            });
            return text;
        };
    }

    //=========================================================================
    // Menu Options
    //=========================================================================
    if (ADD_TO_OPTIONS) {
        var _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
        Window_Options.prototype.addGeneralOptions = function() {
            _Window_Options_addGeneralOptions.call(this);
            this.addCommand(OPTION_NAME, "omoriTextSpeed");
        };

        var _Window_Options_statusText = Window_Options.prototype.statusText;
        Window_Options.prototype.statusText = function(index) {
            var symbol = this.commandSymbol(index);
            if (symbol === "omoriTextSpeed") {
                var idx = clampIndex(ConfigManager.omoriTextSpeedIndex);
                return SPEED_LEVELS[idx].name;
            }
            return _Window_Options_statusText.call(this, index);
        };

        var _Window_Options_processOk = Window_Options.prototype.processOk;
        Window_Options.prototype.processOk = function() {
            var index = this.index();
            var symbol = this.commandSymbol(index);
            if (symbol === "omoriTextSpeed") {
                this.omoriChangeTextSpeed(1);
                return;
            }
            _Window_Options_processOk.call(this);
        };

        var _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
        Window_Options.prototype.cursorRight = function(wrap) {
            var index = this.index();
            var symbol = this.commandSymbol(index);
            if (symbol === "omoriTextSpeed") {
                this.omoriChangeTextSpeed(1);
                return;
            }
            _Window_Options_cursorRight.call(this, wrap);
        };

        var _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
        Window_Options.prototype.cursorLeft = function(wrap) {
            var index = this.index();
            var symbol = this.commandSymbol(index);
            if (symbol === "omoriTextSpeed") {
                this.omoriChangeTextSpeed(-1);
                return;
            }
            _Window_Options_cursorLeft.call(this, wrap);
        };

        Window_Options.prototype.omoriChangeTextSpeed = function(delta) {
            ConfigManager.omoriTextSpeedIndex = clampIndex(ConfigManager.omoriTextSpeedIndex + delta);
            this.refresh();
            SoundManager.playCursor();
        };
    }

    //=========================================================================
    // Plugin Command
    //=========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === "TextSpeed") {
            if (args[0] === "set") {
                var target = args[1];
                var idx = levelByName(target);
                if (idx < 0) idx = Number(target);
                if (!isNaN(idx)) {
                    ConfigManager.omoriTextSpeedIndex = clampIndex(idx);
                }
            }
        }
    };

})();

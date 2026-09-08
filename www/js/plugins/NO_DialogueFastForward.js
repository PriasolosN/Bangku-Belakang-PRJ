//=============================================================================
// DisableTextFastForward.js
//=============================================================================

/*:
 * @plugindesc (v1.0) Mematikan fitur fast-forward / mempercepat teks dialog saat menekan tombol atau klik.
 * @author Assistant
 *
 * @param DisableSwitchId
 * @text Switch Penonaktif
 * @type switch
 * @desc Jika diisi ID Switch: Switch ON = Fast-forward dilarang. Switch OFF = Normal. Jika diisi 0 = Fast-forward dilarang permanen.
 * @default 0
 *
 * @help
 * ============================================================================
 * Fitur:
 * ============================================================================
 * 1. Memblokir pemain untuk tidak bisa mempercepat jalannya pesan dialog 
 *    (Show Text) dengan menekan dan menahan tombol Enter / Spasi / Klik.
 * 2. Pemain harus menunggu sampai teks selesai diketik di layar sesuai 
 *    kecepatan aslinya.
 * 3. Fitur mempercepat skip ke pesan berikutnya tetap berfungsi secara normal.
 *
 * Cara Penggunaan:
 * - Pasang plugin ini di Plugin Manager RPG Maker MV/MZ.
 * - Jika "Switch Penonaktif" diisi 0, maka fast-forward mati total selamanya.
 * - Jika "Switch Penonaktif" diisi nomor Switch tertentu (misal: Switch 5), 
 *   kamu bisa menyalakan/mematikan fitur blokir ini menggunakan Event.
 */

(function() {
    'use strict';

    var pluginName = 'DisableTextFastForward';
    var parameters = PluginManager.parameters(pluginName);
    var disableSwitchId = Number(parameters['DisableSwitchId'] || 0);

    // Mengecek apakah fast-forward sedang dinonaktifkan
    var isFastForwardDisabled = function() {
        if (disableSwitchId > 0) {
            return $gameSwitches.value(disableSwitchId);
        }
        return true; // Permanen mati jika switch diset 0
    };

    // Override fungsi updateShowFast pada Window_Message
    var _Window_Message_updateShowFast = Window_Message.prototype.updateShowFast;
    Window_Message.prototype.updateShowFast = function() {
        // Jika dilarang, hentikan logic fast-forward dari tombol Confirm/Klik
        if (isFastForwardDisabled()) {
            this._showFast = false;
            return;
        }
        // Jalankan default bawaan RPG Maker jika tidak dilarang
        _Window_Message_updateShowFast.call(this);
    };

})();
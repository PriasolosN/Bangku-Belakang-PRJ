//=============================================================================
// DisableMapTouchMove.js
//=============================================================================

/*:
 * @plugindesc (v1.0) Mematikan pergerakan karakter lewat klik/touch di map, tapi tombol UI dan Menu tetap bisa diklik.
 * @author Assistant
 *
 * @param DisableSwitchId
 * @text Switch Penonaktif
 * @type switch
 * @desc Jika diisi ID Switch: Switch ON = Klik map mati. Switch OFF = Normal. Jika diisi 0 = Klik map mati permanen.
 * @default 0
 *
 * @help
 * ============================================================================
 * Fitur:
 * ============================================================================
 * 1. Mematikan fitur jalan menggunakan mouse / touch pada peta.
 * 2. Tetap mempertahankan fungsi klik untuk UI (Menu, Pilihan Dialog,
 *    dan Tombol Plugin lainnya).
 * 3. BIsa dikontrol menggunakan Switch melalui Plugin Manager.
 *
 * Cara Penggunaan:
 * - Pasang plugin ini di Plugin Manager RPG Maker MV/MZ.
 * - Jika "Switch Penonaktif" diisi 0, maka fitur click-to-move mati total.
 * - Jika "Switch Penonaktif" diisi nomor Switch tertentu (misal: Switch 5), 
 *   kamu bisa menyalakan/mematikan fitur ini saat game berjalan via Eventing.
 */

(function() {
    'use strict';

    var pluginName = 'DisableMapTouchMove';
    var parameters = PluginManager.parameters(pluginName);
    var disableSwitchId = Number(parameters['DisableSwitchId'] || 0);

    // Bypass proses sentuhan/klik khusus pada layar Map
    var _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        if (disableSwitchId > 0) {
            // Jika switch aktif, hentikan fungsi movement map
            if ($gameSwitches.value(disableSwitchId)) {
                return;
            }
        } else {
            // Jika Switch ID diset 0, hentikan fungsi movement map secara permanen
            return;
        }
        _Scene_Map_processMapTouch.call(this);
    };

})();
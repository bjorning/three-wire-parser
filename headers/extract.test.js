const extract = require('./extract');

const headerSample = `
#include "ble_gatt.h"
#include "ble_gattc.h"
#include "ble_gatts.h"

#ifdef __cplusplus
extern "C" {
#endif

/** @addtogroup BLE_COMMON_ENUMERATIONS Enumerations
 * @{ */
/**
 * @brief Common API SVC numbers.
 */
enum BLE_COMMON_SVCS
{
  SD_BLE_ENABLE = BLE_SVC_BASE,         /**< Enable and initialize the BLE stack */
  SD_BLE_EVT_GET,                       /**< Get an event from the pending events queue. */
  SD_BLE_TX_PACKET_COUNT_GET,           /**< Get the total number of available application transmission packets for a particular connection. */
  SD_BLE_UUID_VS_ADD,                   /**< Add a Vendor Specific UUID. */
  SD_BLE_UUID_DECODE,                   /**< Decode UUID bytes. */
  SD_BLE_UUID_ENCODE,                   /**< Encode UUID bytes. */
  SD_BLE_VERSION_GET,                   /**< Get the local version information (company id, Link Layer Version, Link Layer Subversion). */
  SD_BLE_USER_MEM_REPLY,                /**< User Memory Reply. */
  SD_BLE_OPT_SET,                       /**< Set a BLE option. */
  SD_BLE_OPT_GET,                       /**< Get a BLE option. */
};

  /**
   * @brief BLE Module Independent Event IDs.
   */

enum BLE_COMMON_EVTS
{
  BLE_EVT_TX_COMPLETE  = BLE_EVT_BASE,  /**< Transmission Complete. @ref ble_evt_tx_complete_t */
  BLE_EVT_USER_MEM_REQUEST,             /**< User Memory request. @ref ble_evt_user_mem_request_t */
  BLE_EVT_USER_MEM_RELEASE,             /**< User Memory release. @ref ble_evt_user_mem_release_t */
  BLE_EVT_DATA_LENGTH_CHANGED           /**< Link layer PDU length changed. @ref ble_evt_data_length_changed_t. */
};

/**@brief BLE connection bandwidth types.
 * Bandwidth types supported by the SoftDevice. The bandwidth type dictates the maximum number of full length packets per connection interval.
 */
enum BLE_CONN_BWS
{
  BLE_CONN_BW_INVALID = 0,              /**< Invalid connection bandwidth. */
  BLE_CONN_BW_LOW,                      /**< Low connection bandwidth. */
  BLE_CONN_BW_MID,                      /**< Medium connection bandwidth. */
  BLE_CONN_BW_HIGH                      /**< High connection bandwidth. */
};
`;

describe('extract', () => {
    it('gets file as string', async () => {
        const str = await extract.getFileAsString('headers/ble.h');
    });

    it('extracts svcs constants', async () => {
        //specifier = fileName === 'ble' ? 'ble_common' : specifier;  
        const str = await extract.extractSvcsConstants(headerSample, 'ble_common');
        expect(str).toContain('BLE_COMMON_SVCS');
        //console.log(str);
    });

    it('extracts evts constants', async () => {
        const str = await extract.extractEvtsConstants(headerSample, 'ble_common');
        expect(str).toContain('BLE_COMMON_EVTS');
        //console.log(str);
    });

    it('processes headers', async () => {
        const svcsEvts = await extract.processHeaders();
        expect(svcsEvts.length).toEqual(extract.headerFiles.length);
        for (let i = 0; i < svcsEvts.length; i++) {
            expect(svcsEvts[i][0]).toContain(extract.headerFiles[i][1]);
        }
        //console.log(svcsEvts[0][1]);
        //console.log(svcsEvts[1]);
    });

    it.only('merges all constant string to one string', async () => {
        const svcsEvts = await extract.processHeaders();
        const mergedStr = await extract.mergeConstants(svcsEvts);
        console.log(mergedStr);
    })
});
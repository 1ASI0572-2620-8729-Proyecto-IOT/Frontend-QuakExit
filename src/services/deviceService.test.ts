import { beforeEach, describe, expect, it, vi } from 'vitest'

import http from './http'
import { deviceService } from './deviceService'

vi.mock('./http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('../config/env', () => ({
  env: {
    apiUrl: 'http://localhost:8080',
    useMocks: false,
  },
}))

const getMock = vi.mocked(http.get)
const postMock = vi.mocked(http.post)

describe('F02 - Device linking', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('links an unlinked device to the authenticated resident', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        id: 12,
        deviceCode: 'QX-101',
        macAddress: 'AA:BB:CC:DD:EE:FF',
        alias: 'Puerta principal',
        status: 'ONLINE',
        lockStatus: 'LOCKED',
        lightStatus: 'OFF',
        sirenStatus: 'OFF',
        lastSeenAt: '2026-10-08T19:00:00Z',
        batteryPercentage: 95,
        powerMode: 'NORMAL',
      },
    } as never)

    const result = await deviceService.bind({
      deviceCode: 'QX-101',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      alias: 'Puerta principal',
    })

    expect(postMock).toHaveBeenCalledWith('/api/v1/devices/bind', {
      deviceCode: 'QX-101',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      alias: 'Puerta principal',
    })
    expect(result).toMatchObject({
      id: '12',
      deviceCode: 'QX-101',
      alias: 'Puerta principal',
      battery: 95,
      lastSeen: '2026-10-08T19:00:00Z',
    })
  })

  it('propagates a conflict when the device is already linked', async () => {
    const conflict = new Error('El dispositivo ya está vinculado')
    postMock.mockRejectedValueOnce(conflict)

    await expect(deviceService.bind({
      deviceCode: 'QX-101',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      alias: 'Puerta principal',
    })).rejects.toBe(conflict)
  })
})

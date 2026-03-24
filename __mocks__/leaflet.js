module.exports = {
  map: jest.fn(() => ({
    setView: jest.fn(),
    remove: jest.fn(),
    addLayer: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
  marker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
  divIcon: jest.fn(),
  latLngBounds: jest.fn(() => ({ extend: jest.fn() })),
  control: { zoom: jest.fn(() => ({ addTo: jest.fn() })) },
  Icon: { Default: { prototype: {}, mergeOptions: jest.fn() } },
};
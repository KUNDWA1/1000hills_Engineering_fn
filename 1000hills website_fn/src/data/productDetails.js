export const productDetails = {
  // ── CONSTRUCTION TOOLS ──
  1: {
    partNumber: 'BIT-DIA-102',
    warranty: '6 months',
    b2bPrice: 38000,
    stock: 23,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
    ],
    specs: [
      { label: 'Length', value: '450mm' },
      { label: 'Diameter', value: '102mm' },
      { label: 'Material', value: 'Diamond-tipped' },
      { label: 'Shank', value: 'SDS-Max' },
    ],
  },
  2: {
    partNumber: 'DWL-RHD-800',
    warranty: '12 months',
    b2bPrice: 310000,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    ],
    specs: [
      { label: 'Power', value: '800W' },
      { label: 'Chuck', value: 'SDS-Plus' },
      { label: 'Modes', value: '3 (drill, hammer drill, chisel)' },
      { label: 'Weight', value: '3.5kg' },
    ],
  },
  3: {
    partNumber: 'EXC-TRK-LNK',
    warranty: '6 months',
    b2bPrice: 160000,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    specs: [
      { label: 'Material', value: 'Hardened steel' },
      { label: 'Compatibility', value: 'CAT, Komatsu, Hitachi' },
      { label: 'Links per set', value: '48' },
    ],
  },
  4: {
    partNumber: 'HYD-PMP-EXC',
    warranty: '12 months',
    b2bPrice: 780000,
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80',
    ],
    specs: [
      { label: 'Type', value: 'Axial piston pump' },
      { label: 'Pressure', value: '350 bar max' },
      { label: 'Compatibility', value: 'CAT, Komatsu, Hitachi' },
      { label: 'Flow rate', value: '120 L/min' },
    ],
  },
  5: {
    partNumber: 'BSH-AG-230',
    warranty: '12 months',
    b2bPrice: 108000,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
    ],
    specs: [
      { label: 'Power', value: '2200W' },
      { label: 'Disc Size', value: '230mm' },
      { label: 'No-load Speed', value: '6500 rpm' },
      { label: 'Weight', value: '5.2kg' },
    ],
  },
  6: {
    partNumber: 'CAT-BPB-KIT',
    warranty: '6 months',
    b2bPrice: 285000,
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    specs: [
      { label: 'Material', value: 'Hardox steel' },
      { label: 'Compatibility', value: 'CAT 320–330 series' },
      { label: 'Kit includes', value: 'Pins, bushings, seals' },
    ],
  },

  // ── GENERATORS & POWER ──
  101: {
    partNumber: 'HON-GEN-5KVA',
    warranty: '24 months',
    b2bPrice: 1050000,
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    ],
    specs: [
      { label: 'Rated Power', value: '5 KVA' },
      { label: 'Fuel Type', value: 'Petrol' },
      { label: 'Noise Level', value: '58 dB' },
      { label: 'Runtime', value: '8hrs at 50% load' },
      { label: 'Outlets', value: '2x 230V + 1x 12V DC' },
    ],
  },
  102: {
    partNumber: 'PKN-GEN-20KVA',
    warranty: '24 months',
    b2bPrice: 3900000,
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
    ],
    specs: [
      { label: 'Rated Power', value: '20 KVA' },
      { label: 'Phase', value: 'Three-phase' },
      { label: 'Fuel Type', value: 'Diesel' },
      { label: 'Engine', value: 'Turbocharged Perkins' },
      { label: 'Start', value: 'Auto-start with panel' },
    ],
  },
  103: {
    partNumber: 'KPR-GEN-3KVA',
    warranty: '12 months',
    b2bPrice: 590000,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1560264280-88b68371db39?w=800&q=80',
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
    ],
    specs: [
      { label: 'Rated Power', value: '3 KVA' },
      { label: 'Fuel Type', value: 'Petrol' },
      { label: 'Weight', value: '38kg' },
      { label: 'Runtime', value: '10hrs at 50% load' },
      { label: 'Outlets', value: '2x 230V' },
    ],
  },
  104: {
    partNumber: 'CUM-GEN-50KVA',
    warranty: '36 months',
    b2bPrice: 10500000,
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    ],
    specs: [
      { label: 'Rated Power', value: '50 KVA' },
      { label: 'Phase', value: 'Three-phase' },
      { label: 'Fuel Type', value: 'Diesel' },
      { label: 'Enclosure', value: 'Weatherproof canopy' },
      { label: 'Monitoring', value: 'Remote monitoring included' },
      { label: 'ATS', value: 'Included' },
    ],
  },

  // ── SECURITY & IT ──
  201: {
    partNumber: 'HKV-CAM-4MP',
    warranty: '24 months',
    b2bPrice: 72000,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    ],
    specs: [
      { label: 'Resolution', value: '4MP (2688×1520)' },
      { label: 'Night Vision', value: 'IR up to 30m' },
      { label: 'Compression', value: 'H.265+' },
      { label: 'IP Rating', value: 'IP67' },
      { label: 'Lens', value: '2.8mm fixed' },
    ],
  },
  202: {
    partNumber: 'DAH-NVR-8CH',
    warranty: '24 months',
    b2bPrice: 390000,
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
    ],
    specs: [
      { label: 'Channels', value: '8' },
      { label: 'PoE Ports', value: '8x PoE' },
      { label: 'Max Resolution', value: '8MP' },
      { label: 'HDD Bays', value: '2x (up to 8TB each)' },
      { label: 'Output', value: 'HDMI + VGA' },
    ],
  },
  203: {
    partNumber: 'ZKT-BIO-ACC',
    warranty: '12 months',
    b2bPrice: 240000,
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    ],
    specs: [
      { label: 'Authentication', value: 'Fingerprint + RFID' },
      { label: 'User Capacity', value: '3000' },
      { label: 'Interface', value: 'TCP/IP, RS485' },
      { label: 'Output', value: 'Wiegand 26/34' },
      { label: 'Power', value: '12V DC' },
    ],
  },
  204: {
    partNumber: 'TPL-AP-OUT',
    warranty: '12 months',
    b2bPrice: 80000,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
    ],
    specs: [
      { label: 'Speed', value: '300Mbps' },
      { label: 'Range', value: 'Up to 500m' },
      { label: 'IP Rating', value: 'IP67' },
      { label: 'Power', value: 'Passive PoE' },
      { label: 'Frequency', value: '2.4GHz' },
    ],
  },

  // ── SOLAR & ENERGY ──
  301: {
    partNumber: 'JNK-PNL-400W',
    warranty: '25 years performance / 10 years product',
    b2bPrice: 150000,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&q=80',
    ],
    specs: [
      { label: 'Power', value: '400W' },
      { label: 'Type', value: 'Monocrystalline' },
      { label: 'Efficiency', value: '21.3%' },
      { label: 'Dimensions', value: '1722×1134×30mm' },
      { label: 'Weight', value: '20.5kg' },
    ],
  },
  302: {
    partNumber: 'VCT-INV-5KVA',
    warranty: '24 months',
    b2bPrice: 1620000,
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&q=80',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    ],
    specs: [
      { label: 'Power', value: '5000VA / 4000W' },
      { label: 'Voltage', value: '48V DC' },
      { label: 'MPPT', value: 'Built-in 70A' },
      { label: 'Input Voltage', value: '230V AC' },
      { label: 'Efficiency', value: '96%' },
    ],
  },
  303: {
    partNumber: 'PLT-BAT-48V',
    warranty: '24 months',
    b2bPrice: 1950000,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&q=80',
    ],
    specs: [
      { label: 'Voltage', value: '48V' },
      { label: 'Capacity', value: '100Ah / 4.8kWh' },
      { label: 'Chemistry', value: 'LFP (LiFePO4)' },
      { label: 'Cycle Life', value: '6000+ cycles' },
      { label: 'BMS', value: 'Integrated' },
    ],
  },
  304: {
    partNumber: 'EPV-MPPT-60A',
    warranty: '12 months',
    b2bPrice: 125000,
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
    ],
    specs: [
      { label: 'Current', value: '60A' },
      { label: 'Voltage', value: '12/24/36/48V auto' },
      { label: 'Max PV Input', value: '150V' },
      { label: 'Communication', value: 'RS485' },
      { label: 'Display', value: 'LCD' },
    ],
  },
};
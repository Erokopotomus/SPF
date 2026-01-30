// SYP Analytics - SPF/Spruce Trading Module
// Handles reload inventory, transit inventory, offers, and two-leg freight calculations

// ==================== RELOAD INVENTORY CRUD ====================

async function addReloadReceipt(data) {
  const receipt = {
    id: genId(),
    // Inbound info
    carNumber: data.carNumber || null,
    poNumber: data.poNumber || '',
    poDate: data.poDate || today(),
    mill: data.mill || '',
    millCity: data.millCity || '',
    millState: data.millState || '',
    
    // Product info
    product: data.product || '2x4',
    length: data.length || '12',
    grade: data.grade || '#2',
    origin: data.origin || 'NORTH', // NORTH = Canada, SOUTH = US
    
    // Volume & cost
    units: parseFloat(data.units) || 0,
    costOTG: parseFloat(data.costOTG) || 0, // Cost per MBF at reload
    remaining: parseFloat(data.units) || 0, // Starts same as units
    
    // Transport
    transportType: data.transportType || 'rail', // rail, truck, triaxle, btrain, tandem
    inboundFreight: parseFloat(data.inboundFreight) || 0,
    
    // Status & dates
    status: data.status || 'in_transit', // in_transit, unloaded, shipped
    dateOTG: data.dateOTG || null, // Date arrived at reload
    
    // Tracking
    trader: S.trader,
    reloadFacility: S.reloadFacility?.id || 1,
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };
  
  S.reloadInventory.unshift(receipt);
  await saveAllLocal();
  showToast('Receipt added', 'success');
  render();
  return receipt;
}

async function updateReloadReceipt(id, updates) {
  const idx = S.reloadInventory.findIndex(r => r.id === id);
  if (idx < 0) return;
  
  S.reloadInventory[idx] = { ...S.reloadInventory[idx], ...updates };
  await saveAllLocal();
  render();
}

async function markReceiptArrived(id) {
  await updateReloadReceipt(id, {
    status: 'unloaded',
    dateOTG: today()
  });
  showToast('Marked as arrived at reload', 'success');
}

async function deleteReloadReceipt(id) {
  if (!confirm('Delete this receipt?')) return;
  S.reloadInventory = S.reloadInventory.filter(r => r.id !== id);
  await saveAllLocal();
  showToast('Receipt deleted', 'info');
  render();
}

// Ship units from a receipt (reduces remaining)
async function shipFromReceipt(receiptId, units, outboundData) {
  const receipt = S.reloadInventory.find(r => r.id === receiptId);
  if (!receipt) return;
  
  if (units > receipt.remaining) {
    alert('Cannot ship more than remaining units');
    return;
  }
  
  // Reduce remaining
  receipt.remaining -= units;
  
  // Track outbound shipment
  const outbound = {
    id: genId(),
    receiptId: receiptId,
    date: outboundData.date || today(),
    units: units,
    bpNumber: outboundData.bpNumber || '',
    ocNumber: outboundData.ocNumber || '',
    customer: outboundData.customer || '',
    destination: outboundData.destination || '',
    destState: outboundData.destState || '',
    miles: outboundData.miles || 0,
    freight: outboundData.freight || 0,
    sellPrice: outboundData.sellPrice || 0,
    trader: outboundData.trader || S.trader,
    createdAt: new Date().toISOString()
  };
  
  S.outboundTrucks.unshift(outbound);
  
  // Update receipt status if fully shipped
  if (receipt.remaining <= 0) {
    receipt.status = 'shipped';
  }
  
  await saveAllLocal();
  showToast(`Shipped ${units} units`, 'success');
  render();
  return outbound;
}

// ==================== TRANSIT INVENTORY ====================

async function addToTransit(data) {
  const item = {
    id: genId(),
    orderNum: data.orderNum || '',
    sfx: data.sfx || 0,
    dept: data.dept || 'E. Canadian',
    
    // Transport & status
    trans: data.trans || 'truck', // 'rail' or 'truck'
    sold: false,
    seller: null,
    hidden: data.hidden || false,
    
    // Pricing
    price: parseFloat(data.price) || 0, // Your cost
    askPrice: parseFloat(data.askPrice) || 0, // Offer price
    askNote: data.askNote || '',
    adderList: data.adderList || '', // Freight adders
    
    // Product
    descHeader: data.descHeader || '',
    descDetail: data.descDetail || '',
    product: data.product || '',
    length: data.length || '',
    grade: data.grade || '',
    origin: data.origin || 'NORTH',
    
    // Source
    name: data.name || '', // Mill or reload name
    originCity: data.originCity || '',
    originState: data.originState || '',
    
    // Routing
    routing: data.routing || 'BP TRUCK',
    shipDueDate: data.shipDueDate || '',
    targetMarket: data.targetMarket || '',
    
    // Tracking
    buyerName: S.trader,
    trader: S.trader,
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };
  
  S.transitInventory.unshift(item);
  await saveAllLocal();
  showToast('Added to transit inventory', 'success');
  render();
  return item;
}

async function updateTransitItem(id, updates) {
  const idx = S.transitInventory.findIndex(t => t.id === id);
  if (idx < 0) return;
  
  S.transitInventory[idx] = { ...S.transitInventory[idx], ...updates };
  await saveAllLocal();
  render();
}

async function markTransitSold(id, sellerName) {
  await updateTransitItem(id, {
    sold: true,
    seller: sellerName || 'Floor'
  });
  showToast('Marked as sold', 'success');
}

async function toggleTransitHidden(id) {
  const item = S.transitInventory.find(t => t.id === id);
  if (!item) return;
  
  await updateTransitItem(id, { hidden: !item.hidden });
  showToast(item.hidden ? 'Now visible to floor' : 'Hidden from floor', 'info');
}

// ==================== OFFERS ====================

async function createOffer(data) {
  const offer = {
    id: genId(),
    
    // What's being offered
    skuKey: data.skuKey || '', // product|length|grade|origin
    product: data.product || '',
    length: data.length || '',
    grade: data.grade || '',
    origin: data.origin || 'NORTH',
    
    // Pricing
    askPrice: parseFloat(data.askPrice) || 0,
    costBasis: parseFloat(data.costBasis) || 0,
    targetMargin: parseFloat(data.targetMargin) || 0,
    
    // Availability
    availableTLs: data.availableTLs || '0x',
    availableUnits: parseFloat(data.availableUnits) || 0,
    
    // Details
    shipNotes: data.shipNotes || '',
    freightAdder: data.freightAdder || '',
    targetCustomers: data.targetCustomers || [], // Empty = entire floor
    internalNotes: data.internalNotes || '',
    
    // Status
    status: 'active', // active, paused, closed
    hidden: false,
    
    // Tracking
    trader: S.trader,
    createdAt: new Date().toISOString()
  };
  
  S.activeOffers.unshift(offer);
  await saveAllLocal();
  showToast('Offer published', 'success');
  render();
  return offer;
}

async function updateOffer(id, updates) {
  const idx = S.activeOffers.findIndex(o => o.id === id);
  if (idx < 0) return;
  
  S.activeOffers[idx] = { ...S.activeOffers[idx], ...updates };
  await saveAllLocal();
  render();
}

async function closeOffer(id, reason) {
  const offer = S.activeOffers.find(o => o.id === id);
  if (!offer) return;
  
  // Move to history
  S.offerHistory.unshift({
    ...offer,
    closedAt: new Date().toISOString(),
    closeReason: reason || 'closed'
  });
  
  // Remove from active
  S.activeOffers = S.activeOffers.filter(o => o.id !== id);
  
  await saveAllLocal();
  showToast('Offer closed', 'info');
  render();
}

// ==================== CUSTOMER OFFER (Customer → Products) ====================

async function createCustomerOffer(customerId, products, locationId) {
  const customer = S.customers.find(c => c.id === customerId);
  if (!customer) return;
  
  const location = customer.locations?.find(l => l.id === locationId) || customer.locations?.[0];
  
  const offer = {
    id: genId(),
    type: 'customer_offer',
    
    // Customer
    customerId: customerId,
    customerName: customer.name,
    locationId: locationId,
    locationName: location?.name || '',
    destination: location?.address || customer.destination || '',
    
    // Products offered
    products: products.map(p => ({
      productId: p.id,
      product: p.product,
      length: p.length,
      grade: p.grade,
      origin: p.origin,
      costBasis: p.avgCost || p.costBasis,
      offerPrice: p.offerPrice,
      margin: p.offerPrice - (p.avgCost || p.costBasis),
      availableUnits: p.availableUnits || p.totalRemaining,
      freightAdder: p.freightAdder || 0
    })),
    
    // Freight
    miles: location?.miles || 0,
    freightRate: location?.freightRate || 2.00,
    estFreightPerMBF: location ? Math.round((location.miles * location.freightRate) / 28) : 0,
    
    // Status
    status: 'pending', // pending, accepted, declined, expired
    
    // Tracking
    trader: S.trader,
    notes: '',
    createdAt: new Date().toISOString()
  };
  
  S.offerHistory.unshift(offer);
  await saveAllLocal();
  showToast(`Offer created for ${customer.name}`, 'success');
  return offer;
}

// ==================== ANALYTICS ====================

function getReloadStats() {
  const skus = groupReloadBySKU();
  const receipts = S.reloadInventory.filter(r => r.status === 'unloaded');
  
  const totalRemaining = receipts.reduce((s, r) => s + (r.remaining || 0), 0);
  const totalValue = receipts.reduce((s, r) => s + ((r.remaining || 0) * (r.costOTG || 0)), 0);
  
  // Calculate days OTG for each receipt
  const withDays = receipts.filter(r => r.remaining > 0).map(r => ({
    ...r,
    daysOTG: calcDaysOTG(r.dateOTG)
  }));
  
  const avgDaysOTG = withDays.length > 0 
    ? Math.round(withDays.reduce((s, r) => s + r.daysOTG, 0) / withDays.length)
    : 0;
  
  // Interest calculation
  const totalInterest = withDays.reduce((s, r) => {
    return s + calcInterest(r.remaining * r.costOTG, r.daysOTG);
  }, 0);
  
  // Count by transport type
  const inTransitRail = S.reloadInventory.filter(r => r.status === 'in_transit' && r.transportType === 'rail').length;
  const inTransitTruck = S.reloadInventory.filter(r => r.status === 'in_transit' && r.transportType !== 'rail').length;
  
  return {
    totalRemaining,
    totalValue,
    otgTrucks: (totalRemaining / (S.spfMBFperTL || 28)).toFixed(1),
    avgDaysOTG,
    totalInterest: Math.round(totalInterest),
    skuCount: Object.keys(skus).length,
    receiptCount: receipts.length,
    inTransitRail,
    inTransitTruck,
    skus
  };
}

function getMarginStats(period = '30d') {
  // Filter sells by period
  const now = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
  
  const periodSells = S.sells.filter(s => new Date(s.date) >= cutoff);
  const periodBuys = S.buys.filter(b => new Date(b.date) >= cutoff);
  
  // Calculate totals
  const buyTotal = periodBuys.reduce((s, b) => s + ((b.price || 0) * (b.volume || 0)), 0);
  const sellTotal = periodSells.reduce((s, s_) => s + ((s_.price || 0) * (s_.volume || 0)), 0);
  const grossMargin = sellTotal - buyTotal;
  
  // Estimate commission
  const estCommission = calcCommission(grossMargin);
  
  // Calculate comp basis (your share based on order types)
  let compBasis = 0;
  periodSells.forEach(sell => {
    const orderType = ORDER_TYPES[sell.orderType] || ORDER_TYPES.TRANSIT;
    const margin = (sell.price - (sell.buyPrice || 0)) * (sell.volume || 0);
    
    // If you're the seller, you get sell split
    if (sell.trader === S.trader) {
      compBasis += margin * orderType.sellSplit;
    }
    // If you're the buyer (linked PO), you get buy split
    const linkedBuy = S.buys.find(b => b.orderNum === sell.linkedPO);
    if (linkedBuy && linkedBuy.trader === S.trader) {
      compBasis += margin * orderType.buySplit;
    }
  });
  
  return {
    buyTotal,
    sellTotal,
    grossMargin,
    compBasis: Math.round(compBasis),
    estCommission: Math.round(estCommission),
    sellCount: periodSells.length,
    buyCount: periodBuys.length
  };
}

// ==================== SPF BUY MODAL ENHANCEMENTS ====================

function getSPFBuyFields() {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Transport Type</label>
        <select id="m-transportType" onchange="updateSPFBuyForm()">
          <option value="rail">🚂 Rail Car</option>
          <option value="truck">🚛 Truck (~28 MBF)</option>
          <option value="triaxle">🚛 Tri-Axle (~37 MBF)</option>
          <option value="btrain">🚛 B-Train (~48 MBF)</option>
          <option value="tandem">🚛 Tandem (~28 MBF)</option>
        </select>
      </div>
      <div class="form-group" id="car-number-group">
        <label class="form-label">Car/Truck #</label>
        <input type="text" id="m-carNumber" placeholder="e.g., IANR 624503">
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Origin</label>
        <select id="m-spfOrigin">
          <option value="NORTH">🍁 NORTH (Canada)</option>
          <option value="SOUTH">🇺🇸 SOUTH (US)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Delivery Point</label>
        <select id="m-deliveryPoint">
          <option value="reload">To Reload (${S.reloadFacility?.shortName || 'GBT'})</option>
          <option value="direct">Direct to Customer</option>
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Mill Freight Rate</label>
        <input type="number" id="m-millFreight" step="0.01" placeholder="Mill's predefined rate">
        <div style="color:var(--muted);font-size:10px;margin-top:2px">Set by mill, not negotiable</div>
      </div>
      <div class="form-group">
        <label class="form-label">ETA to Reload</label>
        <input type="date" id="m-etaReload">
      </div>
    </div>
  `;
}

// ==================== SPF SELL MODAL ENHANCEMENTS ====================

function getSPFSellFields() {
  // Get available reload inventory for linking
  const reloadOptions = S.reloadInventory
    .filter(r => r.status === 'unloaded' && r.remaining > 0)
    .map(r => `<option value="${r.id}">${r.carNumber || r.poNumber} | ${r.product} ${r.length} ${r.grade} | ${r.remaining} units @ $${r.costOTG}</option>`)
    .join('');
  
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Ship From</label>
        <select id="m-shipFrom" onchange="updateSPFSellForm()">
          <option value="reload">📦 ${S.reloadFacility?.name || 'Reload'}</option>
          <option value="direct">🏭 Direct from Mill</option>
        </select>
      </div>
      <div class="form-group" id="reload-link-group">
        <label class="form-label">Link to Reload Receipt</label>
        <select id="m-reloadReceipt">
          <option value="">— Select Receipt —</option>
          ${reloadOptions}
        </select>
      </div>
    </div>
    
    <div class="form-row" id="outbound-freight-group">
      <div class="form-group">
        <label class="form-label">Miles from Reload</label>
        <input type="number" id="m-milesFromReload" oninput="calcOutboundFreightField()">
      </div>
      <div class="form-group">
        <label class="form-label">Dest State</label>
        <select id="m-destState" onchange="calcOutboundFreightField()">
          ${Object.keys(SPF_OUTBOUND_RATES).map(st => `<option value="${st}">${st}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Freight $/Load</label>
        <input type="number" id="m-outboundFreight" step="1">
        <div style="color:var(--muted);font-size:10px;margin-top:2px">You control outbound</div>
      </div>
    </div>
  `;
}

function calcOutboundFreightField() {
  const destState = document.getElementById('m-destState')?.value;
  const miles = parseFloat(document.getElementById('m-milesFromReload')?.value) || 0;
  
  if (destState && miles > 0) {
    const freight = calcOutboundFreight(destState, miles, S.spfMBFperTL);
    document.getElementById('m-outboundFreight').value = Math.round(freight);
  }
}

function updateSPFBuyForm() {
  const transportType = document.getElementById('m-transportType')?.value;
  const carNumLabel = document.querySelector('#car-number-group label');
  if (carNumLabel) {
    carNumLabel.textContent = transportType === 'rail' ? 'Car #' : 'Truck #';
  }
}

function updateSPFSellForm() {
  const shipFrom = document.getElementById('m-shipFrom')?.value;
  const reloadGroup = document.getElementById('reload-link-group');
  const freightGroup = document.getElementById('outbound-freight-group');
  
  if (reloadGroup) {
    reloadGroup.style.display = shipFrom === 'reload' ? 'block' : 'none';
  }
  if (freightGroup) {
    freightGroup.style.display = shipFrom === 'reload' ? 'flex' : 'none';
  }
}

// ==================== MODALS ====================

function showReloadReceiptModal(existing = null) {
  const isEdit = !!existing;
  const mills = getMills();
  
  document.getElementById('modal').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal modal-lg" onclick="event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">${isEdit ? 'Edit' : 'Add'} Reload Receipt</span>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">PO #</label>
              <input type="text" id="m-poNumber" value="${existing?.poNumber || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">PO Date</label>
              <input type="date" id="m-poDate" value="${existing?.poDate || today()}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mill</label>
              <select id="m-mill">
                <option value="">— Select Mill —</option>
                ${mills.map(m => `<option value="${m}" ${existing?.mill === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Transport Type</label>
              <select id="m-transportType">
                ${Object.entries(TRANSPORT_TYPES).map(([k, v]) => 
                  `<option value="${k}" ${existing?.transportType === k ? 'selected' : ''}>${v.icon} ${v.label} (~${v.avgMBF} MBF)</option>`
                ).join('')}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Car/Truck #</label>
              <input type="text" id="m-carNumber" value="${existing?.carNumber || ''}" placeholder="e.g., IANR 624503">
            </div>
            <div class="form-group">
              <label class="form-label">Origin</label>
              <select id="m-spfOrigin">
                <option value="NORTH" ${existing?.origin === 'NORTH' ? 'selected' : ''}>🍁 NORTH (Canada)</option>
                <option value="SOUTH" ${existing?.origin === 'SOUTH' ? 'selected' : ''}>🇺🇸 SOUTH (US)</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Product</label>
              <select id="m-product">
                <option value="2x4">2x4</option>
                <option value="2x6">2x6</option>
                <option value="2x8">2x8</option>
                <option value="2x10">2x10</option>
                <option value="2x12">2x12</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Length/Trim</label>
              <select id="m-length">
                ${SPF_LENGTHS.map(l => `<option value="${l}" ${existing?.length === l ? 'selected' : ''}>${l}${l.includes('-') ? '"' : l === 'R/L' ? '' : "'"}</option>`).join('')}
                ${SPF_STUD_TRIMS.map(t => `<option value="${t}" ${existing?.length === t ? 'selected' : ''}>${t}"</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Grade</label>
              <select id="m-grade">
                <option value="#2">#2</option>
                <option value="#2 & BTR">#2 & BTR</option>
                <option value="Premium">Premium</option>
                <option value="Stud">Stud</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Units (MBF)</label>
              <input type="number" id="m-units" value="${existing?.units || ''}" step="1">
            </div>
            <div class="form-group">
              <label class="form-label">Cost OTG ($/MBF)</label>
              <input type="number" id="m-costOTG" value="${existing?.costOTG || ''}" step="1">
            </div>
            <div class="form-group">
              <label class="form-label">Inbound Freight ($)</label>
              <input type="number" id="m-inboundFreight" value="${existing?.inboundFreight || ''}" step="1">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="m-status">
                <option value="in_transit" ${existing?.status === 'in_transit' ? 'selected' : ''}>🚛 In Transit</option>
                <option value="unloaded" ${existing?.status === 'unloaded' ? 'selected' : ''}>📦 At Reload (Unloaded)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date OTG</label>
              <input type="date" id="m-dateOTG" value="${existing?.dateOTG || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="m-notes" rows="2">${existing?.notes || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" onclick="closeModal()">Cancel</button>
          <button class="btn btn-success" onclick="saveReloadReceipt(${existing?.id || 'null'})">${isEdit ? 'Update' : 'Add'} Receipt</button>
        </div>
      </div>
    </div>
  `;
}

async function saveReloadReceipt(existingId) {
  const data = {
    poNumber: document.getElementById('m-poNumber').value,
    poDate: document.getElementById('m-poDate').value,
    mill: document.getElementById('m-mill').value,
    transportType: document.getElementById('m-transportType').value,
    carNumber: document.getElementById('m-carNumber').value,
    origin: document.getElementById('m-spfOrigin').value,
    product: document.getElementById('m-product').value,
    length: document.getElementById('m-length').value,
    grade: document.getElementById('m-grade').value,
    units: document.getElementById('m-units').value,
    costOTG: document.getElementById('m-costOTG').value,
    inboundFreight: document.getElementById('m-inboundFreight').value,
    status: document.getElementById('m-status').value,
    dateOTG: document.getElementById('m-dateOTG').value,
    notes: document.getElementById('m-notes').value
  };
  
  if (!data.units || !data.costOTG) {
    alert('Units and Cost OTG are required');
    return;
  }
  
  if (existingId) {
    await updateReloadReceipt(existingId, data);
  } else {
    await addReloadReceipt(data);
  }
  
  closeModal();
}

function showTransitPricingModal(item) {
  if (!item) return;
  
  document.getElementById('modal').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal modal-lg" onclick="event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Transit Pricing</span>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="background:var(--panel-alt);border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:16px">
            <div style="font-weight:600;margin-bottom:8px">${item.descHeader} ${item.descDetail}</div>
            <div style="font-size:12px;color:var(--muted)">
              Order: ${item.orderNum} | Mill: ${item.name} | Cost: ${fmt(item.price)}
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ask Price ($/MBF)</label>
              <input type="number" id="m-askPrice" value="${item.askPrice || ''}" step="1">
            </div>
            <div class="form-group">
              <label class="form-label">Target Margin</label>
              <input type="number" id="m-targetMargin" value="${(item.askPrice || 0) - (item.price || 0)}" readonly style="background:var(--panel-alt)">
            </div>
            <div class="form-group" style="display:flex;align-items:center;padding-top:24px">
              <label><input type="checkbox" id="m-hidden" ${item.hidden ? 'checked' : ''}> Hidden from floor</label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Comment</label>
            <input type="text" id="m-askNote" value="${item.askNote || ''}" placeholder="Notes for floor">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Target Market</label>
              <input type="text" id="m-targetMarket" value="${item.targetMarket || ''}" placeholder="e.g., Southeast, New England">
            </div>
            <div class="form-group">
              <label class="form-label">Freight Adders</label>
              <input type="text" id="m-adderList" value="${item.adderList || ''}" placeholder="e.g., +$25 to FL">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Inventory Notes</label>
            <textarea id="m-notes" rows="3">${item.notes || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" onclick="closeModal()">Cancel</button>
          <button class="btn btn-success" onclick="saveTransitPricing(${item.id})">Save</button>
        </div>
      </div>
    </div>
  `;
  
  // Update margin when price changes
  document.getElementById('m-askPrice').addEventListener('input', function() {
    const askPrice = parseFloat(this.value) || 0;
    const cost = item.price || 0;
    document.getElementById('m-targetMargin').value = askPrice - cost;
  });
}

async function saveTransitPricing(id) {
  const updates = {
    askPrice: parseFloat(document.getElementById('m-askPrice').value) || 0,
    hidden: document.getElementById('m-hidden').checked,
    askNote: document.getElementById('m-askNote').value,
    targetMarket: document.getElementById('m-targetMarket').value,
    adderList: document.getElementById('m-adderList').value,
    notes: document.getElementById('m-notes').value
  };
  
  await updateTransitItem(id, updates);
  closeModal();
}

function showOfferBuilderModal(sku) {
  if (!sku) return;
  
  const margin = 50; // Default margin
  const askPrice = (sku.avgCost || 0) + margin;
  
  document.getElementById('modal').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal modal-lg" onclick="event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title positive">Create Offer</span>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div style="background:var(--positive);color:#000;padding:12px;border-radius:4px;margin-bottom:16px">
            <div style="font-weight:600">${sku.product} ${sku.length} ${sku.grade} — ${sku.origin}</div>
            <div style="font-size:12px">Available: ${sku.totalRemaining} units (${sku.otgTrucks} TLs) | Avg Cost: ${fmt(sku.avgCost)}</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Offer Price ($/MBF)</label>
              <input type="number" id="m-askPrice" value="${askPrice}" step="1" oninput="updateOfferMargin(${sku.avgCost})">
            </div>
            <div class="form-group">
              <label class="form-label">Margin ($/MBF)</label>
              <input type="number" id="m-margin" value="${margin}" step="1" oninput="updateOfferPrice(${sku.avgCost})">
            </div>
            <div class="form-group">
              <label class="form-label">Available (TLs)</label>
              <input type="text" id="m-availableTLs" value="${Math.floor(sku.totalRemaining / 28)}x">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ship Time Notes</label>
              <input type="text" id="m-shipNotes" placeholder="e.g., Immediate, 3-5 days">
            </div>
            <div class="form-group">
              <label class="form-label">Freight Adder</label>
              <input type="text" id="m-freightAdder" placeholder="e.g., +$25 to FL">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Internal Notes (not visible to floor)</label>
            <textarea id="m-internalNotes" rows="2"></textarea>
          </div>
          
          <div style="background:var(--panel-alt);border:1px solid var(--border);border-radius:4px;padding:12px;margin-top:16px">
            <div style="font-weight:600;margin-bottom:8px">Offer Preview</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;font-size:12px">
              <div><span style="color:var(--muted)">Product:</span> ${sku.product} ${sku.length}</div>
              <div><span style="color:var(--muted)">Price:</span> <span id="preview-price">${fmt(askPrice)}</span></div>
              <div><span style="color:var(--muted)">Available:</span> <span id="preview-avail">${Math.floor(sku.totalRemaining / 28)}x</span></div>
              <div><span style="color:var(--muted)">Margin:</span> <span id="preview-margin" style="color:var(--positive)">${fmt(margin)}</span></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" onclick="closeModal()">Cancel</button>
          <button class="btn btn-success" onclick="publishOffer('${sku.product}|${sku.length}|${sku.grade}|${sku.origin}', ${sku.avgCost}, ${sku.totalRemaining})">🚀 Publish Offer</button>
        </div>
      </div>
    </div>
  `;
}

function updateOfferMargin(avgCost) {
  const askPrice = parseFloat(document.getElementById('m-askPrice').value) || 0;
  const margin = askPrice - avgCost;
  document.getElementById('m-margin').value = margin;
  document.getElementById('preview-price').textContent = fmt(askPrice);
  document.getElementById('preview-margin').textContent = fmt(margin);
}

function updateOfferPrice(avgCost) {
  const margin = parseFloat(document.getElementById('m-margin').value) || 0;
  const askPrice = avgCost + margin;
  document.getElementById('m-askPrice').value = askPrice;
  document.getElementById('preview-price').textContent = fmt(askPrice);
  document.getElementById('preview-margin').textContent = fmt(margin);
}

async function publishOffer(skuKey, avgCost, totalRemaining) {
  const [product, length, grade, origin] = skuKey.split('|');
  
  await createOffer({
    skuKey,
    product,
    length,
    grade,
    origin,
    askPrice: parseFloat(document.getElementById('m-askPrice').value) || 0,
    costBasis: avgCost,
    targetMargin: parseFloat(document.getElementById('m-margin').value) || 0,
    availableTLs: document.getElementById('m-availableTLs').value,
    availableUnits: totalRemaining,
    shipNotes: document.getElementById('m-shipNotes').value,
    freightAdder: document.getElementById('m-freightAdder').value,
    internalNotes: document.getElementById('m-internalNotes').value
  });
  
  closeModal();
}
